import { useContext, useEffect } from "react";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { currentUser, login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handLogin = async (e) => {
    e.preventDefault();

    if (!inputs.email) {
      toast.error("Email không được để trống.");
      return;
    }

    if (!inputs.password) {
      toast.error("Mật khẩu không được để trống.");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /@missa\.com$/;
    if (!emailRegex.test(inputs.email)) {
      toast.error(
        "Định dạng email không hợp lệ. Vui lòng sử dụng địa chỉ email @missa.com."
      );
      return;
    }

    try {
      // Gọi hàm login từ AuthContext
      await login(inputs);
      toast.success("Đăng nhập thành công!");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        toast.error("Tài khoản không tồn tại trong hệ thống.");
      } else {
        toast.error("Sai email hoặc mật khẩu. Vui lòng thử lại.");
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      setTimeout(() => {
        navigate("/");
      }, 2500);
    }
  }, [currentUser, navigate]);

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Missa Social</h1>
          <p>
            Cùng nhau xây dựng văn hóa cho doanh nghiệp của bạn ngay hôm nay với
            Missa Social - Mạng xã hội doanh nghiệp.
          </p>
          {/* <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link> */}
        </div>
        <div className="right">
          <h1>Login</h1>
          <form>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input  
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            <button onClick={handLogin}>Login</button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};
