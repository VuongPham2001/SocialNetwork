import express from "express";
import {
  listChats,
  messages,
  sendMessage,
  deleteChat,
} from "../controllers/chat.js";

const router = express.Router();

router.post("/listChats", listChats);
router.get("/message/:chatId", messages);
router.post("/send", sendMessage);
router.delete("/deleteChat/:chatId", deleteChat);

export default router;
