const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .post(messageController.createMessage)
    .get(
        authController.protect,
        authController.restrictTo('admin'),
        messageController.getAllMessages
    );

router
    .route('/:id')
    .get(
        authController.protect,
        authController.restrictTo('admin'),
        messageController.getMessage
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        messageController.deleteMessage
    );

router.post(
    '/:id/reply',
    authController.protect,
    authController.restrictTo('admin'),
    messageController.replyToMessage
);

module.exports = router;
