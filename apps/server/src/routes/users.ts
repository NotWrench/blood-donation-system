import { Router, type Request, type Response } from "express";

import pg from "../db";

const router = Router();

const VALID_BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]);

// @route   GET /api/users
// @desc    Get all donors (users) from the database
// @access  Public
router.get("/", async (_req: Request, res: Response) => {
    try {
        // Query to fetch donors with specific fields, ordered by newest first
        const query = "SELECT id, name, email, blood_group, location, created_at FROM users ORDER BY created_at DESC";
        const result = await pg.query(query);
        
        res.status(200).json(result.rows);
    } catch (err) {
        // Logging the full error for debugging
        console.error("Database Error - Fetching Users:", err);
        res.status(500).json({ 
            message: "Failed to retrieve donor data from database.",
            error: err.message 
        });
    }
});

// @route   GET /api/users/profile
// @desc    Get profile by user id/email
// @access  Public (session handled on frontend in current app)
router.get("/profile", async (req: Request, res: Response) => {
    try {
        const id = req.query.id ? Number(req.query.id) : null;
        const email = (req.query.email || "").toString().trim().toLowerCase();

        if (!id && !email) {
            return res.status(400).json({ message: "id or email is required" });
        }

        const query = id
            ? "SELECT id, name, email, role, blood_group, location, phone, hospital_name, created_at FROM users WHERE id = $1 LIMIT 1"
            : "SELECT id, name, email, role, blood_group, location, phone, hospital_name, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1";
        const params: unknown[] = id ? [id] : [email];

        const result = await pg.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Database Error - Fetching Profile:", err);
        res.status(500).json({ message: "Failed to retrieve profile.", error: err.message });
    }
});

// @route   PUT /user/update
// @desc    Update profile fields by user id/email
// @access  Public (session handled on frontend in current app)
router.put("/update", async (req: Request, res: Response) => {
    try {
        const {
            id,
            email,
            role,
            name,
            phone,
            location,
            blood_group,
            hospital_name,
        } = req.body;

        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!id && !normalizedEmail) {
            return res.status(400).json({ message: "id or email is required" });
        }

        const userQuery = id
            ? "SELECT id, email, role FROM users WHERE id = $1 LIMIT 1"
            : "SELECT id, email, role FROM users WHERE LOWER(email) = $1 LIMIT 1";
        const userParams: unknown[] = id ? [id] : [normalizedEmail];
        const userResult = await pg.query(userQuery, userParams);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = userResult.rows[0];
        const normalizedRole = (role || existing.role || "donor").toLowerCase();

        if (blood_group && !VALID_BLOOD_GROUPS.has(blood_group)) {
            return res.status(400).json({ message: "Invalid blood group" });
        }

        const updates = [];
        const values = [];

        if (typeof name === "string") {
            values.push(name.trim());
            updates.push(`name = $${values.length}`);
        }

        if (typeof phone === "string") {
            values.push(phone.trim());
            updates.push(`phone = $${values.length}`);
        }

        if (typeof location === "string") {
            values.push(location.trim());
            updates.push(`location = $${values.length}`);
        }

        if (normalizedRole === "donor" && typeof blood_group === "string") {
            values.push(blood_group);
            updates.push(`blood_group = $${values.length}`);
        }

        if (normalizedRole === "hospital" && typeof hospital_name === "string") {
            values.push(hospital_name.trim());
            updates.push(`hospital_name = $${values.length}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No editable fields were provided" });
        }

        values.push(existing.id);

        const updateQuery = `
            UPDATE users
            SET ${updates.join(", ")}
            WHERE id = $${values.length}
            RETURNING id, name, email, role, blood_group, location, phone, hospital_name, created_at
        `;

        const updated = await pg.query(updateQuery, values);
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updated.rows[0],
        });
    } catch (err) {
        console.error("Database Error - Updating Profile:", err);
        res.status(500).json({ message: "Failed to update profile.", error: err.message });
    }
});

export default router;
