import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserModels = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firebase_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
  });

  return User;
};

export default UserModels;
