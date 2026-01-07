// backend/routes/chatRoutes.js
import express from "express";
import { sendMessage, getChats } from "../controllers/ChatController.js";
import {authMiddleware} from "../middlewares/Auth.js";

const router = express.Router();

router.post("/", authMiddleware(), sendMessage);         // kirim pesan ke AI
router.get("/:sessionId", authMiddleware(), getChats);   // ambil semua chat di 1 session

export default router;
