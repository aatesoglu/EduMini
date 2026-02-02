const sequelize = require('../config/database');
const User = require('./userModel');
const Course = require('./courseModel');
const Review = require('./reviewModel');
const Visitor = require('./visitorModel');
const Announcement = require('./announcementModel');
const Message = require('./messageModel');
const Setting = require('./settingModel')(sequelize, require('sequelize').DataTypes);

// İlişkiler
User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

User.belongsToMany(Course, { through: 'Enrollments', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: 'Enrollments', as: 'students' });

Course.hasMany(Review, { foreignKey: 'courseId' });
Review.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Course,
    Review,
    Visitor,
    Announcement,
    Announcement,
    Message,
    Setting
};
