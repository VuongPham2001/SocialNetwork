import express from "express";
import {
  createGroup,
  listGroups,
  messages,
  sendMessage,
  addMember,
  getMembers,
  deleteMember,
  deleteGroup,
} from "../controllers/group.js";

const router = express.Router();

router.post("/group", createGroup);
router.post("/listGroups/:groupId", listGroups);
router.get("/message/:groupId", messages);
router.post("/send", sendMessage);
router.post("/addMember/:groupId", addMember);
router.get("/members/:groupId", getMembers);
router.post("/deleteMember/:groupId", deleteMember);
router.delete("/deleteGroup/:groupId", deleteGroup);

export default router;
