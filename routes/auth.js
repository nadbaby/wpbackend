const express = require('express');
const { toNodeHandler } = require('better-auth/node');
const { auth } = require('../lib/auth');

const router = express.Router();

// Forward all /api/auth/* requests to Better Auth
router.all('/*', toNodeHandler(auth));

module.exports = router;
