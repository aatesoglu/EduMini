const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const courseUpload = require('../utils/courseUpload');

const router = express.Router();

// Herkese açık rotalar
router
  .route('/')
  .get(courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('instructor', 'admin'),
    courseUpload.single('image'),
    courseController.createCourse
  );

router.get('/search', courseController.searchCourses);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('instructor', 'admin'),
    courseUpload.single('image'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('instructor', 'admin'),
    courseController.deleteCourse
  );

// Kursa kayıt olma
router.post(
  '/:id/enroll',
  authController.protect,
  authController.restrictTo('student', 'instructor'),
  courseController.enrollCourse
);

module.exports = router;
