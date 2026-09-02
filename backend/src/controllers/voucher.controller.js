const pool = require('../config/db');
const generateVoucherNumber = require('../utils/voucherNumber');

// POST /api/vouchers  (body includes { action: 'draft' | 'submit', ...fields })
exports.createVoucher = async (req, res, next) => {
    try {
        const {
            voucher_date, expense_date, department_name, expense_title,
            expense_category, expense_description, amount,
            employee_signature_url, action,
        } = req.body;

        if (!department_name || !expense_title || !expense_date || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        }
        if (action === 'submit' && !employee_signature_url) {
            return res.status(400).json({ success: false, message: 'Signature is required before submission' });
        }

        const voucherNumber = await generateVoucherNumber();
        const status = action === 'submit' ? 'submitted' : 'draft';

        const result = await pool.query(
            `INSERT INTO vouchers
        (voucher_number, voucher_date, expense_date, department_name, expense_title,
         expense_category, expense_description, amount, employee_id, employee_signature_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
            [voucherNumber, voucher_date, expense_date, department_name, expense_title,
                expense_category, expense_description, amount, req.user.id, employee_signature_url || null, status]
        );

        res.status(201).json({ success: true, voucher: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// GET /api/vouchers/mine
exports.getMyVouchers = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT * FROM vouchers WHERE employee_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, vouchers: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/vouchers/:id
exports.getVoucherById = async (req, res, next) => {
    try {
        const result = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [req.params.id]);
        const voucher = result.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

        // Employees can only view their own vouchers
        if (req.user.role === 'employee' && voucher.employee_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        res.json({ success: true, voucher });
    } catch (err) {
        next(err);
    }
};

// PUT /api/vouchers/:id  (edit — draft only, own voucher only)
exports.updateVoucher = async (req, res, next) => {
    try {
        const existing = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [req.params.id]);
        const voucher = existing.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
        if (voucher.employee_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (voucher.status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Only draft vouchers can be edited' });
        }

        const {
            voucher_date, expense_date, department_name, expense_title,
            expense_category, expense_description, amount, employee_signature_url, action,
        } = req.body;

        if (action === 'submit' && !employee_signature_url) {
            return res.status(400).json({ success: false, message: 'Signature is required before submission' });
        }
        const status = action === 'submit' ? 'submitted' : 'draft';

        const result = await pool.query(
            `UPDATE vouchers SET
        voucher_date=$1, expense_date=$2, department_name=$3, expense_title=$4,
        expense_category=$5, expense_description=$6, amount=$7,
        employee_signature_url=$8, status=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 RETURNING *`,
            [voucher_date, expense_date, department_name, expense_title, expense_category,
                expense_description, amount, employee_signature_url, status, req.params.id]
        );

        res.json({ success: true, voucher: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/vouchers/:id  (draft only, own voucher only)
exports.deleteVoucher = async (req, res, next) => {
    try {
        const existing = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [req.params.id]);
        const voucher = existing.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
        if (voucher.employee_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (voucher.status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Only draft vouchers can be deleted' });
        }

        await pool.query(`DELETE FROM vouchers WHERE id = $1`, [req.params.id]);
        res.json({ success: true, message: 'Voucher deleted' });
    } catch (err) {
        next(err);
    }
};