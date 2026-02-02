const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('UploadMiddleware: Saving file...', file.originalname);
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        // Güvenli dosya adı: file-{userId}-{timestamp}.{ext}
        const ext = path.extname(file.originalname).toLowerCase();
        // Sadece güvenli uzantıları kabul et
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const safeExt = allowedExts.includes(ext) ? ext : '.jpg'; // Varsayılan jpg
        cb(null, `file-${req.user ? req.user.id : 'unknown'}-${Date.now()}${safeExt}`);
    }
});

const multerFilter = (req, file, cb) => {
    console.log('Multer Filter: Checking file...', file.originalname, 'Mimetype:', file.mimetype);
    
    // Sadece resim dosyalarını kabul et
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Sadece resim dosyaları yüklenebilir! (JPEG, PNG, JPG, GIF, WEBP)', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Tek dosya
    }
});

module.exports = upload;
