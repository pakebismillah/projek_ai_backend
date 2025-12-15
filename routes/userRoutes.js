// backend/routes/userRoutes.js
import express from "express";
import { syncUser, getProfile, getAllUsers } from "../controllers/UserController.js";
import { authMiddleware } from "../middlewares/Auth.js";
import { requireRole } from "../middlewares/roleMiddlewares.js";

const router = express.Router();

// endpoint: GET /users/me
router.get("/me", authMiddleware, getProfile);
// Sinkronisasi user dari Firebase
router.post("/sync", syncUser);

// endpoint: GET /users (hanya admin)
router.get("/", authMiddleware, requireRole(["admin"]), getAllUsers);


export default router;
