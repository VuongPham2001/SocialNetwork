import "./leftBar.scss";
import BubbleChartOutlinedIcon from "@mui/icons-material/BubbleChartOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

const LeftBar = ({ isChatPage, setIsChatPage }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (currentUser) {
        await logout();
        setIsChatPage(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleAdminHomeClick = () => {
    setIsChatPage(true);
    navigate("/admin/data");
  };

  const handleHomeClick = () => {
    setIsChatPage(false);
    navigate("/");
  };

  const handleChatClick = () => {
    setIsChatPage(true);
    navigate("/chat");
  };

  const handleProfileClick = () => {
    setIsChatPage(false);
    navigate(`/profile/${currentUser.user.id}`);
  };
  useEffect(() => {
    // Kiểm tra xem giá trị của currentUser có thay đổi không
    console.log("CurrentUser updated:", currentUser);
  }, [currentUser]); // Chỉ kích hoạt khi currentUser thay đổ

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user" onClick={handleProfileClick}>
            {/* Kiểm tra xem currentUser có tồn tại không trước khi truy cập thuộc tính */}
            {currentUser && currentUser.user && (
              <img src={currentUser.user.profilePic} alt="" />
              /* <span>{currentUser.user.name}</span> */
            )}
          </div>
          <div className="item" onClick={handleHomeClick}>
            <HomeOutlinedIcon />
          </div>
          <div className="item" onClick={handleChatClick}>
            <BubbleChartOutlinedIcon />
          </div>
          {currentUser &&
            currentUser.user &&
            currentUser.user.isAdmin === "true" && (
              <div className="item" onClick={handleAdminHomeClick}>
                <SettingsOutlinedIcon />
              </div>
            )}

          <div className="item" onClick={handleLogout}>
            <ExitToAppOutlinedIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
