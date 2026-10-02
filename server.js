require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const appearanceRoutes = require('./routes/appearance');
const agentsRoutes = require('./routes/agents');
const mediaRoutes = require('./routes/media');
const { createUsersTable } = require('./db');

const app = express();

// CORS configuration
const LOCALHOST_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8080',
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            ...LOCALHOST_ORIGINS,
            ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/appearance', appearanceRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/orgs', require('./routes/orgs'));
app.use('/api/media', mediaRoutes);
app.use('/api/whatsapp', require('./routes/whatsapp'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        errorCode: 'ROUTE_NOT_FOUND'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        errorCode: err.code || 'INTERNAL_ERROR'
    });
});

// Initialize DB and Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await createUsersTable();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`CORS origin: ${corsOptions.origin}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
