//backend\controllers\ChatController.js
import models from "../models/Models.js";
import { askAgent } from "../agent/agent.js";
const { ChatMessage, Session } = models;

export const sendMessage = async (req, res) => {
  console.log(`\n--- 💬 CONTROLLER: sendMessage @ ${new Date().toLocaleTimeString()} ---`);
  try {
    const { sessionId, message } = req.body;
    const userId = req.user?.id;

    console.log("➡️ Received data:", { sessionId, message, userId });

    if (!userId) {
      console.log("❗️ [401] No user ID attached to request.");
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log(`... Searching for session with id: ${sessionId} for user: ${userId}`);
    const session = await Session.findOne({
      where: { id: sessionId, userId: userId },
    });
    
    if (!session) {
      console.log(`❗️ [404] Session NOT FOUND with id: ${sessionId} for user: ${userId}`);
      return res.status(404).json({ message: "Session not found or you do not have permission." });
    }
    console.log("✅ Session found:", session.toJSON());

    // Panggil AI
    console.log("... Calling AI agent...");
    const aiReply = await askAgent(sessionId, message);
    console.log("✅ AI Agent replied:", aiReply);


    // Simpan pesan user & AI (pakai Promise.all untuk paralel)
    console.log("... Saving user and AI messages to DB...");
    await Promise.all([
      ChatMessage.create({
        sessionId,
        role: "user",
        content: message,
      }),
      ChatMessage.create({
        sessionId,
        role: "assistant",
        content: aiReply,
      })
    ]);
    console.log("✅ Messages saved successfully.");

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getChats = async (req, res) => {
  console.log(`\n--- 📂 CONTROLLER: getChats @ ${new Date().toLocaleTimeString()} ---`);
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    console.log("➡️ Received data:", { sessionId, userId });

    if (!userId) {
      console.log("❗️ [401] No user ID attached to request.");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log(`... Searching for session with id: ${sessionId} for user: ${userId}`);
    const session = await Session.findOne({
      where: { id: sessionId, userId: userId },
    });

    if (!session) {
      console.log(`❗️ [404] Session NOT FOUND with id: ${sessionId} for user: ${userId}`);
      return res.status(404).json({ message: "Session not found or you do not have permission." });
    }
    console.log("✅ Session found:", session.toJSON());
    
    console.log(`... Finding all chat messages for session: ${sessionId}`);
    const chats = await ChatMessage.findAll({
      where: { sessionId },
      order: [["createdAt", "ASC"]],
    });
    console.log(`✅ Found ${chats.length} messages. Returning to client.`);

    res.json(chats);
  } catch (error) {
    console.error("❌ Error in getChats:", error);
    res.status(500).json({ message: error.message });
  }
};

