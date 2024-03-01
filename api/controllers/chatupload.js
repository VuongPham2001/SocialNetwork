import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config.js";
import iconv from "iconv-lite";

export const Chatupload = (file) => {
  return new Promise((resolve, reject) => {
    const metadata = {
      contentType: file.mimetype,
    };
    const originalname = iconv.decode(
      Buffer.from(file.originalname, "binary"),
      "utf8"
    );
    const fileRef = ref(storage, `messages/${originalname}`);
    const uploadTask = uploadBytesResumable(fileRef, file.buffer, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading file:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          resolve(downloadURL);
        } catch (downloadError) {
          console.error("Error getting download URL:", downloadError);
          reject(downloadError);
        }
      }
    );
  });
};
