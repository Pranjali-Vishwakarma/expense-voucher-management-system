const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

app.get('/api/health/db', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, dbTime: result.rows[0].now });
    } catch (err) {
        next(err);
    }
});

module.exports = app;