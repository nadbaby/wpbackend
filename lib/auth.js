const { betterAuth } = require("better-auth");
const { admin } = require("better-auth/plugins");
const { Pool } = require("pg");

const auth = betterAuth({

    // IMPORTANT: Do NOT add /api/auth here — just the base domain
    baseURL:
        process.env.BETTER_AUTH_URL ||
        "http://localhost:5000",

    // REQUIRED: Secret key used to sign sessions
    // Set BETTER_AUTH_SECRET in your Render environment variables
    secret:
        process.env.BETTER_AUTH_SECRET ||
        "fallback-dev-secret-change-in-production",

    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),

    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        admin(),
    ],

    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://wpfrontend-blue.vercel.app",
    ],
});

module.exports = {
    auth,
};