const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/voucher.controller');

router.use(auth); // all voucher routes require login

router.post('/', role('employee'), controller.createVoucher);
router.get('/mine', role('employee'), controller.getMyVouchers);
router.put('/:id', role('employee'), controller.updateVoucher);
router.delete('/:id', role('employee'), controller.deleteVoucher);
router.get('/:id', controller.getVoucherById); // employee/director/accounts, ownership checked inside

module.exports = router;