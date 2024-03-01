import { db, auth } from "../firebase/config.js";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";

export const datatable = async (req, res) => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersData = usersSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    res.status(200).json({ success: true, data: usersData });
  } catch (error) {
    console.error("Error fetching data from Firestore: ", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const AdminDelete = async (req, res) => {
  try {
    const uid = req.params.id;
    console.log(uid);

    // Tìm document có trường id (assumed as the document key) bằng giá trị uid
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Nếu document tồn tại, xóa document
      await deleteDoc(userDocRef);

      // // Xóa người dùng từ Authentication
      // await deleteUser(auth, uid);

      res
        .status(200)
        .json({ success: true, message: "Xóa người dùng thành công" });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Người dùng không tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi xóa người dùng: ", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const uid = req.params.id;
    // console.log(uid)
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = {
        ...userDoc.data(),
        id: userDoc.id,
      };
      res.status(200).json({ success: true, data: userData });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Người dùng không tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng: ", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const uid = req.params.id;
    console.log(uid);
    const userDataToUpdate = req.body; // Dữ liệu người dùng cần cập nhật
    console.log(userDataToUpdate);

    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Nếu document tồn tại, cập nhật dữ liệu
      await updateDoc(userDocRef, userDataToUpdate);

      res
        .status(200)
        .json({ success: true, message: "Cập nhật người dùng thành công" });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Người dùng không tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng: ", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
  }
};
