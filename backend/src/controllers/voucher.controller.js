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
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a valid number greater than zero' });
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
        const result = await pool.query(
            `SELECT v.*, u.name AS employee_name, u.email AS employee_email
       FROM vouchers v
       JOIN users u ON v.employee_id = u.id
       WHERE v.id = $1`,
            [req.params.id]
        );
        const voucher = result.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

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

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a valid number greater than zero' });
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

// GET /api/vouchers/pending  (Director only)
exports.getPendingVouchers = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT v.*, u.name AS employee_name, u.email AS employee_email
       FROM vouchers v
       JOIN users u ON v.employee_id = u.id
       WHERE v.status = 'submitted'
       ORDER BY v.created_at ASC`
        );
        res.json({ success: true, vouchers: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/vouchers  (Director + Accounts — all vouchers, org-wide)
exports.getAllVouchers = async (req, res, next) => {
    try {
        const {
            status, department, category,
            startDate, endDate, minAmount, maxAmount,
            sortBy, sortOrder, search
        } = req.query;
        // Base query
        let query = `
            SELECT v.*, u.name AS employee_name, u.email AS employee_email
            FROM vouchers v
            JOIN users u ON v.employee_id = u.id
            WHERE 1=1
        `;
        let params = [];
        let paramIndex = 1;
        // Dynamic Filters
        if (status) {
            query += ` AND v.status = $${paramIndex++}`;
            params.push(status);
        }
        if (department) {
            query += ` AND v.department_name = $${paramIndex++}`;
            params.push(department);
        }
        if (category) {
            query += ` AND v.expense_category = $${paramIndex++}`;
            params.push(category);
        }
        if (startDate) {
            query += ` AND v.created_at >= $${paramIndex++}`;
            params.push(startDate);
        }
        if (endDate) {
            // Add 1 day to include the entire end date (up to 23:59:59)
            query += ` AND v.created_at < ($${paramIndex++}::date + '1 day'::interval)`;
            params.push(endDate);
        }
        if (minAmount) {
            query += ` AND v.amount >= $${paramIndex++}`;
            params.push(minAmount);
        }
        if (maxAmount) {
            query += ` AND v.amount <= $${paramIndex++}`;
            params.push(maxAmount);
        }
        if (search) {
            // ILIKE is case-insensitive search in Postgres
            query += ` AND (v.voucher_number ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        // Safe Sorting (Whitelist array prevents SQL Injection)
        const allowedSorts = ['amount', 'created_at', 'status', 'department_name', 'voucher_number'];
        const sortCol = allowedSorts.includes(sortBy) ? `v.${sortBy}` : 'v.created_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortCol} ${order}`;
        const result = await pool.query(query, params);
        res.json({ success: true, vouchers: result.rows });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/vouchers/:id/approve  (Director only)
exports.approveVoucher = async (req, res, next) => {
    try {
        const { director_signature_url } = req.body;

        if (!director_signature_url) {
            return res.status(400).json({ success: false, message: 'Director signature is required to approve' });
        }

        const existing = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [req.params.id]);
        const voucher = existing.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

        if (voucher.status !== 'submitted') {
            return res.status(400).json({ success: false, message: 'Only submitted vouchers can be approved' });
        }

        const result = await pool.query(
            `UPDATE vouchers SET
        status = 'approved',
        director_signature_url = $1,
        approval_date = CURRENT_TIMESTAMP,
        rejection_reason = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [director_signature_url, req.params.id]
        );

        res.json({ success: true, voucher: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/vouchers/:id/reject  (Director only)
exports.rejectVoucher = async (req, res, next) => {
    try {
        const { rejection_reason } = req.body;

        if (!rejection_reason || !rejection_reason.trim()) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const existing = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [req.params.id]);
        const voucher = existing.rows[0];
        if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

        if (voucher.status !== 'submitted') {
            return res.status(400).json({ success: false, message: 'Only submitted vouchers can be rejected' });
        }

        const result = await pool.query(
            `UPDATE vouchers SET
        status = 'rejected',
        rejection_reason = $1,
        approval_date = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [rejection_reason, req.params.id]
        );

        res.json({ success: true, voucher: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// GET /api/vouchers/stats
exports.getVoucherStats = async (req, res, next) => {
    try {
        let query = `
            SELECT 
                COUNT(*) as total_vouchers,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved_amount,
                COALESCE(SUM(CASE WHEN status = 'submitted' THEN amount ELSE 0 END), 0) as total_pending_amount
            FROM vouchers
        `;
        let params = [];

        // Employees only see stats for their own vouchers
        if (req.user.role === 'employee') {
            query += ` WHERE employee_id = $1`;
            params.push(req.user.id);
        }

        const result = await pool.query(query, params);

        // PostgreSQL returns COUNT and SUM as strings, so we parse them
        const stats = {
            total_vouchers: parseInt(result.rows[0].total_vouchers),
            draft_count: parseInt(result.rows[0].draft_count),
            pending_count: parseInt(result.rows[0].pending_count),
            approved_count: parseInt(result.rows[0].approved_count),
            rejected_count: parseInt(result.rows[0].rejected_count),
            total_approved_amount: parseFloat(result.rows[0].total_approved_amount),
            total_pending_amount: parseFloat(result.rows[0].total_pending_amount)
        };

        res.json({ success: true, stats });
    } catch (err) {
        next(err);
    }
};
