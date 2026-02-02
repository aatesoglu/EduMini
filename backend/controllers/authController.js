const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);
  const refreshToken = signToken(user.id + Date.now()); // Add timestamp to make it unique

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };

  // Emit user connected event if socket is available
  if (req.app.get('io')) {
    req.app.get('io').emit('userConnected', user.id.toString());
  }

  // Set both access and refresh tokens
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    httpOnly: true,
    path: '/api/v1/users/refresh-token'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user
    }
  });
};

// Kayıt olma
const signup = catchAsync(async (req, res, next) => {
  // Sequelize create
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    // passwordConfirm modelde yok, zaten client tarafında veya burada manuel kontrol edilebilir ama model hook'unda hashleniyor
    role: req.body.role || 'student'
  });

  createSendToken(newUser, 201, req, res);
});

// Giriş yapma
const login = catchAsync(async (req, res, next) => {
  console.log('AuthController: Login request received');
  console.log('Body:', req.body);
  const { email, password } = req.body;

  // 1) E-posta ve şifre var mı kontrol et
  if (!email || !password) {
    console.log('AuthController: Email or password missing');
    return next(new AppError('Lütfen e-posta ve şifrenizi girin', 400));
  }

  const trimmedEmail = email.trim();
  console.log(`AuthController: Finding user in DB... Email: '${trimmedEmail}' (Length: ${trimmedEmail.length})`);

  // 2) Kullanıcı var mı ve şifre doğru mu kontrol et
  // Sequelize findOne
  const user = await User.findOne({ where: { email: trimmedEmail } });
  console.log('AuthController: User found result:', user ? user.toJSON() : 'No user found');

  if (!user) {
    console.log('AuthController: User not found');
    return next(new AppError('E-posta veya şifre hatalı', 401));
  }

  console.log('AuthController: Checking password...');
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log('AuthController: Password correct:', isPasswordCorrect);

  if (!isPasswordCorrect) {
    console.log('AuthController: Incorrect password');
    return next(new AppError('E-posta veya şifre hatalı', 401));
  }

  // 3) Her şey yolundaysa token oluştur ve gönder
  console.log('✅ AuthController: Password verified. Logging in user:', user.email);
  createSendToken(user, 200, req, res);
});

// Token yenileme
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token bulunamadı!', 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_SECRET);
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return next(new AppError('Kullanıcı bulunamadı!', 401));
    }

    createSendToken(currentUser, 200, req, res);
  } catch (err) {
    return next(new AppError('Geçersiz refresh token!', 401));
  }
});

// Çıkış yapma
const logout = (req, res) => {
  // Tüm auth cookie'lerini temizle
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/'
  });

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/api/v1/users/refresh-token'
  });

  // Her durumda kullanıcıyı anasayfaya yönlendir (admin panelinden çıkış sonrası istenen davranış)
  return res.redirect('/');
};

// Kullanıcıyı koruma (auth)
const protect = catchAsync(async (req, res, next) => {
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

  console.log('Protect Middleware: Checking token...');
  if (token) console.log('Protect Middleware: Token found (starts with):', token.substring(0, 10) + '...');
  else console.log('Protect Middleware: No token found in headers or cookies');

  if (!token || token === 'null' || token === 'undefined' || token === '') {
    return next(
      new AppError('Bu sayfaya erişmek için giriş yapmalısınız', 401)
    );
  }

  // 2) Token'ı doğrula
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('Protect Middleware: Token verified. User ID:', decoded.id);
  } catch (err) {
    console.error('Protect Middleware: Token verification failed:', err.name, err.message);
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Geçersiz token. Lütfen tekrar giriş yapın.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      console.log('Access token expired, checking refresh token...');
      return next(new AppError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', 401));
    }
    return next(err);
  }

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

  // Token'ı güncelle
  const newToken = signToken(currentUser.id);
  res.cookie('jwt', newToken, {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  // Response header'ına yeni token'ı ekle
  res.set('Authorization', `Bearer ${newToken}`);

  next();
});

// Yetki kontrolü
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bu işlemi yapmak için yetkiniz yok', 403)
      );
    }
    next();
  };
};

// Giriş yapmış kullanıcı kontrolü (sadece render edilen sayfalar için)
const isLoggedIn = async (req, res, next) => {
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

// Demo için şifre sıfırlama (Email doğrulaması olmadan)
const resetPasswordDemo = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  if (!email || !password || !passwordConfirm) {
    return next(new AppError('Lütfen tüm alanları doldurun!', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Şifreler eşleşmiyor!', 400));
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new AppError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', 404));
  }

  user.password = password;
  // passwordConfirm modelde yoksa sorun değil, varsa eklenmeli. Modelde yoktu, hook hashliyor.
  await user.save();

  createSendToken(user, 200, req, res);
});

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  protect,
  restrictTo,
  isLoggedIn,
  resetPasswordDemo
};
