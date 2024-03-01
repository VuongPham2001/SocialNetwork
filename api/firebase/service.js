import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config.js";

export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });

  // Lấy thông tin chi tiết của comment vừa thêm
  const newCommentDoc = await getDoc(docRef);
  const newCommentData = newCommentDoc.data();

  // Trả về thông tin của comment
  return {
    ...newCommentData,
    id: newCommentDoc.id,
    docRef,
  };
};

export const updateDocument = async (collectionName, data) => {
  const docRef = doc(db, collectionName); // Tạo tham chiếu đến tài liệu cần cập nhật
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const generateKeywords = (displayName) => {
  // liet ke tat cac hoan vi. vd: name = ["David", "Van", "Teo"]
  // => ["David", "Van", "Teo"], ["David", "Teo", "Van"], ["Teo", "David", "Van"],...
  const name = displayName.split(" ").filter((word) => word);

  const length = name.length;
  let flagArray = [];
  let result = [];
  let stringArray = [];

  /**
   * khoi tao mang flag false
   * dung de danh dau xem gia tri
   * tai vi tri nay da duoc su dung
   * hay chua
   **/
  for (let i = 0; i < length; i++) {
    flagArray[i] = false;
  }

  const createKeywords = (name) => {
    const arrName = [];
    let curName = "";
    name.split("").forEach((letter) => {
      curName += letter;
      arrName.push(curName);
    });
    return arrName;
  };

  function findPermutation(k) {
    for (let i = 0; i < length; i++) {
      if (!flagArray[i]) {
        flagArray[i] = true;
        result[k] = name[i];

        if (k === length - 1) {
          stringArray.push(result.join(" "));
        }

        findPermutation(k + 1);
        flagArray[i] = false;
      }
    }
  }

  findPermutation(0);

  const keywords = stringArray.reduce((acc, cur) => {
    const words = createKeywords(cur);
    return [...acc, ...words];
  }, []);

  return keywords;
};
