const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Get all provisioned agents internally
router.get('/all', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, email, category FROM agent_profiles ORDER BY email ASC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

// Get the current logged-in user's profile and permissions
router.get('/me', async (req, res, next) => {
    try {
        const email = req.query.email || 'admin@whatsapi.io';

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
router.post('/permissions', async (req, res, next) => {
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

// Admin provisions a new agent directly
router.post('/provision', async (req, res, next) => {
    try {
        const { name, email, password, category, features } = req.body;
        
        // Import the better-auth instance directly instead of using fetch
        const { auth } = require('../lib/auth');

        try {
            await auth.api.signUpEmail({
                body: { name, email, password }
            });
        } catch (authErr) {
            const message = authErr?.body?.message || authErr?.message || JSON.stringify(authErr);
            if (!message.toLowerCase().includes('already')) {
                return res.status(400).json({ success: false, message });
            }
        }

        // Add profile in PostgreSQL
        const upsertQuery = `
            INSERT INTO agent_profiles (email, category, features) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (email) 
            DO UPDATE SET category = EXCLUDED.category, features = EXCLUDED.features
            RETURNING *;
        `;
        const result = await pool.query(upsertQuery, [email, category, JSON.stringify(features)]);

        res.json({ success: true, profile: result.rows[0] });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
