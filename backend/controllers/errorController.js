const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Geçersiz ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // SequelizeUniqueConstraintError için
  const value = err.errors[0].value;
  const message = `Bu değer zaten kullanılıyor: ${value}. Lütfen farklı bir değer deneyin.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // SequelizeValidationError için
  const errors = err.errors.map(el => el.message);
  const message = `Geçersiz veri girişi. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Geçersiz token. Lütfen tekrar giriş yapın.', 401);

const handleJWTExpiredError = () =>
  new AppError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Bir şeyler yanlış gitti!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, güvenilir hata: istemciye gönder
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // 1) Hata mesajını logla
    console.error('ERROR 💥', err);

    // 2) Genel mesaj gönder
    return res.status(500).json({
      status: 'error',
      message: 'Bir şeyler çok yanlış gitti!'
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Bir şeyler yanlış gitti!',
      msg: err.message
    });
  }

  // 1) Hata mesajını logla
  console.error('ERROR 💥', err);

  // 2) Genel mesaj gönder
  return res.status(err.statusCode).render('error', {
    title: 'Bir şeyler yanlış gitti!',
    msg: 'Lütfen daha sonra tekrar deneyin.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; // name özelliğini kopyala

    // Sequelize Hataları
    if (error.name === 'SequelizeUniqueConstraintError') error = handleDuplicateFieldsDB(error);
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
