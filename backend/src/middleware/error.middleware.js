const multer = require('multer');

module.exports = function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File too large. Max size is 2MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }

    // Custom fileFilter errors (like wrong file type) come through as regular Error
    if (err.message && err.message.includes('Only JPEG, PNG')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};