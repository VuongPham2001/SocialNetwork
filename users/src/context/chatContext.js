import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./authContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const INITIAL_STATE = {
    chatId: "null",
    user: {},
    groupId: "null",
  };

  const chatReducer = (state, action) => {
    console.log("Reducer action:", action); // Thêm log để kiểm tra action
    switch (action.type) {
      case "CHANGE_USER":
        const chatId = [currentUser.user.id, action.payload.id].sort().join("");
        return {
          user: action.payload,
          chatId: chatId,
          groupId: "null",
        };

      case "CHANGE_GROUP_CHAT":
        return {
          user: {},
          chatId: "null",
          groupId: action.payload,
        };

      case "DELETE_GROUP":
        return {
          user: {},
          chatId: "null",
          groupId: "null",
        };
        

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
