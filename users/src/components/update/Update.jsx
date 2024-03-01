import "./update.scss";
import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { format } from "date-fns";
import { AuthContext } from "../../context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Update = ({ setOpenUpdate, user }) => {
  const { updateUser } = useContext(AuthContext);
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [texts, setTexts] = useState({
    email: user.email,
    // password: user.password,
    displayName: user.displayName,
    birthday: user.birthday,
    city: user.city,
    website: user.website,
  });

  const upload = async (file) => {
    console.log(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Log dữ liệu trước khi gửi lên server
      console.log("FormData:", formData);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (user) => {
      return makeRequest.put("/users", user);
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // TODO: find a better way to get image URL
    let coverUrl;
    let profileUrl;

    try {
      coverUrl = cover ? await upload(cover) : null;
      profileUrl = profile ? await upload(profile) : null;

      // Log coverUrl and profileUrl
      console.log("Cover URL:", coverUrl);
      console.log("Profile URL:", profileUrl);

      // Mutate the data
      mutation.mutate({
        ...texts,
        // Chỉ truyền URL của hình ảnh, không chứa thuộc tính thừa
        coverPic: coverUrl ? coverUrl.downloadURL : user.coverPic,
        profilePic: profileUrl ? profileUrl.downloadURL : user.profilePic,
      });

      if (
        texts.displayName === user.displayName &&
        texts.birthday === user.birthday &&
        texts.city === user.city &&
        texts.website === user.website &&
        coverUrl === null &&
        profileUrl === null
      ) {
        toast.info("Không có gì thay đổi!");
        return;
      }

      toast.success("Cập nhật thông tin thành công!");

      setTimeout(() => {
        updateUser({
          profilePic: profileUrl ? profileUrl.downloadURL : user.profilePic,
          displayName: texts.displayName,
          coverPic: coverUrl ? coverUrl.downloadURL : user.coverPic,
          birthday: texts.birthday,
          city: texts.city,
          website: texts.website,
        });
      }, 3000);

      setCover(null);
      setProfile(null);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <div className="update">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="wrapper">
        <h1>Update Your Profile</h1>
        <form>
          <div className="files">
            <label htmlFor="cover">
              <span>Cover Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    cover
                      ? URL.createObjectURL(cover)
                      : "/upload/" + user.coverPic
                  }
                  alt=""
                />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="cover"
              style={{ display: "none" }}
              onChange={(e) => setCover(e.target.files[0])}
            />
            <label htmlFor="profile">
              <span>Profile Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    profile
                      ? URL.createObjectURL(profile)
                      : "/upload/" + user.profilePic
                  }
                  alt=""
                />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="profile"
              style={{ display: "none" }}
              onChange={(e) => setProfile(e.target.files[0])}
            />
          </div>
          <label>Email</label>
          <input
            type="text"
            value={texts.email}
            name="email"
            onChange={handleChange}
            disabled
          />
          <label>Ngày sinh</label>
          <input
            type="date"
            name="birthday"
            value={
              texts.birthday
                ? format(new Date(texts.birthday), "yyyy-MM-dd")
                : ""
            }
            onChange={handleChange}
          />
          <label>Name</label>
          <input
            type="text"
            value={texts.displayName}
            name="displayName"
            onChange={handleChange}
          />
          <label>Country / City</label>
          <input
            type="text"
            name="city"
            value={texts.city}
            onChange={handleChange}
          />
          <label>Website</label>
          <input
            type="text"
            name="website"
            value={texts.website}
            onChange={handleChange}
          />
          <button onClick={handleClick}>Update</button>
        </form>
        <button className="close" onClick={() => setOpenUpdate(false)}>
          Close
        </button>
      </div>
    </div>
  );
};
export default Update;
