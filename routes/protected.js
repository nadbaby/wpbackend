const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// A protected route
router.get('/dashboard', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the protected dashboard!',
        data: {
            userId: req.user
        }
    });
});

module.exports = router;
