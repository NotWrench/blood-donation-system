const express = require("express");
const router = express.Router();
const pool = require("../db");

// @route   GET /api/users
// @desc    Get all donors (users) from the database
// @access  Public
router.get("/", async (req, res) => {
    try {
        // Query to fetch donors with specific fields, ordered by newest first
        const query = "SELECT id, name, email, blood_group, location, created_at FROM users ORDER BY created_at DESC";
        const result = await pool.query(query);
        
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

module.exports = router;
