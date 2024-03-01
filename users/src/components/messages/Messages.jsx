import { useContext, useEffect, useState, useRef } from "react";
import Message from "../message/Message";
import "./messages.scss";
import { ChatContext } from "../../context/chatContext";
import { makeRequest } from "../../axios";
import { io } from "socket.io-client";

const Messages = () => {
  const { data, dispatch } = useContext(ChatContext);
  console.log("Data from Messages:", data);
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!data || (!data.chatId && (!data.groupId || !data.groupId.id))) {
      return;
    }

    const socket = io("http://localhost:8800", {
      query: {
        chatId: data.chatId,
        groupId: data.groupId ? data.groupId.id : "null",
      },
    });

    socket.on("message", (message) => {
      if (data.chatId !== "null") {
        setChatMessages((messages) => [message, ...messages]);
      } else if (data.groupId && data.groupId.id) {
        setGroupMessages((messages) => [message, ...messages]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [data]);

  useEffect(() => {
    const socket = io("http://localhost:8800");

    socket.on("groupDeleted", (data) => {
      console.log("Nhóm đã bị xóa:", data);

      // Làm mới danh sách thành viên và tin nhắn
      setChatMessages([]);
      setGroupMessages([]);
      dispatch({ type: "DELETE_GROUP" });
    });

    return () => {
      socket.off("groupDeleted");
    };
  }, [dispatch]);

  useEffect(() => {
    if (!data || (!data.chatId && (!data.groupId || !data.groupId.id))) {
      return;
    }

    const fetchMessages = async () => {
      if (data.chatId !== "null") {
        const response = await makeRequest.get(`chats/message/${data.chatId}`);
        setChatMessages(response?.data || []);
      } else if (data.groupId && data.groupId.id) {
        const response = await makeRequest.get(
          `groups/message/${data.groupId.id}`
        );
        setGroupMessages(response?.data || []);
      }
    };

    fetchMessages();
  }, [data]);

  useEffect(() => {
    const socket = io("http://localhost:8800");

    socket.on("groupDeleted", (data) => {
      console.log("Group deleted:", data);

      setMessages([]);
    });

    return () => {
      socket.off("groupDeleted");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, groupMessages]);

  // console.log(messages);

  return (
    <div className="messages">
      {(data.chatId !== "null" ? chatMessages : groupMessages)
        .slice()
        .reverse()
        .map((m) => (
          <Message message={m} key={m.id} />
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
