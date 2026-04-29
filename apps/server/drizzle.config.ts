import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const host = process.env.POSTGRES_HOST ?? "localhost";
const port = process.env.POSTGRES_PORT ?? "5433";
const user = process.env.POSTGRES_USER ?? "postgres";
const password = process.env.POSTGRES_PASSWORD ?? "password";
const database = process.env.POSTGRES_DB ?? "blood_donation";

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? `postgres://${user}:${password}@${host}:${port}/${database}`,
  },
});
