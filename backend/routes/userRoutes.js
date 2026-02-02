const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// Auth Rotaları
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/refresh-token', authController.refreshToken);
router.post('/reset-password-demo', authController.resetPasswordDemo);

// Tüm kullanıcıları getir (Sadece admin)
router.get('/', authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

// Yeni kullanıcı oluştur (Public olabilir veya admin) - Şimdilik public bırakalım veya signup kullanılsın
router.post('/', userController.createUser);

// Belirli bir kullanıcıyı getir (Sadece admin veya kendisi - şimdilik admin yapalım basitlik için)
router.get('/:id', authController.protect, authController.restrictTo('admin'), userController.getUserById);

// Kullanıcının kendi kurslarını getir
router.get('/me/courses', authController.protect, userController.getMyCourses);

// Kullanıcı güncelle (Kullanıcının kendisi) + profil fotoğrafı yükleme
router.put(
    '/:id',
    authController.protect,
    upload.single('profileImage'),
    userController.updateUser
);

// Kullanıcı rolünü güncelle (Sadece admin)
router.patch('/:id/role', authController.protect, authController.restrictTo('admin'), userController.updateUserRole);

// Kullanıcı sil (Sadece admin)
router.delete('/:id', authController.protect, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
