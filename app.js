import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sequelize from "./config/database.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


// nanti bisa tambah: sessionRoutes, chatRoutes, dsb

dotenv.config();
const app = express();

// Middleware global
app.use((req, res, next) => {
  console.log("🔥 REQUEST MASUK:", req.method, req.url);
  console.log("🌍 ORIGIN:", req.headers.origin);
  next();
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://projekaifrontend-production.up.railway.app"
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// Security middleware
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Terlalu banyak percobaan auth 😵" }
});

const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Session kebanyakan, istirahat dulu 😄" }
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Chat terlalu cepat ⚡" }
});

app.use(express.json());

// Routes
app.use("/users", authLimiter, userRoutes);
app.use("/sessions", sessionLimiter, sessionRoutes);
app.use("/chats", chatLimiter, chatRoutes);


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
