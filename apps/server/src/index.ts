import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";

import pg from "./db";
import authRoutes from "./routes/auth";
import donorRoutes from "./routes/donor";
import hospitalRoutes from "./routes/hospital";
import inventoryRoutes from "./routes/inventory";
import requestRoutes from "./routes/requests";
import userRoutes from "./routes/users";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (_req: Request, res: Response) => {
  res.send("API running...");
});

// DB test route
app.get("/test-db", async (_req: Request, res: Response) => {
  try {
    const result = await pg.query("SELECT NOW()");
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
  await pg.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20)");
  await pg.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)");
  await pg.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(150)");
  await pg.query("ALTER TABLE requests ADD COLUMN IF NOT EXISTS donor_email VARCHAR(255)");
  await pg.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'donor'");
  await pg.query("UPDATE users SET role = 'donor' WHERE role IS NULL OR role = ''");
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
