import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SessionModels = (sequelize, DataTypes) => {
  const Session = sequelize.define("Session", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
  });

  return Session;
};

export default SessionModels;
