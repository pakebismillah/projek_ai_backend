import { Sequelize } from "sequelize";

let sequelize;

if (process.env.DATABASE_URL) {
  // 🔥 Production / Railway
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",   // ⬅️ HARDCODE, WAJIB
    logging: false,
  });
} else {
  // 💻 Local / Windows
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres", // ⬅️ HARDCODE JUGA
      logging: false,
    }
  );
}

export default sequelize;
