const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const upload = require('../config/multer');
const controller = require('../controllers/upload.controller');

// Any authenticated user (employee or director) can upload a signature image
router.post('/signature', auth, upload.single('signature'), controller.uploadSignature);

module.exports = router;