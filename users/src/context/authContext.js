import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    try {
      console.log("Sending request to server:", inputs);
      const res = await axios.post(
        "http://localhost:8800/api/auth/login",
        inputs,
        {
          withCredentials: true,
        }
      );
      console.log("User data from login:", res.data);
      setCurrentUser(res.data);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (newUserInfo) => {
    setCurrentUser((prevUser) => ({
      ...prevUser,
      user: {
        ...prevUser.user,
        ...newUserInfo,
      },
    }));
  };

  const logout = async () => {
    try {
      // Gọi API để đăng xuất, trong trường hợp này bạn sẽ gọi API tới endpoint logout của server
      await axios.post("http://localhost:8800/api/auth/logout", null, {
        withCredentials: true,
      });

      // Xóa người dùng khỏi local storage và đặt currentUser thành null
      localStorage.removeItem("user");
      setCurrentUser(null);
      return null; // Đảm bảo rằng hàm logout luôn trả về null
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      return error;
    }
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
    // console.log("Updated currentUser:", currentUser);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
