import bcrypt from "bcrypt";

import pg from "./db";

async function ensureProfileColumns() {
  await pg.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)");
  await pg.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(150)");
}

async function seedUsers() {
  const users = [
    // 5 Donors with different blood groups
    {
      name: "Rahul Mehta",
      email: "donor1@lifedrops.demo",
      password: "Demo@123",
      role: "donor",
      phone: "+91-9876543210",
      hospital_name: null,
      blood_group: "O+",
      location: "Mumbai",
    },
    {
      name: "Priya Singh",
      email: "donor2@lifedrops.demo",
      password: "Demo@123",
      role: "donor",
      phone: "+91-9876543211",
      hospital_name: null,
      blood_group: "A-",
      location: "Delhi",
    },
    {
      name: "Arjun Nair",
      email: "donor3@lifedrops.demo",
      password: "Demo@123",
      role: "donor",
      phone: "+91-9876543212",
      hospital_name: null,
      blood_group: "B+",
      location: "Bangalore",
    },
    {
      name: "Sneha Patel",
      email: "donor4@lifedrops.demo",
      password: "Demo@123",
      role: "donor",
      phone: "+91-9876543213",
      hospital_name: null,
      blood_group: "AB+",
      location: "Pune",
    },
    {
      name: "Vikram Sharma",
      email: "donor5@lifedrops.demo",
      password: "Demo@123",
      role: "donor",
      phone: "+91-9876543214",
      hospital_name: null,
      blood_group: "O-",
      location: "Chennai",
    },
    // 3 Hospitals
    {
      name: "Dr. Meera Kapoor",
      email: "hospital1@lifedrops.demo",
      password: "Demo@123",
      role: "hospital",
      phone: "+91-2212345678",
      hospital_name: "City General Hospital",
      blood_group: "O+",
      location: "City General Hospital",
    },
    {
      name: "Dr. Karthik Rao",
      email: "hospital2@lifedrops.demo",
      password: "Demo@123",
      role: "hospital",
      phone: "+91-4412345679",
      hospital_name: "Apollo Medical Center",
      blood_group: "A+",
      location: "Apollo Medical Center",
    },
    {
      name: "Dr. Anjali Desai",
      email: "hospital3@lifedrops.demo",
      password: "Demo@123",
      role: "hospital",
      phone: "+91-2012345680",
      hospital_name: "Fortis Healthcare",
      blood_group: "B+",
      location: "Fortis Healthcare",
    },
    // 1 Admin
    {
      name: "System Admin",
      email: "admin@lifedrops.demo",
      password: "Admin@123",
      role: "admin",
      phone: "+91-9999999999",
      hospital_name: null,
      blood_group: "AB+",
      location: "Pune",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pg.query(
      `
        INSERT INTO users (name, email, password, role, phone, hospital_name, blood_group, location)
        SELECT $1::text, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text
        WHERE NOT EXISTS (
          SELECT 1 FROM users WHERE LOWER(email) = LOWER($2::text)
        )
      `,
      [
        user.name,
        user.email,
        hashedPassword,
        user.role,
        user.phone,
        user.hospital_name,
        user.blood_group,
        user.location,
      ]
    );
  }
}

async function seedInventory() {
  const inventory = [
    ["A+", 42],
    ["A-", 18],
    ["B+", 36],
    ["B-", 12],
    ["O+", 55],
    ["O-", 20],
    ["AB+", 16],
    ["AB-", 8],
  ];

  for (const [bloodGroup, units] of inventory) {
    await pg.query(
      `
        INSERT INTO inventory (blood_group, units)
        VALUES ($1::text, $2::int)
        ON CONFLICT (blood_group)
        DO UPDATE SET units = GREATEST(inventory.units, EXCLUDED.units)
      `,
      [bloodGroup, units]
    );
  }
}

async function seedRequests() {
  // 6 blood requests: mix of pending and approved, linked to hospitals
  const requests = [
    // Pending requests (3)
    {
      blood_group: "O-",
      units: 2,
      location: "City General Hospital",
      donor_email: null,
      status: "pending",
      urgency: "critical",
      created_at: "2026-04-27T09:30:00Z",
    },
    {
      blood_group: "A+",
      units: 1,
      location: "Apollo Medical Center",
      donor_email: null,
      status: "pending",
      urgency: "high",
      created_at: "2026-04-27T10:15:00Z",
    },
    {
      blood_group: "B+",
      units: 3,
      location: "Fortis Healthcare",
      donor_email: null,
      status: "pending",
      urgency: "normal",
      created_at: "2026-04-27T11:00:00Z",
    },
    // Approved requests (3) - linked to donors
    {
      blood_group: "O+",
      units: 2,
      location: "City General Hospital",
      donor_email: "donor1@lifedrops.demo",
      status: "approved",
      urgency: "high",
      created_at: "2026-04-25T08:00:00Z",
    },
    {
      blood_group: "A-",
      units: 1,
      location: "Apollo Medical Center",
      donor_email: "donor2@lifedrops.demo",
      status: "approved",
      urgency: "normal",
      created_at: "2026-04-24T14:30:00Z",
    },
    {
      blood_group: "AB+",
      units: 1,
      location: "Fortis Healthcare",
      donor_email: "donor4@lifedrops.demo",
      status: "approved",
      urgency: "normal",
      created_at: "2026-04-23T16:45:00Z",
    },
  ];

  for (const request of requests) {
    await pg.query(
      `
        INSERT INTO requests (blood_group, units, location, donor_email, status, urgency, created_at)
        SELECT $1::text, $2::int, $3::text, $4::text, $5::text, $6::text, $7::timestamptz
        WHERE NOT EXISTS (
          SELECT 1
          FROM requests
          WHERE blood_group = $1::text
            AND units = $2::int
            AND location = $3::text
            AND status = $5::text
            AND urgency = $6::text
            AND created_at = $7::timestamptz
        )
      `,
      [
        request.blood_group,
        request.units,
        request.location,
        request.donor_email,
        request.status,
        request.urgency,
        request.created_at,
      ]
    );
  }
}

async function run() {
  try {
    console.log("[seed] starting demo data seeding...");
    await ensureProfileColumns();
    await seedUsers();
    await seedInventory();
    await seedRequests();
    console.log("[seed] completed successfully.");
  } catch (err) {
    console.error("[seed] failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pg.end();
  }
}

run();
