import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ChatMessageModels = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define("ChatMessage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "Sessions", key: "id" },
      onDelete: "CASCADE",
    },

    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return ChatMessage;
};

export default ChatMessageModels;
