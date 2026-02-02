const logger = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(`[${req.requestTime}] ${req.method} ${req.originalUrl}`);
    next();
};

module.exports = logger;
