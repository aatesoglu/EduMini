const express = require('express');
const instructorController = require('../controllers/instructorController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);
router.use(authController.restrictTo('instructor', 'admin')); // Admin de görebilsin opsiyonel olarak

router.get('/my-courses', instructorController.getMyCourses);

module.exports = router;
