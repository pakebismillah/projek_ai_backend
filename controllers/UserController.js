// backend/controllers/UserController.js
import models from "../models/Models.js";
import { Op } from "sequelize";

const { User } = models;

export const getProfile = async (req, res) => {
  console.log(`\n--- 🙋‍♂️ CONTROLLER: getProfile @ ${new Date().toLocaleTimeString()} ---`);
  try {
    if (!req.user) {
      console.log("❗️ [404] No user attached to request. Cannot get profile.");
      return res.status(404).json({ message: "User profile not found after auth." });
    }
    console.log("✅ Returning profile for user:", req.user.toJSON());
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
  console.log(`\n--- 🔄 CONTROLLER: syncUser @ ${new Date().toLocaleTimeString()} ---`);
  try {
    const { firebase_uid, name, email } = req.body;
    console.log("➡️ Received data:", { firebase_uid, name, email });

    if (!firebase_uid || !email) {
      console.log("❗️ [400] Missing firebase_uid or email in request body.");
      return res.status(400).json({ message: "firebase_uid dan email wajib diisi" });
    }

    // Pakai findOrCreate untuk proses yang lebih atomik dan bersih
    const [user, created] = await User.findOrCreate({
      where: { email: email },
      defaults: {
        firebase_uid: firebase_uid,
        name: name,
        email: email,
        role: "user",
      }
    });

    if (created) {
      console.log("✅ User CREATED:", user.toJSON());
      return res.status(201).json({ message: "User baru berhasil dibuat", user });
    }

    // Jika user sudah ada, cek apakah perlu update
    console.log("✅ User FOUND:", user.toJSON());
    let isUpdated = false;
    const updates = {};
    if (user.firebase_uid !== firebase_uid) {
      updates.firebase_uid = firebase_uid;
      isUpdated = true;
    }
    if (user.name !== name) {
      updates.name = name;
      isUpdated = true;
    }

    if (isUpdated) {
      console.log("... User data is different, updating...");
      await user.update(updates);
      console.log("✅ User data SYNCED:", user.toJSON());
      return res.json({ message: "User sudah ada, data disinkronkan", user });
    }

    console.log("... User data is already up-to-date.");
    res.json({ message: "User sudah ada, tidak ada perubahan", user });

  } catch (error) {
    console.error("❌ Error in syncUser:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

