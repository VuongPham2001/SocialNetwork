import { useContext, useEffect, useState } from "react";
import "./listChats.scss";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { io } from "socket.io-client";

const ListChats = ({ selectedUserForChat }) => {
  const [listChats, setListChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const fetchData = async () => {
      console.log("currentUser:", currentUser.user.id);
      try {
        const response = await makeRequest.post("/chats/listChats", {
          currentUser: currentUser.user.id,
        });
        console.log("ListChats response:", response.data);
        setListChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    currentUser && fetchData();
  }, [currentUser, selectedUserForChat]);

  // console.log("listchat from client:", listChats);

  // Hàm lắng nghe sự kiện khi chat bị xóa
  useEffect(() => {
    const socket = io("http://localhost:8800");

    const handleChatDeleted = ({ chatId }) => {
      // Cập nhật trạng thái danh sách chat khi có sự kiện chatDeleted
      setListChats((prevChats) => {
        // Lọc ra các cuộc trò chuyện không phải là chatId
        const updatedChats = Object.fromEntries(
          Object.entries(prevChats).filter(([key, value]) => key !== chatId)
        );
        return updatedChats;
      });
    };

    socket.on("chatDeleted", handleChatDeleted);

    return () => {
      socket.off("chatDeleted", handleChatDeleted);
    };
  }, []);

  const handleSelect = (u) => {
    console.log("Selected user:", u);
    dispatch({ type: "CHANGE_USER", payload: u });
  };
  console.log("object", Object.entries(listChats));

  return (
    <div className="listChats">
      {Object.entries(listChats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => (
          <div
            className="userChat"
            key={chat[0]}
            onClick={() => handleSelect(chat[1].userInfo)}
          >
            <img src={chat[1].userInfo.profilePic} alt="" />
            <div className="userChatInfo">
              <span>{chat[1].userInfo.displayName}</span>
              {/* <p>{chat[1].lastMessage?.text}</p> */}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ListChats;
