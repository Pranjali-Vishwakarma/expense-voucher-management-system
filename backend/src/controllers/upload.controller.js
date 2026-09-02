exports.uploadSignature = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Build a URL path the frontend can use to fetch/display the image
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/signatures/${req.file.filename}`;

        res.status(201).json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
        });
    } catch (err) {
        next(err);
    }
};