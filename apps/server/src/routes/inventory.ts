import { Router, type Request, type Response } from "express";

import pg from "../db";

const router = Router();

// @route   GET /api/inventory
// @desc    Get all blood inventory
router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pg.query("SELECT * FROM inventory ORDER BY blood_group ASC");
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
router.put("/:group", async (req: Request, res: Response) => {
    try {
        const { group } = req.params;
        const { units } = req.body;

        const result = await pg.query(
            "UPDATE inventory SET units = $1 WHERE blood_group = $2 RETURNING *",
            [units, group]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating inventory:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
