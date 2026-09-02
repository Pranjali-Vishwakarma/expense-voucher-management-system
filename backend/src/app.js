const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error.middleware');
const auth = require('./middleware/auth.middleware');
const voucherRoutes = require('./routes/voucher.routes');
const app = express();
const path = require('path');
const uploadRoutes = require('./routes/upload.routes');

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

app.use('/api/auth', authRoutes);
app.get('/api/protected-test', auth, (req, res) => {
    res.json({ success: true, message: `Hello ${req.user.name}, role: ${req.user.role}` });
});

app.use('/api/vouchers', voucherRoutes);


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/upload', uploadRoutes)

app.use(errorHandler);
module.exports = app;