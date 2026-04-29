const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

const VALID_ROLES = new Set(["donor", "hospital", "admin"]);

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, blood_group, location, role } = req.body;

        const normalizedRole = typeof role === "string" && role.trim()
            ? role.trim().toLowerCase()
            : "donor";

        if (!VALID_ROLES.has(normalizedRole)) {
            return res.status(400).json({ message: "Invalid role selected" });
        }

        // 1. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 2. check if user exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // 3. hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. insert user
        const newUser = await pool.query(
              `INSERT INTO users (name, email, password, role, blood_group, location)
          VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, blood_group, location`,
              [name, normalizedEmail, hashedPassword, normalizedRole, blood_group, location]
        );

        console.log(`[AUTH] User registered: ${normalizedEmail}`);

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
        });

    } catch (err) {
        console.error("[AUTH ERROR]", err.message);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Normalize and Debug
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`[AUTH] Login attempt for: ${normalizedEmail}`);

        // 2. check user with case-insensitive query
        const userResult = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = $1",
            [normalizedEmail]
        );

        console.log(`[AUTH] Database results found: ${userResult.rows.length}`);

        if (userResult.rows.length === 0) {
            console.warn(`[AUTH FAIL] User not found: ${normalizedEmail}`);
            return res.status(400).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        // 3. compare password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            console.warn(`[AUTH FAIL] Invalid password for: ${normalizedEmail}`);
            return res.status(400).json({ message: "Invalid password" });
        }

        // 4. Success
        console.log(`[AUTH SUCCESS] User logged in: ${normalizedEmail}`);
        
        // Remove password before sending back and normalize role for old records.
        const { password: _, ...userWithoutPassword } = user;
        userWithoutPassword.role = userWithoutPassword.role || "donor";

        res.json({
            message: "Login successful",
            user: userWithoutPassword,
        });

    } catch (err) {
        console.error("[AUTH ERROR]", err.message);
        res.status(500).json({ message: "Server error during login" });
    }
});

module.exports = router;
