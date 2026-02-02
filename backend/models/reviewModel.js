const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Course rating'ini güncelleme fonksiyonu (circular dependency'yi önlemek için lazy loading)
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

    const Course = sequelize.models.Course || require('./courseModel');
    
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

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'İnceleme boş olamaz' }
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Puan en az 1 olmalıdır' },
      max: { args: [5], msg: 'Puan en fazla 5 olabilir' }
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'user_id'] // Bir kullanıcı bir kursa sadece bir yorum yapabilir
    }
  ],
  hooks: {
    afterCreate: async (review) => {
      await updateCourseRating(review.courseId);
    },
    afterUpdate: async (review) => {
      await updateCourseRating(review.courseId);
    },
    afterDestroy: async (review) => {
      await updateCourseRating(review.courseId);
    }
  }
});

module.exports = Review;
