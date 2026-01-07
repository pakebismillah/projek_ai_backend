// backend/middleware/Auth.js
import admin from "../config/Firebase.js";
import models from "../models/Models.js";
const { User } = models;


export const authMiddleware = (options = {}) => async (req, res, next) => {
  console.log(`\n\n--- 🛡️ AUTH MIDDLEWARE @ ${new Date().toLocaleTimeString()} ---`);
  console.log(`➡️  Route: ${req.method} ${req.originalUrl}`);
  console.log("⚙️  Options:", options);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❗️ [401] No valid 'Bearer' token in authorization header.");
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 Token received (first 30 chars):", token.substring(0, 30) + "...");

  try {
    // 1. Verify token dengan Firebase Admin
    console.log("... Verifying token with Firebase Admin...");
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified successfully for email:", decodedToken.email);
    console.log("   firebase_uid:", decodedToken.uid);

    // 2. Cari user di database lokal
    console.log(`... Searching for user in local DB with firebase_uid: ${decodedToken.uid}`);
    let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });

    // 3. Log hasil pencarian user
    if (user) {
      console.log("✅ User FOUND in local DB:", user.toJSON());
    } else {
      console.log("⚠️ User NOT FOUND in local DB.");
    }

    // 4. Cek apakah user wajib ada di DB
    if (!user && !options.allowUnsynced) {
      console.log("❗️ [401] User not synced and this route requires a synced user.");
      return res.status(401).json({
        message: "User not synced. Please call /users/sync first.",
        code: "USER_NOT_SYNCED",
        firebase_uid: decodedToken.uid
      });
    }

    // 5. Attach user ke request
    req.user = user; // bisa jadi null jika !user && options.allowUnsynced
    req.firebaseUser = decodedToken;
    
    console.log("👍 Auth middleware PASSED.");
    console.log("   - req.user (from DB):", req.user ? req.user.toJSON() : null);
    console.log("   - req.firebaseUser (from Token):", { uid: req.firebaseUser.uid, email: req.firebaseUser.email });
    console.log("---------------------------------------------------\n");

    next();
  } catch (error) {
    console.error("❌ [401] AUTHENTICATION ERROR:", error.code, "-", error.message);
    console.log("---------------------------------------------------\n");

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ message: "Invalid token", code: "TOKEN_INVALID" });
    }
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

