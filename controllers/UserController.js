// backend/controllers/UserController.js
import models from "../models/Models.js";
import { Op } from "sequelize";

const { User } = models;

export const getProfile = async (req, res) => {
  try {
    console.log("📍 GET /users/me - User:", req.user?.email);
    res.json(req.user);
  } catch (error) {
    console.error("❌ Error in getProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("📍 GET /users - Fetching all users");
    const users = await User.findAll({
      attributes: ["id", "firebase_uid", "name", "email", "role", "createdAt"],
    });
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /users/sync
export const syncUser = async (req, res) => {
  try {
    console.log("📍 POST /users/sync - Request body:", req.body);
    
    const { firebase_uid, name, email } = req.body;

    if (!firebase_uid || !email) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "firebase_uid dan email wajib diisi" });
    }

    // Cari user berdasarkan email (karena email unik)
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Kalau UID berbeda, update UID-nya
      if (user.firebase_uid !== firebase_uid) {
        console.log("🔁 Firebase UID updated for user:", email);
        await user.update({ firebase_uid });
      }

      // Sinkronkan data lain
      await user.update({ name, email });
      console.log("✅ User data synced");
      return res.json({ message: "User sudah ada, data disinkronkan", user });
    }

    // Kalau belum ada sama sekali, buat user baru
    console.log("🆕 Creating new user:", email);
    user = await User.create({
      firebase_uid,
      name,
      email,
      role: "user",
    });
    console.log("✅ New user created:", user.email);

    res.json({ message: "User baru berhasil dibuat", user });
  } catch (error) {
    console.error("❌ Error in syncUser:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};
