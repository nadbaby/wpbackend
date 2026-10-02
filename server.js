require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { toNodeHandler } = require("better-auth/node");
const { auth } = require("./lib/auth");

const protectedRoutes = require("./routes/protected");
const appearanceRoutes = require("./routes/appearance");
const agentsRoutes = require("./routes/agents");
const mediaRoutes = require("./routes/media");

const { createUsersTable } = require("./db");

const app = express();

// ======================================================
// CORS CONFIGURATION
// ======================================================

const LOCALHOST_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080",
    "https://wpfrontend-blue.vercel.app",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:8080",
];

const corsOptions = {
    origin: (origin, callback) => {

        // Allow requests without an Origin
        // e.g. Postman, curl, server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        const allowedOrigins = [
            ...LOCALHOST_ORIGINS,

            ...(process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN
                    .split(",")
                    .map((o) => o.trim())
                : []),
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS blocked:", origin);

            callback(
                new Error(
                    `CORS: origin '${origin}' not allowed`
                )
            );
        }
    },

    // REQUIRED for Better Auth cookies
    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],

    maxAge: 86400,
};

// ======================================================
// CORS
// ======================================================

app.use(cors(corsOptions));

// ======================================================
// BETTER AUTH
// ======================================================
//
// IMPORTANT:
// Better Auth MUST be mounted BEFORE express.json()
// because Better Auth needs access to the raw request body.
//
// Express 5:
// /api/auth/*splat
//
// Express 4:
// /api/auth/*
// ======================================================

app.all(
    "/api/auth/*splat",
    toNodeHandler(auth)
);

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running",
        timestamp: new Date().toISOString(),
    });
});

// ======================================================
// NORMAL API ROUTES
// ======================================================

app.use(
    "/api/protected",
    protectedRoutes
);

app.use(
    "/api/appearance",
    appearanceRoutes
);

app.use(
    "/api/agents",
    agentsRoutes
);

app.use(
    "/api/orgs",
    require("./routes/orgs")
);

app.use(
    "/api/media",
    mediaRoutes
);

app.use(
    "/api/whatsapp",
    require("./routes/whatsapp")
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        errorCode: "ROUTE_NOT_FOUND",
    });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error(
        "Unhandled error:",
        err
    );

    res.status(
        err.status || 500
    ).json({
        success: false,
        message:
            err.message ||
            "Internal server error",

        errorCode:
            err.code ||
            "INTERNAL_ERROR",
    });
});

// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {

    try {

        await createUsersTable();

        app.listen(
            PORT,
            () => {

                const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`;

                console.log(
                    `Server is running on port ${PORT}`
                );

                console.log(
                    `Better Auth: ${baseURL}/api/auth`
                );

                console.log(
                    `Frontend origins:`,
                    LOCALHOST_ORIGINS
                );
            }
        );

    } catch (err) {

        console.error(
            "Failed to start server:",
            err
        );

        process.exit(1);
    }
};

// Start
startServer();

// ======================================================
// ERROR HANDLERS
// ======================================================

process.on(
    "unhandledRejection",
    (reason, promise) => {

        console.error(
            "Unhandled Rejection at:",
            promise,
            "reason:",
            reason
        );
    }
);

process.on(
    "uncaughtException",
    (err) => {

        console.error(
            "Uncaught Exception:",
            err
        );

        process.exit(1);
    }
);