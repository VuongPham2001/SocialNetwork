import { db } from "../firebase/config.js";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import jwt from "jsonwebtoken";
import { addDocument } from "../firebase/service.js";

export const getComments = async (req, res) => {
  try {
    const postId = req.query.postId;
    // console.log("postDocId:", postId);

    // const postRef = doc(db, "posts", postIdParam);
    // // Lấy document ID của postRef
    // const postId = postRef.id;

    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const comments = [];
    for (const docRef of querySnapshot.docs) {
      const commentData = docRef.data();

      // Retrieve user data for the commentcomc
      const userId = commentData.userId;
      const userDoc = await getDoc(doc(collection(db, "users"), userId));
      const userData = userDoc.data();

      const commentWithUserData = {
        desc: commentData.desc,
        createdAt: commentData.createdAt,
        userId: userDoc.id,
        displayName: userData.displayName,
        profilePic: userData.profilePic,
      };

      // // Console log để kiểm tra dữ liệu
      // console.log("commentWithUserData:", commentWithUserData);

      comments.push(commentWithUserData);
    }

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message || "Lỗi máy chủ nội bộ");
  }
};

export const addComment = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập!");

    const userInfo = jwt.verify(token, "secretkey");
    console.log("userInfo:", userInfo);

    const { desc, postId } = req.body; // Lấy giá trị desc từ req.body
    // Kiểm tra xem desc có chứa chỉ khoảng trắng không
    if (desc.trim() === "") {
      return res.status(400).json("Nội dung comment không được để trống.");
    }

    const addedComment = await addDocument("comments", {
      desc,
      userId: userInfo.userDocId,
      postId,
    });

    console.log("Added Comment:", addedComment);

    return res.status(200).json("Đã tạo bình luận.");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message || "Lỗi máy chủ nội bộ");
  }
};
