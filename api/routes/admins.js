import express from "express";
import {
  datatable,
  AdminDelete,
  getUserById,
  updateUserById,
} from "../controllers/admin.js";

const router = express.Router();

router.post("/data", datatable);
router.delete("/data/:id", AdminDelete);
router.get("/editU/:id", getUserById);
router.put("/updateU/:id", updateUserById);

export default router;
