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

        // Call Managed Better Auth to sign up the new user without affecting the admin's browser session
        const authUrl = process.env.NEON_AUTH_BASE_URL;
        const neoRes = await fetch(`${authUrl}/sign-up/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": req.headers.origin || "http://localhost:5173"
            },
            body: JSON.stringify({ name, email, password })
        });

        if (!neoRes.ok) {
            const errorText = await neoRes.text();
            let msg = errorText;
            try { msg = JSON.parse(errorText).message || errorText; } catch (e) { }
            return res.status(400).json({ success: false, message: msg });
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
