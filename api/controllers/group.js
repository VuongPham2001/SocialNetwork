import { db } from "../firebase/config.js";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  Timestamp,
  deleteField,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { io } from "../index.js";
import { addDocument, generateKeywords } from "../firebase/service.js";

export const createGroup = async (req, res) => {
  const { groupName, members, admin } = req.body;

  try {
    const keywords = generateKeywords(groupName);
    const limitedKeywords = keywords.slice(0, 20);

    const docRef = await addDocument("groups", {
      groupName: groupName,
      keywords: limitedKeywords,
      admin: admin,
      members: members,
    });
    const groupId = docRef.id;
    await setDoc(doc(db, "groups", groupId), { id: groupId }, { merge: true });

    // Lấy thông tin của mỗi thành viên từ collection users
    const membersDetails = await Promise.all(
      members.map(async (memberId) => {
        const userDoc = await getDoc(doc(db, "users", memberId));
        const userData = userDoc.data();
        return {
          id: userData.id,
          displayName: userData.displayName,
          profilePic: userData.profilePic,
        };
      })
    );

    // Thêm thông tin thành viên vào mỗi id trong nhóm
    membersDetails.forEach((member) => {
      updateDoc(
        doc(db, "groups", groupId),
        {
          [`members.${member.id}`]: {
            displayName: member.displayName,
            profilePic: member.profilePic,
          },
        },
        { merge: true }
      );
    });

    io.emit("newGroup", {
      groupName: groupName,
      admin: admin,
      members: members,
    });

    res
      .status(200)
      .json({ message: "Nhóm đã được tạo thành công", groupId: docRef.id });
  } catch (error) {
    console.error("Lỗi khi tạo nhóm:", error.message);
    res.status(500).json({ error: "Lỗi Nội bộ của Máy chủ" });
  }
};

export const listGroups = async (req, res) => {
  const userId = req.body.userId;
  try {
    const querySnapshot = await getDocs(collection(db, "groups"));
    const userGroups = [];

    querySnapshot.forEach((doc) => {
      const groupData = doc.data();
      if (groupData.members && groupData.members[userId]) {
        userGroups.push(groupData);
      }
    });

    res.status(200).json(userGroups);
  } catch (error) {
    console.error("Lỗi khi liệt kê nhóm:", error.message);
    res.status(500).json({ error: "Lỗi Nội bộ của Máy chủ" });
  }
};

export const messages = async (req, res) => {
  const { groupId } = req.params;
  // console.log("Group ID:", groupId);

  try {
    const messagesSnapshot = await getDocs(
      collection(db, "groups", groupId, "messagesGroup")
    );
    let messagesGroup = messagesSnapshot.docs.map((doc) => doc.data());
    messagesGroup = messagesGroup.sort((a, b) => b.createdAt - a.createdAt); // Sắp xếp tin nhắn theo thời gian tạo
    res.json(messagesGroup);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  const { text, img, video, file, animatedImage, currentUser, groupId } =
    req.body;
  // console.log("Group ID:", groupId);

  try {
    const chatDoc = doc(db, "groups", groupId);
    const chatDocSnapshot = await getDoc(chatDoc);
    if (!chatDocSnapshot.exists()) {
      console.error("Chat document does not exist:", groupId);
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const newMessage = {
      id: uuid(),
      text,
      img: img || null,
      video: video || null,
      file: file || null,
      animatedImage: animatedImage || null,
      createdAt: Timestamp.now(),
      sender: {
        id: currentUser.user.id,
        displayName: currentUser.user.displayName,
        profilePic: currentUser.user.profilePic,
      },
    };

    await setDoc(doc(chatDoc, "messagesGroup", newMessage.id), newMessage);

    console.log("Group message", newMessage);
    io.to(groupId).emit("message", newMessage);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;
  // console.log("Member ID:", memberId);

  try {
    // Lấy thông tin của thành viên từ collection users
    const userDoc = await getDoc(doc(db, "users", memberId));
    if (!userDoc.exists()) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data();

    // Thêm thông tin thành viên vào nhóm
    await updateDoc(
      doc(db, "groups", groupId),
      {
        [`members.${memberId}`]: {
          displayName: userData.displayName,
          profilePic: userData.profilePic,
        },
      },
      { merge: true }
    );

    io.to(groupId).emit("memberAdded", { memberId, userData });

    res.status(200).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Error adding member:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMembers = async (req, res) => {
  const { groupId } = req.params;
  // console.log("Group ID get members:", groupId);

  try {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const groupData = groupDoc.data();
    const members = groupData.members;

    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting members:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMember = async (req, res) => {
  const { groupId } = req.params;
  const { memberId, adminId } = req.body;

  console.log("Group ID delete member:", groupId);
  console.log("Member ID delete member:", memberId);
  console.log("Admin ID delete member:", adminId);

  try {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (!groupDoc.exists()) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const groupData = groupDoc.data();

    // Kiểm tra xem người dùng hiện tại có phải là admin không
    if (groupData.admin !== adminId) {
      res
        .status(403)
        .json({ error: "Only the group admin can delete members" });
      return;
    }

    // Delete the member from the group
    await updateDoc(doc(db, "groups", groupId), {
      [`members.${memberId}`]: deleteField(),
    });

    io.to(groupId).emit("memberDeleted", { memberId });
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Delete the group
    await deleteDoc(doc(db, "groups", groupId));

    // Delete all messages related to the group
    const messagesSnapshot = await getDocs(
      collection(db, "groups", groupId, "messagesGroup")
    );
    messagesSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    io.emit("groupDeleted", { groupId });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
