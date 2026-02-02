const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const http = require('http');
const { setupSocket } = require('./utils/socket');
const { csrfProtection, generateCsrfToken } = require('./middleware/csrfMiddleware');

// Hata işleyici
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Rotaları içe aktar
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const onlineUserRoutes = require('./routes/onlineUserRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const settingRoutes = require('./routes/settingRoutes');
const sitemapController = require('./controllers/sitemapController');

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// Make io accessible to routes
app.set('io', io);

// 1) GLOBAL MIDDLEWARES

// Geliştirme ortamında istek logları
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS ayarları
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // undefined değerleri temizle

app.use(cors({
  origin: function (origin, callback) {
    // Origin yoksa (örneğin Postman'den) veya izin verilen origin'lerden biriyse izin ver
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy tarafından izin verilmedi'));
    }
  },
  credentials: true
}));

// Body parser, veriyi okuma ve boyut sınırı
app.use(express.json({ limit: '10kb' }));

// Statik dosyaları sun
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Session ayarları
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.use(session({
  key: 'sid',
  secret: process.env.JWT_SECRET || 'super-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false, // false is better for login sessions, but for CSRF we might need a session immediately? 
  // Actually, if we want CSRF for anonymous users (like login/register forms or visitor tracking), we need a session.
  // But usually CSRF is for authenticated actions. 
  // However, the user wants visitor tracking to work.
  // Let's set saveUninitialized: true to ensure a session exists for the CSRF token.
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// CSRF Token Oluşturma (Her istekte çalışsın ki cookie set edilsin)
app.use(generateCsrfToken);

// CSRF Koruması
app.use(csrfProtection);

// XSS koruması
// app.use(xss());

// HTTP Parametre Kirliliği önleme
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// API istek limiti (100 istek/IP/15dk)
const limiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000, // 15 dakika
  message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
});
app.use('/api', limiter);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROTALAR
app.use('/api/v1/users', (req, res, next) => {
  console.log(`[Users Route] Request for ${req.method} ${req.url}`);
  console.log(`[Users Route] Content-Type: ${req.headers['content-type']}`);
  next();
}, userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/online-users', onlineUserRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/messages', require('./routes/messageRoutes'));
app.use('/api/v1/settings', settingRoutes);

// Dynamic sitemap (served as XML)
app.get('/sitemap.xml', sitemapController.getSitemap);

// 3) TANIMLANMAYAN ROTALAR İÇİN
app.all(/(.*)/, (req, res, next) => {
  console.log(`Route Not Found: ${req.originalUrl}`);
  next(new AppError(`Bu URL bulunamadı: ${req.originalUrl}`, 404));
});

// 4) GLOBAL HATA YAKALAYICI
app.use(globalErrorHandler);

// 5) SUNUCUYU BAŞLAT
const { sequelize, User } = require('./models');

// ...

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@edumini.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      await User.create({
        username: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

const seedData = require('./utils/seedData');
const createDB = require('./utils/dbInit');

const PORT = process.env.PORT || 5000;

createDB().then(() => {
  sequelize.sync({ alter: true })
    .then(async () => {
      console.log('MySQL veritabanı bağlantısı başarılı ve tablolar senkronize edildi.');
      await seedData();
      server.listen(PORT, () => {
        console.log(`Uygulama ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor...`);
      });
    })
    .catch(err => {
      console.error('Veritabanı bağlantı hatası:', err);
    });
});

// İşlenmeyen hataları yakala
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Kapatılıyor...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM ALINDI. Uygulama kapatılıyor...');
  server.close(() => {
    console.log('💥 İşlem sonlandırıldı');
  });
});
