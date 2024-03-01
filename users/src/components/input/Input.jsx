import "./input.scss";
import { useState, useContext, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Input = () => {
  const [desc, setDesc] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { data: Chatdata } = useContext(ChatContext);
  const [previewUrl, setPreviewUrl] = useState(null);

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/chatupload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleEmojiSelect = (e) => {
    console.log(e);
    if (e.unified) {
      const sym = e.unified.split("_");
      const codeArray = [];
      sym.forEach((el) => codeArray.push("0x" + el));
      const emoji = String.fromCodePoint(...codeArray);
      setDesc(desc + emoji);
    }
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSend = async () => {
    try {
      const trimmedDesc = desc.trim();
      if (!trimmedDesc && !file) {
        toast.error("Không thể gửi tin nhắn hoặc tập tin trống");
        console.log("Cannot send an empty message or file");
        return;
      }

      let ImgURL = "";
      let VideoURL = "";
      let FileURL = "";
      let AnimatedImageURL = "";
      let fileName = "";

      if (file) {
        const uploadedFileURL = await upload();
        const fileExtension = file.name.split(".").pop().toLowerCase();

        fileName = file.name;

        if (["png", "jpg", "jpeg"].includes(fileExtension)) {
          ImgURL = uploadedFileURL.downloadURL;
        } else if (fileExtension === "gif") {
          AnimatedImageURL = uploadedFileURL.downloadURL;
        } else if (
          fileExtension === "mp4" ||
          fileExtension === "avi" ||
          fileExtension === "mkv"
        ) {
          VideoURL = uploadedFileURL.downloadURL;
        } else if (
          ["docx", "pptx", "zip", "txt", "pdf"].includes(fileExtension)
        ) {
          FileURL = uploadedFileURL.downloadURL;
        }

        console.log("uploadedFileURL:", uploadedFileURL);
      }

      console.log("currentUser:", currentUser);

      const messageData = {
        text: trimmedDesc,
        img: ImgURL,
        video: VideoURL,
        file: FileURL,
        animatedImage: AnimatedImageURL,
        currentUser,
        chatId: Chatdata.chatId,
        user: Chatdata.user,
        groupId: Chatdata.groupId ? Chatdata.groupId.id : null,
        fileName: fileName,
      };

      if (Chatdata.chatId !== "null") {
        // Gửi tin nhắn trong phòng chat
        await makeRequest.post("chats/send", messageData);
      } else if (Chatdata.groupId ? Chatdata.groupId.id : null !== "null") {
        // Gửi tin nhắn trong nhóm
        await makeRequest.post("groups/send", messageData);
      }

      setDesc("");
      setPreviewUrl(null);
      setFile(null);
      setShowEmoji(false);

      ImgURL = "";
      VideoURL = "";
      FileURL = "";
      AnimatedImageURL = "";
      fileName = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="input">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="inputWrapper">
        <input
          type="text"
          placeholder="Aa "
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="emojiWrapper" onClick={() => setShowEmoji(!showEmoji)}>
          <AddReactionOutlinedIcon
            className={`emojiIcon ${showEmoji ? "active" : ""}`}
            onClick={() => setShowEmoji(!showEmoji)}
          />
          {showEmoji && (
            <div className="emote-picker" onClick={(e) => e.stopPropagation()}>
              <Picker
                data={data}
                emojiSize={20}
                emojiButtonSize={30}
                onEmojiSelect={handleEmojiSelect}
                maxFrequentRows={0}
              />
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="preview">
          {file && file.type.startsWith("image/") ? (
            <img src={previewUrl} alt="Preview" />
          ) : file && file.type.startsWith("video/") ? (
            <video src={previewUrl} controls />
          ) : null}
        </div>
      )}
      <div className="send">
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          accept=".png, .jpg, .jpeg, .gif, .mp4, .avi, .mkv, .docx, .pptx, .zip, .txt, .pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label htmlFor="file">
          <div className="item">
            <AttachFileIcon />
          </div>
        </label>

        <div className="item" onClick={handleSend}>
          <SendIcon />
        </div>
      </div>
    </div>
  );
};

export default Input;
