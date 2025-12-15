// backend/middleware/Auth.js
import admin from "../config/Firebase.js";
import {User} from "../models/Models.js";


// backend/middleware/Auth.js
export const authMiddleware = async (req, res, next) => {
  console.log("🔍 Auth middleware triggered");
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No valid auth header");
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🎫 Token received (first 30 chars):", token.substring(0, 30) + "...");

  try {
    // Verify token dengan Firebase
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified for:", decoded.email);

    // Cari user di database
    let user = await User.findOne({ where: { firebase_uid: decoded.uid } });
    
    if (!user) {
      console.log("❌ User not found in DB:", decoded.email);
      // Jangan auto-create! Suruh frontend hit /sync dulu
      return res.status(401).json({ 
        message: "User not synced. Please call /users/sync first.",
        firebase_uid: decoded.uid 
      });
    }

    console.log("👤 User found:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};