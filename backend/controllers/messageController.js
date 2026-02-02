const { Message } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createMessage = catchAsync(async (req, res, next) => {
    const newMessage = await Message.create({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    });

    res.status(201).json({
        status: 'success',
        data: {
        }
    });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
    const messages = await Message.findAll({
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
            messages
        }
    });
});

exports.getMessage = catchAsync(async (req, res, next) => {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
        return next(new AppError('Mesaj bulunamadı', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            message
        }
    });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
        return next(new AppError('Mesaj bulunamadı', 404));
    }

    await message.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.replyToMessage = catchAsync(async (req, res, next) => {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
        return next(new AppError('Mesaj bulunamadı', 404));
    }

    message.reply = req.body.reply;
    message.isRead = true; // Cevap verildiğinde okundu olarak işaretle
    await message.save();

    // Burada e-posta gönderme işlemi de yapılabilir (nodemailer ile)

    res.status(200).json({
        status: 'success',
        data: {
            message
        }
    });
});
