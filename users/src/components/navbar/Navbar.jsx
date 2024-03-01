import "./navbar.scss";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";

const Navbar = ({ isChatPage, setIsChatPage }) => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  // useEffect(() => {
  //   // Kiểm tra xem giá trị của currentUser có thay đổi không
  //   console.log("CurrentUser updated:", currentUser);
  // }, [currentUser]); // Chỉ kích hoạt khi currentUser thay đổi

  const handleHomeClick = () => {
    setIsChatPage(false); // Chắc chắn set isChatPage thành false khi click vào Home
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link
          to="/"
          style={{ textDecoration: "none" }}
          onClick={handleHomeClick}
        >
          <img src={process.env.PUBLIC_URL + "/Logo.png"} alt="Logo" />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <div className="user">
          {/* Kiểm tra xem currentUser có tồn tại không trước khi truy cập thuộc tính */}
          {currentUser && currentUser.user && (
            <>
              <img src={currentUser.user.profilePic} alt="" />
              <span>{currentUser.user.displayName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
