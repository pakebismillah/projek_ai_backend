//backend\controllers\ChatController.js
import models from "../models/Models.js";
import { askAgent } from "../agent/agent.js";  
const { ChatMessage, Session } = models;

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, userMessage, message } = req.body;
    const finalMessage = userMessage || message;

    const session = await Session.findOne({
      where: { id: sessionId, userId: req.user.id },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Panggil AI
    const aiReply = await askAgent(sessionId, finalMessage);

    // Simpan pesan user
    await ChatMessage.create({
      sessionId,
      role: "user",
      content: finalMessage,
    });

    // Simpan balasan AI
    await ChatMessage.create({
      sessionId,
      role: "assistant",
      content: aiReply,
    });

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getChats = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      where: { id: sessionId, userId: req.user.id },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const chats = await ChatMessage.findAll({
      where: { sessionId },
      order: [["createdAt", "ASC"]],
    });

    res.json(chats);
  } catch (error) {
    console.error("getChats error:", error);
    res.status(500).json({ message: error.message });
  }
};
