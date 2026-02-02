const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Tüm yorumlar
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('student'),
    reviewController.createReview
  );

// Kursa ait yorumlar
router.get('/course/:courseId', reviewController.getCourseReviews);

// Kullanıcının yorumları
router.get(
  '/my-reviews',
  authController.protect,
  reviewController.getMyReviews
);

// Tek bir yorum işlemleri
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('student', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('student', 'admin'),
    reviewController.deleteReview
  );

// Yorum yanıtlama (Eğitmen)
router.post(
  '/:id/reply',
  authController.protect,
  authController.restrictTo('instructor', 'admin'),
  reviewController.replyToReview
);

module.exports = router;
