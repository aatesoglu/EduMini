const AppError = require('../utils/appError');

exports.validateBody = (...fields) => {
    return (req, res, next) => {
        const missingFields = fields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return next(
                new AppError(`Lütfen şu alanları doldurun: ${missingFields.join(', ')}`, 400)
            );
        }

        next();
    };
};
