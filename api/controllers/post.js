import { db } from "../firebase/config.js";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { addDocument } from "../firebase/service.js";
import jwt from "jsonwebtoken";

const getUserInfo = async (token) => {
  try {
    const userInfo = jwt.verify(token, "secretkey");
    console.log("Decoded UserInfo:", userInfo);

    // Kiểm tra xem userInfo tồn tại và có chứa trường email không
    if (userInfo && userInfo.email) {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", userInfo.email)
      );

      const userQuerySnapshot = await getDocs(userQuery);

      // Kiểm tra xem có tài liệu nào hay không
      if (userQuerySnapshot.docs.length > 0) {
        // Lấy nội dung của tài liệu
        const userData = userQuerySnapshot.docs[0].data();
        console.log("userData:", userData);
        const isAdmin = userData.isAdmin === "true";

        // Trả về thông tin của người dùng bao gồm documentId và nội dung của tài liệu
        return {
          userInfo,
          documentId: userQuerySnapshot.docs[0].id,
          isAdmin,
          userData,
        };
      } else {
        throw new Error("User not found");
      }
    } else {
      throw new Error("Email is missing in user information.");
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Invalid user information.");
  }
};

export const getPosts = async (req, res) => {
  const token = req.cookies.accessToken;

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!token) return res.status(401).json("Not logged in!");

  try {
    let postQuery;

    // Nếu userId được truyền vào, thì chỉ lấy bài đăng của người dùng đó
    if (req.query.userId) {
      postQuery = query(
        collection(db, "posts"),
        where("userId", "==", req.query.userId), // Sửa đoạn này để truy vấn theo userId
        orderBy("createdAt", "desc")
      );
    } else {
      // Ngược lại, lấy tất cả bài đăng
      postQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(postQuery);

    const data = querySnapshot.docs.map((doc) => {
      const post = doc.data();
      return {
        id: doc.id,
        ...post,
      };
    });

    if (data.length === 0) {
      return res.status(200).json("No posts found");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message || "Internal Server Error");
  }
};

export const addPost = async (req, res) => {
  const token = req.cookies.accessToken;

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const { documentId, userData } = await getUserInfo(token);

    const { desc, img } = req.body;

    // Kiểm tra xem req.body.desc có giá trị không
    if (desc === undefined || desc.trim() === "") {
      return res
        .status(400)
        .json("Description is required for creating a post.");
    }

    const imgURL = img;

    console.log("Request Body:", req.body); // Log giá trị của req.body
    console.log("img:", img); // Log giá trị của img
    console.log("downloadURL:", imgURL); // Log giá trị của imageUrl

    console.log("Adding document to Firestore...");
    await addDocument("posts", {
      desc,
      img: imgURL || null, // Sử dụng giá trị của req.body.img nếu có, nếu không sẽ là null
      userId: documentId,
      userData: {
        displayName: userData.displayName,
        email: userData.email,
        profilePic: userData.profilePic,
        isAdmin: userData.isAdmin,
      },
    });
    console.log("Document added successfully.");

    return res.status(200).json("Post has been created.");
  } catch (error) {
    console.error("Error adding post:", error);
    return res.status(500).json(error.message || "Internal Server Error");
  }
};

export const deletePost = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Chưa đăng nhập!");

  try {
    const { documentId, isAdmin } = await getUserInfo(token);
    console.log("isAdmin:", isAdmin);

    const postDocRef = doc(db, "posts", req.params.id);
    const postDocSnapshot = await getDoc(postDocRef);

    if (postDocSnapshot.exists()) {
      const postData = postDocSnapshot.data();
      console.log("postData.userId:", postData.userId);
      console.log("documentId:", documentId);
      
      if (postData.userId === documentId || isAdmin) {
        // Xóa bài đăng
        await deleteDoc(postDocRef);

        // Xóa likes liên quan
        const likeQuery = query(
          collection(db, "likes"),
          where("postId", "==", req.params.id)
        );
        const likeQuerySnapshot = await getDocs(likeQuery);

        if (!likeQuerySnapshot.empty) {
          const deleteLikesPromises = likeQuerySnapshot.docs.map((likeDoc) => {
            return deleteDoc(likeDoc.ref);
          });

          await Promise.all(deleteLikesPromises);
        }

        // Xóa comments liên quan
        const commentQuery = query(
          collection(db, "comments"),
          where("postId", "==", req.params.id)
        );
        const commentQuerySnapshot = await getDocs(commentQuery);

        if (!commentQuerySnapshot.empty) {
          const deleteCommentsPromises = commentQuerySnapshot.docs.map(
            (commentDoc) => {
              return deleteDoc(commentDoc.ref);
            }
          );

          await Promise.all(deleteCommentsPromises);
        }

        return res
          .status(200)
          .json("Bài đăng và dữ liệu liên quan đã được xóa.");
      } else {
        return res
          .status(403)
          .json("Không được phép: Bài đăng không thuộc về người dùng.");
      }
    } else {
      return res.status(404).json("Không tìm thấy bài đăng");
    }
  } catch (err) {
    console.error(err);
    return res.status(403).json("Token không hợp lệ!");
  }
};
