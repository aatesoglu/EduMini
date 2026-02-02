const express = require('express');
const visitorController = require('../controllers/visitorController');
const authController = require('../controllers/authController');

const router = express.Router();

// Apply visitor tracking to all routes
router.use(visitorController.trackVisitor);

// Track visitor endpoint
router.post('/track', (req, res) => {
  res.status(200).json({ status: 'success' });
});

// Get visitor statistics (public or protected? User asked for display, so likely public)
// Changing to public for now to allow frontend to fetch it easily
router.get(
  '/stats',
  visitorController.getVisitorStats
);

module.exports = router;
