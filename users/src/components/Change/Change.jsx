import "./change.scss";
import { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Change = ({ setOpenChange, user }) => {
  const [texts, setTexts] = useState({
    email: user.email,
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (user) => {
      return makeRequest.put("/users/change-password", user);
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  useEffect(() => {
    // Reset các trường nhập liệu khi component được mount
    setTexts({
      email: user.email,
      password: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [user]);

  const handleChange = (e) => {
    setTexts((prevTexts) => ({
      ...prevTexts,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!texts.password || !texts.newPassword || !texts.confirmPassword) {
      console.error("Cần điền đầy đủ thông tin mật khẩu.");
      toast.error("Cần điền đầy đủ thông tin mật khẩu.");
      return;
    }

    try {
      // Kiểm tra xem mật khẩu mới và mật khẩu xác nhận có khớp nhau không
      if (texts.newPassword !== texts.confirmPassword) {
        console.error("Mật khẩu mới và mật khẩu xác nhận không khớp.");
        // Xử lý lỗi, ví dụ, hiển thị thông báo lỗi
        toast.error("Mật khẩu mới và mật khẩu xác nhận không khớp.");
        return;
      }

      // Gọi API để thay đổi mật khẩu
      const { data } = await mutation.mutateAsync({
        password: texts.password,
        newPassword: texts.newPassword,
        confirmPassword: texts.confirmPassword,
      });

      console.log("Phản hồi từ API:", data); // Đã đổi mật khẩu thành công

      // Show toast notification
      toast.success("Đổi mật khẩu thành công!");

      // Close the form after a delay to allow the toast to be seen
      setTimeout(() => {
        setOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      // Xử lý lỗi, ví dụ, hiển thị thông báo lỗi
    }
  };

  return (
    <div className="change">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="wrapper">
        <h1>Đổi Mật Khẩu</h1>
        <form>
          <label>Email</label>
          <input
            type="text"
            value={texts.email}
            name="email"
            onChange={handleChange}
            disabled
          />
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={texts.password}
            name="password"
            onChange={handleChange}
          />
          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={texts.newPassword}
            name="newPassword"
            onChange={handleChange}
          />
          <label>Nhập lại mật khẩu</label>
          <input
            type="password"
            value={texts.confirmPassword}
            name="confirmPassword"
            onChange={handleChange}
          />
          <button onClick={handleClick}>Đổi mật khẩu</button>
        </form>
        <button className="close" onClick={() => setOpenChange(false)}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Change;
