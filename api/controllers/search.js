import { db } from "../firebase/config.js";
import {
  getDocs,
  collection,
  query,
  where,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export const SearchUser = async (req, res) => {
  const { username } = req.body;

  try {
    // Tìm kiếm người dùng trong Firestore theo displayName
    const userCollection = collection(db, "users");
    const q = query(userCollection, where("displayName", "==", username));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ...

export const SelectUser = async (req, res) => {
  const { currentUser, selectedUser } = req.body;
  console.log("currentUser:", currentUser);
  console.log("selectedUser:", selectedUser);

  try {
    // Tạo combinedId bằng cách sắp xếp theo thứ tự từ điển và kết hợp id của currentUser và selectedUser
    const combinedId = [currentUser.id, selectedUser.id].sort().join("");

    // Kiểm tra xem có tài liệu chat nào tồn tại với combinedId không
    const chatDocRef = doc(db, "chats", combinedId);
    const chatDocSnapshot = await getDoc(chatDocRef);

    // Nếu không có, tạo mới một tài liệu chat với combinedId và mảng messages trống
    if (!chatDocSnapshot.exists()) {
      // Tạo một tài liệu chat mới với combinedId và mảng messages trống
      await setDoc(chatDocRef, { createdAt: serverTimestamp() });

      // Thêm cuộc trò chuyện mới vào mảng userChats của người dùng
      const userChatsRefCurrentUser = doc(db, "userChats", currentUser.id);
      const userChatsSnapshotCurrentUser = await getDoc(
        userChatsRefCurrentUser
      );

      // Thêm vào danh sách cuộc trò chuyện của người dùng hiện tại
      if (userChatsSnapshotCurrentUser.exists()) {
        const userChatsDataCurrentUser = userChatsSnapshotCurrentUser.data();

        // Kiểm tra xem cuộc trò chuyện đã tồn tại trong danh sách hay chưa
        const existingChatCurrentUser = userChatsDataCurrentUser[combinedId];

        if (!existingChatCurrentUser) {
          // Nếu chưa tồn tại, thêm vào danh sách cuộc trò chuyện của người dùng
          await setDoc(userChatsRefCurrentUser, {
            ...userChatsDataCurrentUser,
            [combinedId]: {
              userInfo: {
                id: selectedUser.id,
                displayName: selectedUser.displayName,
                profilePic: selectedUser.profilePic,
              },
              date: serverTimestamp(),
            },
          });
        }
      } else {
        // Nếu tài liệu userChats không tồn tại, tạo mới với thông tin cuộc trò chuyện
        await setDoc(userChatsRefCurrentUser, {
          [combinedId]: {
            userInfo: {
              id: selectedUser.id,
              displayName: selectedUser.displayName,
              profilePic: selectedUser.profilePic,
            },
            date: serverTimestamp(),
          },
        });
      }

      // Thêm cuộc trò chuyện mới vào mảng userChats của người dùng được chọn
      const userChatsRefSelectedUser = doc(db, "userChats", selectedUser.id);
      const userChatsSnapshotSelectedUser = await getDoc(
        userChatsRefSelectedUser
      );

      // Thêm vào danh sách cuộc trò chuyện của người dùng được chọn
      if (userChatsSnapshotSelectedUser.exists()) {
        const userChatsDataSelectedUser = userChatsSnapshotSelectedUser.data();

        // Kiểm tra xem cuộc trò chuyện đã tồn tại trong danh sách hay chưa
        const existingChatSelectedUser = userChatsDataSelectedUser[combinedId];

        if (!existingChatSelectedUser) {
          // Nếu chưa tồn tại, thêm vào danh sách cuộc trò chuyện của người dùng được chọn
          await setDoc(userChatsRefSelectedUser, {
            ...userChatsDataSelectedUser,
            [combinedId]: {
              userInfo: {
                id: currentUser.id,
                displayName: currentUser.displayName,
                profilePic: currentUser.profilePic,
              },
              date: serverTimestamp(),
            },
          });
        }
      } else {
        // Nếu tài liệu userChats không tồn tại, tạo mới với thông tin cuộc trò chuyện
        await setDoc(userChatsRefSelectedUser, {
          [combinedId]: {
            userInfo: {
              id: currentUser.id,
              displayName: currentUser.displayName,
              profilePic: currentUser.profilePic,
            },
            date: serverTimestamp(),
          },
        });
      }
    }

    // Trả về thành công nếu mọi thứ diễn ra đúng
    res.json({ success: true });
  } catch (error) {
    console.error("Error selecting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
