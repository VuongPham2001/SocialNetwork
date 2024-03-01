import { useContext, useEffect, useState } from "react";
import "./search.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ListChats from "../listChats/ListChats";
import ListGroup from "../listGroup/ListGroup";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const [selectedBox, setSelectedBox] = useState("Hộp thư");
  const [showListChats, setShowListChats] = useState(true);
  const [selectedUserForChat, setSelectedUserForChat] = useState(null);

  const { currentUser } = useContext(AuthContext);

  // Xử lý khi người dùng thực hiện tìm kiếm
  const handleSearch = async () => {
    try {
      const response = await makeRequest.post("/search", { username });
      const foundUser = response.data[0];

      // Kiểm tra xem có người dùng nào được tìm thấy không
      if (foundUser) {
        setUser(foundUser);
        setErr(false);
      } else {
        setUser(null);
        setErr(true);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      setErr(true);
    }
  };

  // Xử lý khi người dùng chọn một người dùng
  const handleSelect = async () => {
    try {
      // Gửi yêu cầu chọn người dùng đến server
      const response = await makeRequest.post("/search/select", {
        currentUser: {
          id: currentUser.user.id,
          displayName: currentUser.user.displayName,
          profilePic: currentUser.user.profilePic,
        },
        selectedUser: user,
      });

      console.log("Selected User:", response.data);
      // Cập nhật state để thông báo rằng có một người dùng được chọn
      setSelectedUserForChat(user); // Thông báo cho component ListChats biết rằng có một người dùng được chọn
    } catch (error) {
      console.error("Lỗi khi chọn người dùng:", error);
    }

    setUser(null);
    setUsername("");
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleBoxClick = (boxType) => {
    setSelectedBox(boxType);
    // Kiểm tra loại hộp thư để hiển thị component tương ứng
    setShowListChats(boxType === "Hộp thư");
  };

  // Sử dụng useEffect để xác định hành động mặc định khi component được render
  useEffect(() => {
    // Thực hiện hành động mặc định ở đây, ví dụ: chọn "Hộp thư"
    handleBoxClick("Hộp thư");
  }, []); // Chạy chỉ một lần khi component được render

  return (
    <div className="search">
      <div className="searchForm">
        <div className="inputWrapper">
          <div className="iconWrapper">
            <SearchOutlinedIcon className="searchIcon" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="customInput"
            onKeyDown={handleKey}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
      </div>
      {err && <span>Người dùng không được tìm thấy!</span>}

      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.profilePic} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}

      <div className="box">
        <span
          onClick={() => handleBoxClick("Hộp thư")}
          className={selectedBox === "Hộp thư" ? "selected" : ""}
        >
          Hộp thư
        </span>
        <span
          onClick={() => handleBoxClick("Nhóm")}
          className={selectedBox === "Nhóm" ? "selected" : ""}
        >
          Nhóm
        </span>
      </div>

      {/* Hiển thị ListChats hoặc ListGroup dựa trên giá trị của showListChats */}
      {showListChats ? (
        <ListChats selectedUserForChat={selectedUserForChat} />
      ) : (
        <ListGroup />
      )}
    </div>
  );
};

export default Search;
