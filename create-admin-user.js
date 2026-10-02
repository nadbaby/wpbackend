/**
 * create-admin-user.js
 * ---------------------
 * Creates the first Better Auth user directly through the Better Auth API.
 * Run once with:  node create-admin-user.js
 */

require('dotenv').config();

const { auth } = require('./lib/auth');

const EMAIL = 'Abhay12@gmail.com';
const PASSWORD = 'abhay@1212';
const NAME = 'Abhay';

(async () => {
    console.log('🔐 Creating Better Auth user...');
    console.log('   Email   :', EMAIL);
    console.log('   Name    :', NAME);

    try {
        // Better Auth exposes an internal API you can call directly in Node
        const result = await auth.api.signUpEmail({
            body: {
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
            },
        });

        console.log('\n✅ User created successfully!');
        console.log('   User ID :', result?.user?.id);
        console.log('   Email   :', result?.user?.email);
        console.log('   Name    :', result?.user?.name);
        console.log('\nYou can now log in with:');
        console.log('   Email   :', EMAIL);
        console.log('   Password:', PASSWORD);

    } catch (err) {
        // Better Auth throws an error object with a body property
        const message =
            err?.body?.message ||
            err?.message ||
            JSON.stringify(err);

        if (message && message.toLowerCase().includes('already')) {
            console.warn('\n⚠️  User already exists for:', EMAIL);
            console.log('   You can log in straight away.');
        } else {
            console.error('\n❌ Failed to create user:', message);
            console.error(err);
            process.exit(1);
        }
    }

    process.exit(0);
})();
