const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Get the current logged-in user's profile and permissions
router.get('/me', auth, async (req, res, next) => {
    try {
        // req.user contains the decoded JWT. For Neon Auth it usually has `.email` or `.sub`
        const email = req.user.email || req.user.id || req.user;

        const profileResult = await pool.query('SELECT * FROM agent_profiles WHERE email = $1', [email]);

        const profile = profileResult.rows.length > 0 ? profileResult.rows[0] : null;

        res.json({
            success: true,
            data: {
                user: req.user,
                profile
            }
        });
    } catch (error) {
        next(error);
    }
});

// Admin creates or updates an agent's category and features
router.post('/permissions', auth, async (req, res, next) => {
    try {
        const { target_email, category, features } = req.body;

        // Check if the caller is an admin (Optional: add logic here based on req.user)

        // Upsert the agent profile
        const upsertQuery = `
            INSERT INTO agent_profiles (email, category, features) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (email) 
            DO UPDATE SET category = EXCLUDED.category, features = EXCLUDED.features
            RETURNING *;
        `;

        const result = await pool.query(upsertQuery, [target_email, category, JSON.stringify(features)]);

        res.json({
            success: true,
            message: 'Agent permissions updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
