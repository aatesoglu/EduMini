const Visitor = require('../models/visitorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Track visitor with IP check
const trackVisitor = catchAsync(async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Track the visitor
  if (ip) {
    await Visitor.trackVisit(ip);
  }

  next();
});

// Get visitor statistics
const getVisitorStats = catchAsync(async (req, res, next) => {
  const totalVisitors = await Visitor.getTotalVisitors();

  res.status(200).json({
    status: 'success',
    data: {
      totalVisitors
    }
  });
});

module.exports = {
  trackVisitor,
  getVisitorStats
};
