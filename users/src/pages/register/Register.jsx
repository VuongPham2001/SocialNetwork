import "./register.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Register = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    displayName: "",
    phone: "",
    gender: "",
    isAdmin: "false",
  });
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /@missa\.com$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    if (e.target.name === "isAdmin") {
      setInputs((prev) => ({
        ...prev,
        isAdmin: e.target.value === "yes" ? "true" : "false", // Chuyển đổi giá trị "yes" thành "true" và "no" thành "false"
      }));
    } else {
      setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Kiểm tra xem tất cả các trường input có được điền đầy đủ hay không
    for (let key in inputs) {
      if (inputs[key] === "") {
        toast.error(
          `${key.charAt(0).toUpperCase() + key.slice(1)} không được để trống.`
        );
        return;
      }
    }

    // Kiểm tra độ dài của mật khẩu
    if (inputs.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      if (!validateEmail(inputs.email)) {
        toast.error(
          "Định dạng email không hợp lệ. Vui lòng sử dụng địa chỉ email @missa.com."
        );
        return;
      }

      await axios.post("http://localhost:8800/api/auth/register", inputs);
      toast.success("Người dùng đã được tạo thành công!");
      setTimeout(() => {
        navigate("/admin/data");
      }, 2500);
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Missa Social.</h1>
          <p>
            Mạng xã hội doanh nghiệp của AMIS là một nền tảng mạng xã hội nội bộ
            thiết kế đặc biệt để tạo ra một không gian truyền thông tích cực và
            hiệu quả cho cộng đồng nội bộ của doanh nghiệp. Với sứ mệnh xây dựng
            và phát triển văn hóa doanh nghiệp, AMIS tập trung vào việc cung cấp
            một trải nghiệm truyền thông tích cực và sâu sắc cho nhân viên và
            các thành viên trong tổ chức.
          </p>
          <Link to="/admin/data">
            <button>Back</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            <label>Username</label>
            <input
              type="text"
              placeholder="Name"
              name="displayName"
              onChange={handleChange}
            />
            <label>Phone</label>
            <input
              type="text"
              placeholder="+84"
              name="phone"
              onChange={handleChange}
            />

            <div className="gender">
              <label>Gender</label>
              <input
                type="radio"
                name="gender"
                id="male"
                value="Nam"
                onChange={handleChange}
              />
              <label htmlFor="male">Nam</label>
              <input
                type="radio"
                name="gender"
                id="female"
                value="Nữ"
                onChange={handleChange}
              />
              <label htmlFor="female">Nữ</label>
            </div>

            <div className="yes-no">
              <label>Admin</label>
              <select name="isAdmin" onChange={(e) => handleChange(e)}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <button onClick={handleClick}>Register</button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};
