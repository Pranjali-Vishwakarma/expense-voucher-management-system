require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
    const users = [
        { name: 'Alice Employee', email: 'employee@pspl.com', password: 'password123', role: 'employee' },
        { name: 'Bob Director', email: 'director@pspl.com', password: 'password123', role: 'director' },
        { name: 'Carol Accounts', email: 'accounts@pspl.com', password: 'password123', role: 'accounts' },
    ];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
            [u.name, u.email, hash, u.role]
        );
    }

    console.log('Seed complete');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});