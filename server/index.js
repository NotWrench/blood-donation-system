const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/auth"); // ✅ import routes
const userRoutes = require("./routes/users"); // ✅ import user routes
const requestRoutes = require("./routes/requests"); // ✅ import request routes
const inventoryRoutes = require("./routes/inventory"); // ✅ import inventory routes

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
app.use("/api/requests", requestRoutes);
app.use("/api/inventory", inventoryRoutes);

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});