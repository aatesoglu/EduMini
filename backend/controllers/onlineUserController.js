const { getOnlineUsers: getSocketOnlineUsers } = require('../utils/socket');
const catchAsync = require('../utils/catchAsync');

const getOnlineUsers = catchAsync(async (req, res, next) => {
  const onlineUsers = getSocketOnlineUsers();

  res.status(200).json({
    status: 'success',
    data: {
      count: onlineUsers.length,
      users: onlineUsers
    }
  });
});

const getOnlineUserCount = catchAsync(async (req, res, next) => {
  const onlineUsers = getSocketOnlineUsers();

  res.status(200).json({
    status: 'success',
    data: {
      count: onlineUsers.length
    }
  });
});

module.exports = {
  getOnlineUsers,
  getOnlineUserCount
};
