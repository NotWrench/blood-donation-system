const express = require("express");
const router = express.Router();
const pool = require("../db");

// @route   GET /api/inventory
// @desc    Get all blood inventory
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM inventory ORDER BY blood_group ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching inventory:", err.message);
        res.status(500).json({ 
            message: "Server error while fetching inventory",
            error: err.message 
        });
    }
});

// @route   PUT /api/inventory/:group
// @desc    Update units for a blood group
router.put("/:group", async (req, res) => {
    try {
        const { group } = req.params;
        const { units } = req.body;

        const result = await pool.query(
            "UPDATE inventory SET units = $1 WHERE blood_group = $2 RETURNING *",
            [units, group]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating inventory:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
