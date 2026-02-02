const express = require('express');
const settingController = require('../controllers/settingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', settingController.getAllSettings);

// Sadece admin güncelleyebilir
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.post('/', settingController.updateSettings);

module.exports = router;
