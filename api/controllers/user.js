import { db } from "../firebase/config.js";
import {
  getDoc,
  doc,
  updateDoc,
  query,
  collection,
  getDocs,
  where,
} from "firebase/firestore";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { compare } from "bcrypt";

export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Giả sử 'users' là tên bảng trong Firestore
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const userData = userDoc.data();
    // Loại bỏ trường mật khẩu từ phản hồi
    const { password, ...info } = userData;

    return res.json(info);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Chưa xác thực!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token không hợp lệ!");
    console.log(userInfo);

    const userDocRef = doc(db, "users", userInfo.userDocId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(403).json("Không thể cập nhật thông tin người dùng!");
    }

    // Lấy thông tin người dùng hiện tại
    const currentUserData = userDoc.data();

    // Tạo đối tượng chứa các trường muốn cập nhật
    const updatedFields = {
      displayName: req.body.displayName || currentUserData.displayName,
      birthday: req.body.birthday || currentUserData.birthday,
      city: req.body.city || currentUserData.city,
      website: req.body.website || currentUserData.website,
      coverPic: req.body.coverPic || currentUserData.coverPic,
      profilePic: req.body.profilePic || currentUserData.profilePic,
    };

    // Cập nhật dữ liệu người dùng trong Firestore
    try {
      await updateDoc(userDocRef, updatedFields);

      // Update corresponding user information in the posts collection
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userInfo.userDocId)
      );
      const postsSnapshot = await getDocs(postsQuery);

      postsSnapshot.forEach(async (postDoc) => {
        await updateDoc(postDoc.ref, {
          "userData.displayName": updatedFields.displayName,
          "userData.profilePic": updatedFields.profilePic,
          //Thêm các trường khác nếu cần
        });
      });

      return res.json("Đã cập nhật!");
    } catch (updateError) {
      console.error("Update Error:", updateError);
      return res.status(500).json(updateError.message);
    }
  });
};

export const changePassword = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Chưa xác thực!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token không hợp lệ!");

    const userDocRef = doc(db, "users", userInfo.userDocId);
    console.log("userDocId:", userInfo.userDocId); // Log userDocId ở đây
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(403).json("Không thể cập nhật thông tin người dùng!");
    }
    // Log mật khẩu cũ và mật khẩu mới trước khi hash
    console.log("Mật khẩu cũ (trước khi hash):", req.body.password);
    console.log("Mật khẩu mới (trước khi hash):", req.body.newPassword);

    const userData = userDoc.data();

    // Kiểm tra xem mật khẩu cũ nhập vào có khớp với mật khẩu trong Firestore không
    const isPasswordValid = await compare(req.body.password, userData.password);

    if (!isPasswordValid) {
      return res.status(400).json("Mật khẩu cũ không đúng!");
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      req.body.newPassword,
      saltRounds
    );

    // Log mật khẩu cũ và mật khẩu mới sau khi hash
    console.log("Mật khẩu cũ (sau khi hash):", userData.password);
    console.log("Mật khẩu mới (sau khi hash):", hashedNewPassword);

    // Cập nhật mật khẩu mới vào Firestore
    try {
      await updateDoc(userDocRef, { password: hashedNewPassword });

      // // Tạo token mới với thông tin người dùng
      // const token = jwt.sign({ userDocId: userInfo.userDocId }, "secretkey", {
      //   expiresIn: "1h", // Thời gian sống của token mới
      // });

      // // Trả về token mới để cập nhật ở phía client
      // res.cookie("accessToken", token, { httpOnly: true });

      return res.json("Đã cập nhật mật khẩu!");
    } catch (updateError) {
      console.error("Update Error:", updateError);
      return res.status(500).json(updateError.message);
    }
  });
};
