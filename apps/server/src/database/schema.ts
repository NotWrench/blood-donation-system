import {
  check,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export const userRoles = ["donor", "hospital", "admin"] as const;
export const requestStatuses = ["pending", "approved", "rejected", "fulfilled"] as const;
export const requestUrgencies = ["low", "normal", "high", "critical"] as const;

const bloodGroupCheck = (columnName: string) =>
  sql.raw(`${columnName} IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')`);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: text("password").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("donor"),
    phone: varchar("phone", { length: 30 }),
    hospitalName: varchar("hospital_name", { length: 150 }),
    bloodGroup: varchar("blood_group", { length: 5 }).notNull(),
    location: varchar("location", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_lower_uniq").on(sql`lower(${table.email})`),
    check("users_role_check", sql`${table.role} IN ('donor','hospital','admin')`),
    check("users_blood_group_check", bloodGroupCheck("blood_group")),
  ],
);

export const inventory = pgTable(
  "inventory",
  {
    bloodGroup: varchar("blood_group", { length: 5 }).primaryKey(),
    units: integer("units").notNull().default(0),
  },
  (table) => [
    check("inventory_blood_group_check", bloodGroupCheck("blood_group")),
    check("inventory_units_check", sql`${table.units} >= 0`),
  ],
);

export const requests = pgTable(
  "requests",
  {
    id: serial("id").primaryKey(),
    bloodGroup: varchar("blood_group", { length: 5 }).notNull(),
    units: integer("units").notNull(),
    location: varchar("location", { length: 120 }).notNull(),
    donorEmail: varchar("donor_email", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    urgency: varchar("urgency", { length: 20 }).notNull().default("normal"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("requests_blood_group_check", bloodGroupCheck("blood_group")),
    check("requests_units_check", sql`${table.units} > 0`),
    check("requests_status_check", sql`${table.status} IN ('pending','approved','rejected','fulfilled')`),
    check("requests_urgency_check", sql`${table.urgency} IN ('low','normal','high','critical')`),
  ],
);

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  donorEmail: varchar("donor_email", { length: 255 }).notNull(),
  bloodGroup: varchar("blood_group", { length: 5 }).notNull(),
  units: integer("units").notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  donatedAt: timestamp("donated_at", { withTimezone: true }).notNull().defaultNow(),
});
