const authMiddleware = require('./authMiddleware');
const uploadMiddleware = require('./uploadMiddleware');
const loggerMiddleware = require('./loggerMiddleware');
const validateMiddleware = require('./validateMiddleware');

module.exports = {
    ...authMiddleware,
    upload: uploadMiddleware,
    logger: loggerMiddleware,
    ...validateMiddleware,
    csrfProtection: require('./csrfMiddleware')
};
