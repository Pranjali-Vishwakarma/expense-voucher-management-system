const multer = require('multer');

module.exports = function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.message}`);

    let statusCode = err.status || 500;
    let message = err.message || 'Internal server error';
    let code = 'SERVER_ERROR';

    // File Upload Errors
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Max size is 2MB.';
        }
        code = 'UPLOAD_ERROR';
    } else if (err.message && err.message.includes('Only JPEG, PNG')) {
        statusCode = 400;
        code = 'INVALID_FILE_TYPE';
    }

    // PostgreSQL Database Errors
    if (err.code) {
        if (err.code === '23505') { // Unique constraint violation (e.g. duplicate email)
            statusCode = 409;
            message = 'Duplicate entry found. This record already exists.';
            code = 'DUPLICATE_ENTRY';
        } else if (err.code === '22P02') { // Invalid text representation
            statusCode = 400;
            message = 'Invalid data format provided.';
            code = 'INVALID_DATA';
        }
    }

    // Strictly consistent JSON shape for the frontend
    res.status(statusCode).json({
        success: false,
        message,
        code,
        // Only leak sensitive stack traces if we are in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
