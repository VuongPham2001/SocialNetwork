import {
  CalendarToday,
  LocationSearching,
  MailOutline,
  PermIdentity,
  PhoneAndroid,
  Publish,
  Male,
  Female,
} from "@mui/icons-material";

import { Link } from "react-router-dom";
import "./user.scss";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../axios";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { AuthContext } from "../../../context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const User = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const [texts, setTexts] = useState({
    displayName: "",
    email: "",
    phone: "",
    city: "",
    gender: "",
    birthday: "",
    isAdmin: "",
  });
  const [updatedData, setUpdatedData] = useState({
    displayName: "",
    email: "",
    phone: "",
    city: "",
    gender: "",
    birthday: "",
    isAdmin: "",
  });
  // const [isAdmin, setIsAdmin] = useState(texts.isAdmin);
  const [currentProfilePic, setCurrentProfilePic] = useState(texts.profilePic);

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
    setUpdatedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await makeRequest.get(`/admin/editU/${id}`);
        const userData = response.data.data;

        // Thiết lập giá trị của `texts` và `updatedData` sau khi dữ liệu được tải lên
        setTexts(userData);
        setUpdatedData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Bước 1: Upload hình ảnh lên Firebase Storage và lấy URL mới
      let profileUrl = texts.profilePic; // Giữ URL hiện tại nếu không có hình mới

      if (profile) {
        const uploadResponse = await upload(profile);
        profileUrl = uploadResponse.downloadURL;
        console.log("Profile URL:", profileUrl);
      }

      // Bước 2: Cập nhật dữ liệu sửa đổi vào state `texts`
      setTexts((prev) => ({
        ...prev,
        ...updatedData,
        profilePic: profileUrl, // Cập nhật URL hình ảnh mới vào state
      }));

      // Bước 3: Cập nhật dữ liệu mới lên Firestore
      await makeRequest.put(`/admin/updateU/${id}`, {
        ...updatedData,
        profilePic: profileUrl, // Cập nhật URL hình ảnh mới vào Firestore
      });

      // // Bước 4: Kiểm tra xem trường nào đã thay đổi và thông báo
      // for (let key in updatedData) {
      //   if (updatedData[key] !== texts[key]) {
      //     toast.success(` ${key} đã được cập nhật thành công!`);
      //   }
      // }

      toast.success("Cập nhật người dùng thành công!");

      console.log("Update successful");
    } catch (error) {
      toast.error("Cập nhật người dùng thất bại!");
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="edituser">
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/register">
          <button className="userAddButton">Create</button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img src={texts.profilePic} alt="" className="userShowImg" />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{texts.displayName}</span>
              {/* <span className="userShowUserTitle">Software Engineer</span> */}
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">{texts.displayName}</span>
            </div>
            <div className="userShowInfo">
              <CalendarToday className="userShowIcon" />
              <span className="userShowInfoTitle">
                {texts.birthday
                  ? format(new Date(updatedData.birthday), "dd/MM/yyyy")
                  : ""}
              </span>
            </div>
            <div className="userShowInfo">
              <span className="userShowIcon">
                {texts.gender === "Nam" ? <Male /> : <Female />}
              </span>
              <span className="userShowInfoTitle">{texts.gender}</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <PhoneAndroid className="userShowIcon" />
              <span className="userShowInfoTitle">{texts.phone}</span>
            </div>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{texts.email}</span>
            </div>
            <div className="userShowInfo">
              <LocationSearching className="userShowIcon" />
              <span className="userShowInfoTitle">{texts.city}</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm">
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <label>Username</label>
                <input
                  type="text"
                  value={updatedData.displayName}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="displayName"
                />
              </div>

              <div className="userUpdateItem">
                <label>Email</label>
                <input
                  type="text"
                  value={updatedData.email}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="email"
                />
              </div>
              <div className="userUpdateItem">
                <label>Phone</label>
                <input
                  type="text"
                  value={updatedData.phone}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="phone"
                />
              </div>
              <div className="userUpdateItem">
                <label>Address</label>
                <input
                  type="text"
                  value={updatedData.city}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="city"
                />
              </div>
            </div>

            <div className="userUpdateCenter">
              <div className="userUpdateItem">
                <label>Gender</label>
                <select
                  value={updatedData.gender}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="gender"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="userUpdateItem">
                <label>Admin</label>
                <select
                  value={updatedData.isAdmin}
                  className="userUpdateInput"
                  onChange={handleChange}
                  name="isAdmin"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="userUpdateItem">
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  name="birthday"
                  value={
                    updatedData.birthday
                      ? format(new Date(updatedData.birthday), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="userUpdateRight">
              <div className="userUpdateUpload">
                <img
                  className="userUpdateImg"
                  src={
                    profile
                      ? URL.createObjectURL(profile)
                      : currentProfilePic
                      ? "/upload/" + currentProfilePic
                      : "https://via.placeholder.com/150" // URL mặc định khi không có hình ảnh
                  }
                  alt=""
                />
                <label htmlFor="file">
                  <Publish className="userUpdateIcon" />
                </label>
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setProfile(e.target.files[0]);
                    setCurrentProfilePic(""); // Reset hình ảnh hiện tại khi người dùng chọn hình mới
                  }}
                />
              </div>
              <button className="userUpdateButton" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default User;
