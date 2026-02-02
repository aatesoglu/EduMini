const { Course } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyCourses = catchAsync(async (req, res, next) => {
    const courses = await Course.findAll({
        where: { instructorId: req.user.id },
        include: ['reviews'] // İsteğe bağlı: yorumları da getir
    });

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses
        }
    });
});
