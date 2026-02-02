const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Token'ı al
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('Bu sayfaya erişmek için giriş yapmalısınız', 401)
        );
    }

    // 2) Token'ı doğrula
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Kullanıcı hala mevcut mu kontrol et
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('Token\'a ait kullanıcı artık mevcut değil', 401)
        );
    }

    // 4) Kullanıcı şifre değiştirdi mi kontrol et
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('Kullanıcı yakın zamanda şifresini değiştirdi! Lütfen tekrar giriş yapın.', 401)
        );
    }

    // Kullanıcıyı request objesine ekle
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Bu işlemi yapmak için yetkiniz yok', 403)
            );
        }
        next();
    };
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Token'ı doğrula
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Kullanıcı hala mevcut mu kontrol et
            const currentUser = await User.findByPk(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Kullanıcı şifre değiştirdi mi kontrol et
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // Kullanıcı giriş yapmış
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};
