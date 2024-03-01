import { useContext, useState } from "react";
import "./message.scss";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import DownloadIcon from "@mui/icons-material/Download";
import { Lightbox } from "react-modal-image";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  // console.log("currentUser:", currentUser);
  const { data } = useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);
  console.log("data:", data);
  // console.log("Message Data:", data.user);
  // console.log("Group Data:", data.groupId);

  const renderFile = (fileUrl, type, fileName) => {
    switch (type) {
      case "img":
      case "animatedImage":
        return (
          <>
            <div className="imageContainer">
              <img src={fileUrl} alt="" onClick={() => setIsOpen(true)} />
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="downloadIcon"
              >
                <DownloadIcon style={{ fontSize: "20px" }} />
              </a>
            </div>
            {isOpen && (
              <Lightbox
                medium={fileUrl}
                large={fileUrl}
                alt=""
                hideDownload={true}
                hideZoom={true}
                onClose={() => setIsOpen(false)}
              />
            )}
          </>
        );
      case "video":
        return <video controls src={fileUrl} />;
      case "file":
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fileLink"
          >
            {fileName}
            <DownloadIcon style={{ fontSize: "20px" }} />
          </a>
        );
      default:
        return null;
    }
  };

  const createdAtDate = new Date(
    message.createdAt.seconds * 1000 + message.createdAt.nanoseconds / 1000000
  );

  const hasText = message.text && message.text.trim().length > 0;

  const isOwner =
    data.groupId !== "null"
      ? message.sender.id === currentUser.user.id && "owner"
      : message.senderId === currentUser.user.id && "owner";

  const senderInfo = data.groupId !== "null" ? message.sender : data.user;

  return (
    <div className={`message ${isOwner}`}>
      <div className="messageInfo">
        {data.groupId !== "null" && <span>{message.sender.displayName}</span>}

        <img
          src={
            message.senderId === currentUser.user.id
              ? currentUser.user.profilePic
              : senderInfo.profilePic
          }
          alt=""
        />
        <span>
          {createdAtDate.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <div className="messageContent">
        {hasText && <p>{message.text}</p>}
        {message.img && renderFile(message.img, "img")}
        {message.animatedImage &&
          renderFile(message.animatedImage, "animatedImage")}
        {message.video && renderFile(message.video, "video")}
        {message.file && renderFile(message.file, "file", message.fileName)}
      </div>
    </div>
  );
};

export default Message;
