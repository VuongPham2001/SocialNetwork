import express from "express";
import { Chatupload } from "../controllers/chatupload.js";

const router = express.Router();

router.post("/chatupload", Chatupload);

export default router;
