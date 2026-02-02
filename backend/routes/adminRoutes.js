const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Tüm admin rotaları için giriş yapmış ve admin rolüne sahip olmak gerekir
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;
