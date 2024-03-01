import { db } from "../firebase/config.js";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { io } from "../index.js";

export const listChats = async (req, res) => {
  const { currentUser } = req.body;
  // console.log("currentUser:", currentUser);
  let sentResponse = false; // Cờ để theo dõi xem phản hồi đã được gửi chưa

  try {
    const unsub = onSnapshot(doc(db, "userChats", currentUser), (doc) => {
      if (!sentResponse) {
        // console.log("listing chats from server:", doc.data());
        res.json(doc.data());
        sentResponse = true; // Đặt cờ thành true sau khi gửi phản hồi
      }
    });
  } catch (error) {
    console.error("Error listing chats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const messages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messagesSnapshot = await getDocs(
      collection(db, "chats", chatId, "messages")
    );
    let messages = messagesSnapshot.docs.map((doc) => doc.data());
    messages = messages.sort((a, b) => b.createdAt - a.createdAt); // Sắp xếp tin nhắn theo thời gian tạo
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  const {
    text,
    img,
    video,
    file,
    animatedImage,
    currentUser,
    user,
    fileName,
    chatId,
  } = req.body;
  // console.log("Chat ID:", chatId);

  try {
    const chatDoc = doc(db, "chats", chatId);
    const chatDocSnapshot = await getDoc(chatDoc);
    if (!chatDocSnapshot.exists()) {
      console.error("Chat document does not exist:", chatId);
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const newMessage = {
      id: uuid(),
      text,
      img: img || null,
      video: video || null,
      file: file || null,
      fileName: fileName || null,
      animatedImage: animatedImage || null,
      createdAt: Timestamp.now(),
      senderId: currentUser.user.id,
      displayName: currentUser.user.displayName,
    };

    await setDoc(doc(chatDoc, "messages", newMessage.id), newMessage);

    console.log("Emitting message", newMessage);
    io.to(chatId).emit("message", newMessage);

    // Cập nhật trường lastMessage trong userChats cho cả người dùng hiện tại và người nhận tin nhắn
    const updateLastMessage = async (userId) => {
      await updateDoc(doc(db, "userChats", userId), {
        [chatId + ".lastMessage"]: {
          text,
        },
        [chatId + ".date"]: serverTimestamp(),
      });
    };

    await updateLastMessage(currentUser.user.id);
    await updateLastMessage(user.id);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Xóa chat từ collection "chats"
    await deleteDoc(doc(db, "chats", chatId));

    // Xóa các tin nhắn trong cuộc trò chuyện
    const messagesSnapshot = await getDocs(
      collection(db, "chats", chatId, "messages")
    );
    messagesSnapshot.docs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Xóa thông tin cuộc trò chuyện từ collection "userChats" cho mỗi người dùng
    const userChatsSnapshot = await getDocs(collection(db, "userChats"));
    userChatsSnapshot.docs.forEach(async (doc) => {
      const userChatsData = doc.data();

      // Kiểm tra xem chatId có trong userChats không
      if (userChatsData[chatId]) {
        // Xóa chatId từ userChats
        delete userChatsData[chatId];

        // Cập nhật lại userChats
        await setDoc(doc.ref, userChatsData);
      }
    });

    // Thông báo cho client rằng chat đã bị xóa
    io.emit("chatDeleted", { chatId });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
