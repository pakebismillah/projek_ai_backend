// backend/routes/sessionRoutes.js
import express from "express";
import { 
  createSession, 
  getSessions, 
  getSessionById, 
  updateSession,
  deleteSession 
} from "../controllers/SessionController.js";
import { authMiddleware } from "../middlewares/Auth.js";

const router = express.Router();

// semua route session butuh login dulu
router.post("/", authMiddleware, createSession);      // buat session baru
router.get("/", authMiddleware, getSessions);         // ambil semua session
router.get("/:id", authMiddleware, getSessionById);   // ambil detail session
router.put("/:id", authMiddleware, updateSession);    // update session
router.delete("/:id", authMiddleware, deleteSession); // hapus session

export default router;
  