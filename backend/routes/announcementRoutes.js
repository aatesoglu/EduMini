const express = require('express');
const announcementController = require('../controllers/announcementController');
const authController = require('../controllers/authController');
const upload = require('../utils/upload');

const router = express.Router();

// Public route to get active announcements
router.get('/', announcementController.getAllAnnouncements);
// Public route to get single announcement by id (active only)
router.get('/:id', announcementController.getAnnouncement);

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Admin routes
router.get('/admin/all', announcementController.getAllAnnouncementsAdmin);
router.post('/', upload.single('image'), announcementController.createAnnouncement);

router
    .route('/:id')
    .patch(upload.single('image'), announcementController.updateAnnouncement)
    .delete(announcementController.deleteAnnouncement);

module.exports = router;
