const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('./appError');

// Ensure upload directory exists
const uploadDir = 'public/img/courses';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `course-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Multer filter
const multerFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Sadece resim dosyaları yüklenebilir! (JPEG, PNG, JPG, GIF, WEBP)', 400), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});

module.exports = upload;

