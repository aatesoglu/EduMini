const crypto = require('crypto');
const AppError = require('../utils/appError');

function generateToken() {
    return crypto.randomBytes(32).toString('base64url');
}

function safeCompare(a, b) {
    if (!a || !b) return false;
    try {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

// Middleware: token oluşturur (varsa yeniden oluşturmaz)
const generateCsrfToken = (req, res, next) => {
    if (!req.session) {
        console.error('CSRF middleware requires sessions.');
        return next();
    }

    // Only generate a new token if it doesn't exist
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateToken();
    }

    // Set cookie with token
    res.cookie('XSRF-TOKEN', req.session.csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Make token available in response locals
    res.locals.csrfToken = req.session.csrfToken;

    console.log('Generated new CSRF token:', req.session.csrfToken);
    next();
};

// Middleware: doğrulama
const csrfProtection = (req, res, next) => {
    console.log(`CSRF Middleware hit: ${req.method} ${req.originalUrl}`);

    // Bypass CSRF for these methods and paths
    const excludedMethods = ['GET', 'HEAD', 'OPTIONS'];
    const excludedPaths = [
        '/api/v1/users/login',
        '/api/v1/users/signup',
        '/api/v1/auth/refresh-token',
        '/api/v1/announcements',
        '/api/v1/admin/users',
        '/api/v1/admin/announcements',
        '/admin'
    ];

    // Skip CSRF check for excluded methods and paths
    if (excludedMethods.includes(req.method) ||
        excludedPaths.some(path => req.originalUrl.startsWith(path))) {
        console.log(`CSRF check bypassed for ${req.method} ${req.originalUrl}`);
        return next();
    }

    // Log request headers for debugging
    console.log('Request headers:', {
        'x-xsrf-token': req.headers['x-xsrf-token'],
        'x-csrf-token': req.headers['x-csrf-token'],
        'cookie': req.headers.cookie ? 'present' : 'missing'
    });

    // Log session info
    console.log('Session info:', {
        hasSession: !!req.session,
        hasCsrfToken: !!(req.session && req.session.csrfToken)
    });

    // Check if session exists and has a CSRF token
    if (!req.session || !req.session.csrfToken) {
        console.error('CSRF Error: No session or CSRF token found in session');
        return next(new AppError('CSRF token missing (no session token).', 403));
    }

    // Get token from various possible locations
    const token = [
        req.headers['x-xsrf-token'],
        req.headers['x-csrf-token'],
        req.headers['xsrf-token'],
        req.headers['csrf-token'],
        req.cookies ? req.cookies['XSRF-TOKEN'] : null,
        req.body?._csrf,
        req.query?._csrf
    ].find(Boolean); // Get first truthy value

    console.log('CSRF token check:', {
        sessionToken: req.session.csrfToken,
        receivedToken: token ? '***' + token.slice(-4) : 'none',
        tokenSource: token ? 'header' : 'not found'
    });

    if (!token) {
        console.log('CSRF Error: No token provided for URL:', req.originalUrl);
        console.log('Headers:', req.headers);
        return next(new AppError('CSRF token missing.', 403));
    }

    if (!safeCompare(req.session.csrfToken, token)) {
        console.log('CSRF Error: Token mismatch');
        return next(new AppError('Invalid CSRF token.', 403));
    }

    console.log('✅ CSRF token validated successfully.');
    next();
};

module.exports = { csrfProtection, generateCsrfToken };
