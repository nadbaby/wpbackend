const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get all orgs
router.get('/', async (req, res) => {
    try {
        const query = `
          SELECT o.id, o.name, o.features, COUNT(ap.id) as "membersCount"
          FROM organizations o
          LEFT JOIN agent_profiles ap ON o.name = ap.category
          GROUP BY o.id
          ORDER BY o.created_at ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows.map(r => ({ ...r, membersCount: parseInt(r.membersCount) })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create org
router.post('/', async (req, res) => {
    const { name, features } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO organizations (name, features) VALUES ($1, $2) RETURNING *',
            [name, JSON.stringify(features)]
        );
        res.json({ ...result.rows[0], membersCount: 0 });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete org
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM organizations WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update org
router.put('/:id', async (req, res) => {
    const { name, features } = req.body;
    try {
        await pool.query('UPDATE organizations SET name = $1, features = $2 WHERE id = $3', [name, JSON.stringify(features), req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get members for specific org
router.get('/:name/members', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, category FROM agent_profiles WHERE category = $1', [req.params.name]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete agent (from org)
router.delete('/members/:email', async (req, res) => {
    try {
        await pool.query('DELETE FROM agent_profiles WHERE email = $1', [req.params.email]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
