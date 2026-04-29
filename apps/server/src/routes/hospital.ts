import { Router, type Request, type Response } from "express";

import pg from "../db";

const router = Router();

const seededRequests = [
  {
    id: 2001,
    blood_group: "O-",
    units: 2,
    location: "City Hospital",
    status: "pending",
    urgency: "critical",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2002,
    blood_group: "A+",
    units: 1,
    location: "City Hospital",
    status: "approved",
    urgency: "normal",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

async function resolveHospitalLocation({
  id,
  email,
}: {
  id?: number | null;
  email?: string | null;
}) {
  if (id) {
    const byId = await pg.query(
      "SELECT location FROM users WHERE id = $1 AND role = 'hospital' LIMIT 1",
      [id]
    );
    if (byId.rows.length > 0) {
      return byId.rows[0].location;
    }
  }

  if (email) {
    const normalizedEmail = email.toString().trim().toLowerCase();
    if (normalizedEmail) {
      const byEmail = await pg.query(
        "SELECT location FROM users WHERE LOWER(email) = $1 AND role = 'hospital' LIMIT 1",
        [normalizedEmail]
      );
      if (byEmail.rows.length > 0) {
        return byEmail.rows[0].location;
      }
    }
  }

  return null;
}

router.get("/requests", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const email = (req.query.email || "").toString().trim();
    const location = (req.query.location || "").toString().trim();

    const hospitalLocation = await resolveHospitalLocation({ id: userId, email });
    const effectiveLocation = hospitalLocation || location;

    let query = "SELECT id, blood_group, units, location, status, urgency, created_at FROM requests ORDER BY created_at DESC";
    let params: unknown[] = [];

    if (effectiveLocation) {
      query = "SELECT id, blood_group, units, location, status, urgency, created_at FROM requests WHERE LOWER(location) LIKE LOWER($1) ORDER BY created_at DESC";
      params = [`%${effectiveLocation}%`];
    }

    const result = await pg.query(query, params);

    if (result.rows.length === 0) {
      return res.status(200).json(seededRequests);
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching hospital requests:", err.message);
    return res.status(200).json(seededRequests);
  }
});

router.post("/requests", async (req: Request, res: Response) => {
  try {
    const { blood_group, units, urgency, userId, email } = req.body;

    const hospitalLocation = await resolveHospitalLocation({ id: userId, email });
    if (!hospitalLocation) {
      return res.status(400).json({ message: "Hospital profile location not found" });
    }

    if (!blood_group || !units) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numericUnits = Number(units);
    if (!Number.isFinite(numericUnits) || numericUnits <= 0) {
      return res.status(400).json({ message: "Invalid units" });
    }

    const allowedUrgency = new Set(["low", "normal", "high", "critical"]);
    const normalizedUrgency = allowedUrgency.has((urgency || "").toLowerCase())
      ? urgency.toLowerCase()
      : "normal";

    const inserted = await pg.query(
      `INSERT INTO requests (blood_group, units, location, status, urgency)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id, blood_group, units, location, status, urgency, created_at`,
      [blood_group, numericUnits, hospitalLocation, normalizedUrgency]
    );

    return res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error("Error creating hospital request:", err.message);
    return res.status(500).json({ message: "Server error while creating request", error: err.message });
  }
});

export default router;
