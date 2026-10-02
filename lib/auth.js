const { betterAuth } = require("better-auth");
const { admin } = require("better-auth/plugins");
const { Pool } = require("pg");

const auth = betterAuth({

    // IMPORTANT:
    // Do NOT add /api/auth here
    baseURL:
        process.env.BETTER_AUTH_URL ||
        "http://localhost:5000",

    database: new Pool({
        connectionString:
            process.env.DATABASE_URL,
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