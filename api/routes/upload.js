import express from "express";
import { uploadImageToStorage, createPost } from "../controllers/upload.js";

const router = express.Router();

router.get("/", uploadImageToStorage);
router.post("/upload", createPost);

export default router;
