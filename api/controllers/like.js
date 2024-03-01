import { db } from "../firebase/config.js";
import {
  getDocs,
  collection,
  query,
  where,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import jwt from "jsonwebtoken";
import { addDocument } from "../firebase/service.js";

export const getLikes = async (req, res) => {
  try {
    const postId = req.query.postId;
    // console.log("postDocId:", postDocId);

    const likesQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId)
    );
    const likesSnapshot = await getDocs(likesQuery);

    const users = [];

    for (const like of likesSnapshot.docs) {
      const userId = like.data().userId;
      // console.log(userId)
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        users.push({ id: userId, ...userDoc.data() });
      }
    }
    // console.log("users:", users);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(error);
  }
};

export const addLike = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");

    await addDocument("likes", {
      userId: userInfo.userDocId,
      postId: req.body.postId,
    });
    console.log("addDoc:", addDocument);

    return res.status(200).json("Post has been liked.");
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const deleteLike = async (req, res) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) return res.status(401).json("Not logged in!");
  
      const userInfo = jwt.verify(token, "secretkey");
  
      const postId = req.query.postId; // Thêm dòng này để lấy giá trị postId từ req.body
    //   console.log("postId:", postId); // Log giá trị postId
  
      const likesQuery = query(
        collection(db, "likes"),
        where("userId", "==", userInfo.userDocId),
        where("postId", "==", postId) // Sử dụng postId thay vì req.body.postId
      );
      const likesSnapshot = await getDocs(likesQuery);
  
      if (likesSnapshot.docs.length > 0) {
        const likeDoc = likesSnapshot.docs[0];
        await deleteDoc(likeDoc.ref);
      }
  
      return res.status(200).json("Post has been disliked.");
    } catch (error) {
      console.error("Error in deleteLike:", error); // Log lỗi
      return res.status(500).json(error);
    }
  };
  