import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDI43eO90TrUFUxLwiKlHEtRU1qxaTWSc",
  authDomain: "socialnetwork-95101.firebaseapp.com",
  projectId: "socialnetwork-95101",
  storageBucket: "socialnetwork-95101.appspot.com",
  messagingSenderId: "795327517553",
  appId: "1:795327517553:web:1fa5073f20ed17bcf65cd0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Tạo tài khoản người dùng mới
const createUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user.uid;
};

// Đăng nhập người dùng
const signInEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { app, auth, createUser, signInEmail, storage, db };
