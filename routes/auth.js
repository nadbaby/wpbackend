const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
                errorCode: 'USER_EXISTS'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {}
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            errorCode: 'SERVER_ERROR'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                errorCode: 'INVALID_CREDENTIALS'
            });
        }

        const user = userResult.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                errorCode: 'INVALID_CREDENTIALS'
            });
        }

        // Generate token
        const payload = {
            userId: user.id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            success: true,
            message: 'Logged in successfully',
            data: { token }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            errorCode: 'SERVER_ERROR'
        });
    }
});

module.exports = router;
