import "./chat.scss";
import SideBar from "../../components/sideBar/SideBar";
import Conversations from "../../components/conversations/Conversations";
import InfoGroup from "../../components/InfoGroup/InfoGroup";
import { useState } from "react";

const Chat = () => {
  const [showInfoGroup, setShowInfoGroup] = useState(false);

  const toggleInfoGroup = () => {
    setShowInfoGroup((prevShowInfoGroup) => !prevShowInfoGroup);
  };
  return (
    <div className="chat">
      <div className="container">
        <SideBar />
        <Conversations onMoreIconClick={toggleInfoGroup} />
        {showInfoGroup && <InfoGroup />}
      </div>
    </div>
  );
};

export default Chat;

// const initialShowInfoGroup = localStorage.getItem("showInfoGroup") === "true";
// const [showInfoGroup, setShowInfoGroup] = useState(initialShowInfoGroup);

// useEffect(() => {
//   localStorage.setItem("showInfoGroup", showInfoGroup);
// }, [showInfoGroup]);
