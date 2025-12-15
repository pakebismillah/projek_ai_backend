// backend/controllers/SessionController.js
import models from "../models/Models.js";
const { Session } = models;

// ✅ Buat session baru
export const createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await Session.create({
      title: title || "Percakapan Baru",
      userId: req.user.id, // ambil dari authMiddleware
    });
    res.status(201).json(session);
  } catch (error) {
    console.error("❌ Error createSession:", error);
    res.status(500).json({ message: "Gagal membuat session" });
  }
};

// ✅ Ambil semua session milik user
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(sessions);
  } catch (error) {
    console.error("❌ Error getSessions:", error);
    res.status(500).json({ message: "Gagal mengambil sessions" });
  }
};

// ✅ Ambil detail satu session
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({
      where: { id, userId: req.user.id },
    });
    if (!session) return res.status(404).json({ message: "Session tidak ditemukan" });
    res.json(session);
  } catch (error) {
    console.error("❌ Error getSessionById:", error);
    res.status(500).json({ message: "Gagal mengambil session" });
  }
};

// ✅ Update / Rename session
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const session = await Session.findOne({
      where: { id, userId: req.user.id },
    });

    if (!session)
      return res.status(404).json({ message: "Session tidak ditemukan" });

    session.title = title || session.title;
    await session.save();

    res.json({
      message: "Session berhasil diupdate",
      session,
    });
  } catch (error) {
    console.error("❌ Error updateSession:", error);
    res.status(500).json({ message: "Gagal mengupdate session" });
  }
};


// ✅ Hapus session
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({
      where: { id, userId: req.user.id },
    });
    if (!session) return res.status(404).json({ message: "Session tidak ditemukan" });

    await session.destroy();
    res.json({ message: "Session berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error deleteSession:", error);
    res.status(500).json({ message: "Gagal menghapus session" });
  }
};
