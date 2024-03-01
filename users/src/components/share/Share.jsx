import "./share.scss";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");

  const [showEmoji, setShowEmoji] = useState(false);

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  // Mutation
  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    let ImgURL = "";
    if (file) {
      ImgURL = await upload();
    }
    console.log("ImgURL:", ImgURL);

    // Check if imgURL is not null and update the img field without "downloadURL"
    mutation.mutate({
      desc,
      img: ImgURL ? ImgURL.downloadURL : null,
    });
    setDesc("");
    setFile(null);
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

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            {currentUser && currentUser.user && currentUser.user.profilePic && (
              <img src={currentUser.user.profilePic} alt="" />
            )}
            <input
              type="text"
              placeholder={`${currentUser?.user?.displayName} ơi, bạn đang nghĩ gì thế ?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {file && (
              <img className="file" alt="" src={URL.createObjectURL(file)} />
            )}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <AddPhotoAlternateOutlinedIcon />
                <span>Ảnh/Video</span>
              </div>
            </label>
            <div className="item">
              <AddLocationAltOutlinedIcon />
              <span>Check in</span>
            </div>
            <div className="item">
              <PersonAddAltOutlinedIcon />
              <span>Gắn thẻ</span>
            </div>

            <div className="item" onClick={() => setShowEmoji(!showEmoji)}>
              <AddReactionOutlinedIcon />
              {showEmoji && (
                <div
                  className="emote-picker"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Picker
                    data={data}
                    emojiSize={20}
                    emojiButtonSize={30}
                    onEmojiSelect={handleEmojiSelect}
                    maxFrequentRows={0}
                  />
                </div>
              )}
              <span>Emotion</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Đăng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
