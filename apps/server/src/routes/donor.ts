import { Router, type Request, type Response } from "express";

import pg from "../db";

const router = Router();

const seededProfile = {
  id: 0,
  name: "Demo Donor",
  email: "donor@example.com",
  blood_group: "O+",
  location: "Mumbai",
  role: "donor",
  created_at: new Date().toISOString(),
};

const seededHistory = [
  {
    id: 1001,
    blood_group: "O+",
    units: 1,
    hospital: "City Hospital",
    location: "City Hospital",
    status: "fulfilled",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    note: "Emergency support",
  },
  {
    id: 1002,
    blood_group: "A+",
    units: 1,
    hospital: "Metro Care",
    location: "Metro Care",
    status: "fulfilled",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    note: "Routine donation",
  },
];

router.get("/profile", async (req: Request, res: Response) => {
  try {
    const email = (req.query.email || "").toString().trim().toLowerCase();

    let query = "SELECT id, name, email, blood_group, location, role, created_at FROM users WHERE role = 'donor' ORDER BY created_at DESC LIMIT 1";
    let params: unknown[] = [];

    if (email) {
      query = "SELECT id, name, email, blood_group, location, role, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1";
      params = [email];
    }

    const result = await pg.query(query, params);

    if (result.rows.length === 0) {
      return res.status(200).json(seededProfile);
    }

    const profile = result.rows[0];
    profile.role = profile.role || "donor";
    return res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching donor profile:", err.message);
    return res.status(200).json(seededProfile);
  }
});

router.get("/history", async (req: Request, res: Response) => {
  try {
    const email = (req.query.email || "").toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Get donation history from donations table
    const query = `
      SELECT 
        d.id,
        d.blood_group,
        d.units,
        d.location,
        d.location AS hospital,
        'fulfilled' AS status,
        d.donated_at AS created_at,
        r.urgency
      FROM donations d
      LEFT JOIN requests r ON d.request_id = r.id
      WHERE LOWER(d.donor_email) = $1
      ORDER BY d.donated_at DESC
      LIMIT 50
    `;

    const result = await pg.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching donor history:", err.message);
    return res.status(500).json({ message: "Failed to fetch donation history" });
  }
});

router.get("/available-requests", async (req: Request, res: Response) => {
  try {
    const bloodGroupRaw = (req.query?.blood_group ?? "").toString().trim();

    // Fetch all approved requests (approved by admin) that are pending donor acceptance
    const query = `
      SELECT id, blood_group, units, location, status, urgency, created_at
      FROM requests
      WHERE status = 'approved'
      ${bloodGroupRaw ? "AND blood_group = $1" : ""}
      ORDER BY urgency DESC, created_at DESC
      LIMIT 50
    `;

    const result = bloodGroupRaw ? await pg.query(query, [bloodGroupRaw]) : await pg.query(query);

    if (result.rows.length === 0) {
      return res.status(200).json([
        {
          id: 3001,
          blood_group: "O-",
          units: 2,
          location: "City Hospital",
          status: "approved",
          urgency: "critical",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching available requests:", err.message);
    return res.status(200).json([
      {
        id: 3001,
        blood_group: "O-",
        units: 2,
        location: "City Hospital",
        status: "approved",
        urgency: "critical",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  }
});

router.post("/accept-request/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = (req.body?.email || "").toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Donor email is required" });
    }

    return await pg.transaction(async (tx) => {

    // Get request details
    const requestData = await tx.query("SELECT * FROM requests WHERE id = $1", [id]);
    if (requestData.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = requestData.rows[0];
    
    // Check if request is available for donation
    if (request.status !== "approved") {
      return res.status(400).json({ message: "This request is not available for donation. It may have already been fulfilled or is still pending approval." });
    }

    // Check inventory availability
    const invCheck = await tx.query("SELECT units FROM inventory WHERE blood_group = $1", [request.blood_group]);
    if (invCheck.rows.length === 0) {
      return res.status(400).json({ message: `Blood group ${request.blood_group} not found in inventory` });
    }
    
    if (invCheck.rows[0].units < request.units) {
      return res.status(400).json({ message: `Insufficient inventory for ${request.blood_group}. Available: ${invCheck.rows[0].units} units, Required: ${request.units} units` });
    }

    // Update request status to fulfilled and add donor email
    const updatedRequest = await tx.query(
      "UPDATE requests SET status = 'fulfilled', donor_email = $1 WHERE id = $2 RETURNING *",
      [email, id]
    );

    // Create donation entry
    await tx.query(
      "INSERT INTO donations (request_id, donor_email, blood_group, units, location) VALUES ($1, $2, $3, $4, $5)",
      [id, email, request.blood_group, request.units, request.location]
    );

    // Deduct from inventory
    await tx.query(
      "UPDATE inventory SET units = units - $1 WHERE blood_group = $2",
      [request.units, request.blood_group]
    );

    return res.status(200).json({
      success: true,
      message: "Donation accepted successfully",
      request: updatedRequest.rows[0]
    });
    });
  } catch (err) {
    console.error("Error accepting request:", err.message);
    
    // Provide more specific error messages
    if (err.code === '23503') {
      return res.status(400).json({ message: "Invalid request reference" });
    }
    if (err.code === '23514') {
      return res.status(400).json({ message: "Invalid data provided" });
    }
    
    return res.status(500).json({ 
      message: "Unable to process donation request. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const email = (req.query.email || "").toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Get donation count for this donor
    const donationCountQuery = await pg.query(
      "SELECT COUNT(*) as count FROM donations WHERE LOWER(donor_email) = $1",
      [email]
    );

    const donationCount = parseInt(donationCountQuery.rows[0]?.count || "0", 10);

    return res.status(200).json({
      totalDonations: donationCount,
      email: email
    });
  } catch (err) {
    console.error("Error fetching donor stats:", err.message);
    return res.status(500).json({ message: "Failed to fetch donor statistics" });
  }
});

export default router;
