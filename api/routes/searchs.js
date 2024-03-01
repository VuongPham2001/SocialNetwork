import express from "express";
import { SearchUser, SelectUser } from "../controllers/search.js";

const router = express.Router();

router.post("/", SearchUser);
router.post("/select", SelectUser);

export default router;
