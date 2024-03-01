import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config.js";

export const uploadImageToStorage = async (file) => {
  const metadata = {
    contentType: file.mimetype,
  };

  const storageRef = ref(storage, "images/" + file.originalname);
  const uploadTask = uploadBytesResumable(storageRef, file.buffer, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // console.log("Snapshot data:", snapshot);
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
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
