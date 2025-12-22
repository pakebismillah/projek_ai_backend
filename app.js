import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sequelize from "./config/database.js";

// nanti bisa tambah: sessionRoutes, chatRoutes, dsb

dotenv.config();
const app = express();

// Middleware global
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://projekaifrontend-production.up.railway.app/"
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());

app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/sessions", sessionRoutes);
app.use("/chats", chatRoutes);


// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// Database + Server start
const PORT = process.env.APP_PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected...");

    // sinkronisasi model dengan DB
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();
