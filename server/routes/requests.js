const express = require("express");
const router = express.Router();
const pool = require("../db");

// @route   GET /api/requests
// @desc    Get all blood requests
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM requests ORDER BY created_at DESC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching requests:", err.message);
        res.status(500).json({ 
            message: "Server error while fetching requests",
            error: err.message 
        });
    }
});

// @route   POST /api/requests
// @desc    Create a new blood request
router.post("/", async (req, res) => {
    try {
        const { blood_group, units, location, urgency } = req.body;

        // Basic Validation
        if (!blood_group || !units || !location) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const numericUnits = parseInt(units);
        if (isNaN(numericUnits) || numericUnits <= 0) {
            return res.status(400).json({ message: "Invalid units count" });
        }

        const newRequest = await pool.query(
            "INSERT INTO requests (blood_group, units, location, status, urgency) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [blood_group, numericUnits, location, 'pending', urgency || 'normal']
        );

        res.status(201).json(newRequest.rows[0]);
    } catch (err) {
        console.error("Error creating request:", err.message);
        res.status(500).json({ 
            message: "Server error while creating request",
            error: err.message 
        });
    }
});

// @route   PUT /api/requests/:id
// @desc    Update request status (and adjust inventory if approved)
router.put("/:id", async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body;

        await client.query('BEGIN');

        // 1. Get the current request details
        const requestData = await client.query("SELECT * FROM requests WHERE id = $1", [id]);
        if (requestData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Request not found" });
        }

        const request = requestData.rows[0];
        const oldStatus = request.status;

        // 2. Update the status
        const updatedRequest = await client.query(
            "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        // 3. If transitioning to 'approved' for the first time, deduct from inventory
        if (status === 'approved' && oldStatus !== 'approved') {
            const { blood_group, units } = request;
            
            // Check if we have enough stock
            const invCheck = await client.query("SELECT units FROM inventory WHERE blood_group = $1", [blood_group]);
            if (invCheck.rows.length > 0 && invCheck.rows[0].units < units) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient inventory for ${blood_group}. Current stock: ${invCheck.rows[0].units}` });
            }

            await client.query(
                "UPDATE inventory SET units = units - $1 WHERE blood_group = $2",
                [units, blood_group]
            );
        }

        await client.query('COMMIT');
        res.status(200).json(updatedRequest.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error updating request:", err.message);
        res.status(500).json({ 
            message: "Server error while updating request",
            error: err.message 
        });
    } finally {
        client.release();
    }
});

module.exports = router;
