import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

import UserModels from "./userModels.js";
import SessionModels from "./SessionModels.js";
import ChatMessageModels from "./ChatMessage.js";

// Init model
const User = UserModels(sequelize, DataTypes);
const Session = SessionModels(sequelize, DataTypes);
const ChatMessage = ChatMessageModels(sequelize, DataTypes);

// Relasi
User.hasMany(Session, { foreignKey: "userId", as: "sessions" });
Session.belongsTo(User, { foreignKey: "userId" });

Session.hasMany(ChatMessage, { foreignKey: "sessionId", as: "messages" });
ChatMessage.belongsTo(Session, { foreignKey: "sessionId" });

// Export
const models = { User, Session, ChatMessage };

export { sequelize, User, Session, ChatMessage };
export default models;
