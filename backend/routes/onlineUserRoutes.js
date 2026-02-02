const express = require('express');
const onlineUserController = require('../controllers/onlineUserController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get online user count (public)
router.get('/count', onlineUserController.getOnlineUserCount);

// Get online users (admin only)
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  onlineUserController.getOnlineUsers
);

module.exports = router;
