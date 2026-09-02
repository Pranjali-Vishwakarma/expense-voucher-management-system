const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/voucher.controller');

router.use(auth); // all voucher routes require login

//Universal stats route (controller logic handles role-based scoping)
router.get('/stats', controller.getVoucherStats);

// Employee only
router.post('/', role('employee'), controller.createVoucher);
router.get('/mine', role('employee'), controller.getMyVouchers);
router.put('/:id', role('employee'), controller.updateVoucher);
router.delete('/:id', role('employee'), controller.deleteVoucher);

// Director-only
router.get('/pending', role('director'), controller.getPendingVouchers);
router.patch('/:id/approve', role('director'), controller.approveVoucher);
router.patch('/:id/reject', role('director'), controller.rejectVoucher);

// Director + Accounts (org-wide view)
router.get('/', role('director', 'accounts'), controller.getAllVouchers);

// employee/director/accounts, ownership checked inside
router.get('/:id', controller.getVoucherById);

module.exports = router;