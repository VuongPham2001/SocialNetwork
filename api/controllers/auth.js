import bcrypt from "bcrypt";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { db, createUser } from "../firebase/config.js";
import { addDocument } from "../firebase/service.js";
import { collection, where, getDocs, query } from "firebase/firestore";

// Hàm kiểm tra xem người dùng đã tồn tại hay chưa
const isUserExists = async (email) => {
  const usersCollection = collection(db, "users");
  const userQuery = query(usersCollection, where("email", "==", email));
  const userQuerySnapshot = await getDocs(userQuery);
  return !userQuerySnapshot.empty;
};

export const register = (req, res) => {
  const { email, password, displayName, isAdmin, gender, phone } = req.body;

  // Băm mật khẩu trước khi đăng ký
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
    if (err) {
      return res.status(500).json(err.message);
    }

    try {
      // Sử dụng transaction để kiểm tra xem email đã tồn tại chưa
      const userExists = await isUserExists(email);

      if (userExists) {
        return res.status(400).json("Email đã tồn tại.");
      }

      // Nếu email chưa tồn tại, thêm người dùng mới
      const uid = await createUser(email, password);

      await addDocument("users", {
        email: email,
        password: hashedPassword, // Lưu mật khẩu băm
        displayName: displayName,
        phone: phone || "",
        gender: gender || "",
        isAdmin: isAdmin || false, //mặc định là false nếu không được chọn
        uid: uid, // Thêm UID vào tài liệu Firestore
      });

      return res.status(200).json("Người dùng tạo thành công.");
    } catch (error) {
      return res.status(500).json(error.message);
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Email và mật khẩu là bắt buộc.");
  }

  try {
    const usersCollection = collection(db, "users");
    const emailQuery = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);

    // Kiểm tra xem email có tồn tại trong Firestore hay không
    if (querySnapshot.empty) {
      return res
        .status(404)
        .json({ error: "Email không tồn tại trong hệ thống." });
    }

    const userData = querySnapshot.docs[0].data();
    const documentId = querySnapshot.docs[0].id;

    const isPasswordValid = await compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json("Sai mật khẩu");
    }

    const token = jwt.sign(
      { userDocId: documentId, email: email },
      "secretkey"
    );

    // Trả về dữ liệu người dùng cùng với token
    const user = { ...userData, id: documentId };

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ user });
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error);
    res.status(500).json("Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
};

export const logout = async (req, res) => {
  try {
    // Xóa accessToken từ phần cookies
    res.clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    });

    // Phản hồi về trạng thái đăng xuất
    res.status(200).json("Người dùng đã đăng xuất.");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).json(error.message);
  }
};
