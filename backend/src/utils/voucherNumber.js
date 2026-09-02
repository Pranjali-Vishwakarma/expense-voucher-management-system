const pool = require('../config/db');

async function generateVoucherNumber() {
    const year = new Date().getFullYear();
    const result = await pool.query(
        `SELECT COUNT(*) FROM vouchers WHERE voucher_number LIKE $1`,
        [`EV-${year}-%`]
    );
    const nextSeq = parseInt(result.rows[0].count, 10) + 1;
    return `EV-${year}-${String(nextSeq).padStart(4, '0')}`; // e.g. EV-2026-0001
}

module.exports = generateVoucherNumber;