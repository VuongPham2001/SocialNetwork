import express from "express";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import adminRoutes from "./routes/admins.js";
import searchRoutes from "./routes/searchs.js";
import chatRoutes from "./routes/chats.js";
import groupRoutes from "./routes/groups.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { uploadImageToStorage } from "./controllers/upload.js";
import multer from "multer";
import { Chatupload } from "./controllers/chatupload.js";

const app = express();
const upload = multer();

// Create server with http and socket.io
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  const chatId = socket.handshake.query.chatId;
  const groupId = socket.handshake.query.groupId; 
  if (chatId) socket.join(chatId);
  if (groupId) socket.join(groupId); 

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// Middlewares
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/groups", groupRoutes);

app.post("/api/chatupload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log("File information:", file);
    const downloadURL = await Chatupload(file);
    res.json({ downloadURL });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log("File information:", file);
    const downloadURL = await uploadImageToStorage(file);
    res.json({ downloadURL });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 8800;
server.listen(PORT, () => {
  // Change from app.listen to server.listen
  console.log(`API working on port ${PORT}`);
});
