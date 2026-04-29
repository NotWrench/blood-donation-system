const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/auth"); // ✅ import routes
const userRoutes = require("./routes/users"); // ✅ import user routes
const requestRoutes = require("./routes/requests"); // ✅ import request routes
const inventoryRoutes = require("./routes/inventory"); // ✅ import inventory routes
const donorRoutes = require("./routes/donor");
const hospitalRoutes = require("./routes/hospital");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// DB test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// ✅ connect routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/hospital", hospitalRoutes);

// Compatibility aliases for direct endpoint paths requested by clients.
app.use("/donor", donorRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/user", userRoutes);

// start server
const PORT = process.env.PORT || 5000;

async function ensureRoleCompatibility() {
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20)");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(150)");
  await pool.query("ALTER TABLE requests ADD COLUMN IF NOT EXISTS donor_email VARCHAR(255)");
  await pool.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'donor'");
  await pool.query("UPDATE users SET role = 'donor' WHERE role IS NULL OR role = ''");
}

async function startServer() {
  try {
    await ensureRoleCompatibility();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("[STARTUP ERROR] Failed to initialize database compatibility checks", err);
    process.exit(1);
  }
}

startServer();