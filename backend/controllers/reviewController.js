const { Review, Course, User, sequelize } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Course rating'ini güncelleme fonksiyonu
const updateCourseRating = async (courseId) => {
  try {
    const result = await sequelize.query(
      `SELECT AVG(rating) as avgRating, COUNT(id) as reviewCount 
       FROM reviews 
       WHERE course_id = :courseId`,
      {
        replacements: { courseId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (result && result.length > 0 && result[0].avgRating !== null) {
      const avgRating = parseFloat(result[0].avgRating).toFixed(1);
      await Course.update(
        { rating: avgRating },
        { where: { id: courseId } }
      );
    } else {
      // Hiç review yoksa rating'i 0 yap
      await Course.update(
        { rating: 0 },
        { where: { id: courseId } }
      );
    }
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
};

// Tüm yorumları getir
const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Yeni yorum oluştur
const createReview = catchAsync(async (req, res, next) => {
  // Kullanıcı bu kursa kayıtlı mı kontrol et
  const course = await Course.findByPk(req.body.courseId || req.body.course);
  if (!course) {
    return next(new AppError('Kurs bulunamadı', 404));
  }

  const user = await User.findByPk(req.user.id);
  const isEnrolled = await course.hasStudent(user);

  if (!isEnrolled) {
    return next(
      new AppError('Bu kursa yorum yapmak için kayıtlı olmalısınız', 400)
    );
  }

  // Kullanıcı daha önce bu kursa yorum yapmış mı kontrol et
  const existingReview = await Review.findOne({
    where: {
      userId: req.user.id,
      courseId: req.body.courseId || req.body.course
    }
  });

  if (existingReview) {
    return next(new AppError('Bu kursa zaten yorum yaptınız', 400));
  }

  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    courseId: req.body.courseId || req.body.course,
    userId: req.user.id
  });

  // Course rating'ini güncelle (hook zaten çalışıyor ama manuel de güncelleyelim)
  await updateCourseRating(newReview.courseId);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

// Tek bir yorumu getir
const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new AppError('Bu ID ile yorum bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Yorum güncelle
const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new AppError('Bu ID ile yorum bulunamadı', 404));
  }

  // Sadece yorum sahibi veya admin güncelleyebilir
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Bu işlemi yapmak için yetkiniz yok', 403)
    );
  }

  await review.update({
    review: req.body.review,
    rating: req.body.rating
  });

  // Course rating'ini güncelle
  await updateCourseRating(review.courseId);

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Yorum sil
const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    return next(new AppError('Bu ID ile yorum bulunamadı', 404));
  }

  // Sadece yorum sahibi veya admin silebilir
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Bu işlemi yapmak için yetkiniz yok', 403)
    );
  }

  const courseId = review.courseId;
  await review.destroy();

  // Course rating'ini güncelle
  await updateCourseRating(courseId);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Kursa ait tüm yorumları getir
const getCourseReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { courseId: req.params.courseId },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['username', 'email'] // photo alanı modelde yoktu, username ve email yeterli
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Kullanıcının yorumlarını getir
const getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']],
    include: [
      {
        model: Course,
        attributes: ['title', 'image']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Eğitmen cevapla
const replyToReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id, {
    include: [{ model: Course }]
  });

  if (!review) {
    return next(new AppError('Bu ID ile yorum bulunamadı', 404));
  }

  // Check if user is instructor of the course or admin
  const isInstructor = review.Course.instructorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isInstructor && !isAdmin) {
    return next(new AppError('Bu yoruma sadece kurs eğitmeni cevap verebilir', 403));
  }

  review.reply = req.body.reply;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

module.exports = {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  getMyReviews,
  replyToReview
};
