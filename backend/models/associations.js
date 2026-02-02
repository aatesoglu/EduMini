/**
 * Sequelize Model Associations
 * 
 * Bu dosya tüm Sequelize model ilişkilerini (associations) tanımlar.
 * Model ilişkileri burada merkezi olarak yönetilir.
 * 
 * NOT: Bu dosya referans amaçlıdır. Gerçek association'lar 
 * backend/models/index.js dosyasında tanımlıdır ve oradan çalışır.
 * 
 * İlişki Tipleri:
 * - hasMany: One-to-Many (Bir kullanıcı birden fazla kurs oluşturabilir)
 * - belongsTo: Many-to-One (Her kurs bir eğitmene aittir)
 * - belongsToMany: Many-to-Many (Kullanıcılar birden fazla kursa kayıt olabilir)
 */

const sequelize = require('../config/database');
const User = require('./userModel');
const Course = require('./courseModel');
const Review = require('./reviewModel');
const Visitor = require('./visitorModel');
const Announcement = require('./announcementModel');
const Message = require('./messageModel');
const Setting = require('./settingModel')(sequelize, require('sequelize').DataTypes);

/**
 * ============================================
 * USER ↔ COURSE İLİŞKİLERİ
 * ============================================
 */

// 1. User → Course (One-to-Many)
// Bir kullanıcı (eğitmen) birden fazla kurs oluşturabilir
User.hasMany(Course, {
    foreignKey: 'instructorId',        // courses tablosunda instructor_id kolonu
    as: 'instructedCourses',          // User.getInstructedCourses() ile erişim
    onDelete: 'RESTRICT',              // Eğitmen silinirse kurslar silinmez
    onUpdate: 'CASCADE'                // Eğitmen ID değişirse kurslarda güncellenir
});

// Course → User (Many-to-One)
// Her kurs bir eğitmene aittir
Course.belongsTo(User, {
    foreignKey: 'instructorId',        // courses.instructor_id → users.id
    as: 'instructor',                  // Course.getInstructor() ile erişim
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

// 2. User ↔ Course (Many-to-Many)
// Bir kullanıcı birden fazla kursa kayıt olabilir
// Bir kurs birden fazla öğrenciye sahip olabilir
User.belongsToMany(Course, {
    through: 'Enrollments',            // Junction table adı
    foreignKey: 'UserId',              // Enrollments tablosunda user_id
    otherKey: 'CourseId',              // Enrollments tablosunda course_id
    as: 'enrolledCourses',             // User.getEnrolledCourses() ile erişim
    timestamps: true,                   // created_at, updated_at eklenir
    onDelete: 'CASCADE',               // Kullanıcı silinirse kayıtlar silinir
    onUpdate: 'CASCADE'
});

Course.belongsToMany(User, {
    through: 'Enrollments',            // Aynı junction table
    foreignKey: 'CourseId',            // Enrollments tablosunda course_id
    otherKey: 'UserId',                // Enrollments tablosunda user_id
    as: 'students',                    // Course.getStudents() ile erişim
    timestamps: true,
    onDelete: 'CASCADE',               // Kurs silinirse kayıtlar silinir
    onUpdate: 'CASCADE'
});

/**
 * ============================================
 * COURSE ↔ REVIEW İLİŞKİLERİ
 * ============================================
 */

// Course → Review (One-to-Many)
// Bir kurs birden fazla yoruma sahip olabilir
Course.hasMany(Review, {
    foreignKey: 'courseId',             // reviews.course_id → courses.id
    as: 'reviews',                      // Course.getReviews() ile erişim
    onDelete: 'CASCADE',                // Kurs silinirse yorumlar silinir
    onUpdate: 'CASCADE'
});

// Review → Course (Many-to-One)
// Her yorum bir kursa aittir
Review.belongsTo(Course, {
    foreignKey: 'courseId',             // reviews.course_id → courses.id
    as: 'course',                       // Review.getCourse() ile erişim
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * ============================================
 * USER ↔ REVIEW İLİŞKİLERİ
 * ============================================
 */

// User → Review (One-to-Many)
// Bir kullanıcı birden fazla yorum yapabilir
User.hasMany(Review, {
    foreignKey: 'userId',               // reviews.user_id → users.id
    as: 'reviews',                      // User.getReviews() ile erişim
    onDelete: 'CASCADE',                // Kullanıcı silinirse yorumlar silinir
    onUpdate: 'CASCADE'
});

// Review → User (Many-to-One)
// Her yorum bir kullanıcıya aittir
Review.belongsTo(User, {
    foreignKey: 'userId',               // reviews.user_id → users.id
    as: 'User',                         // Review.getUser() ile erişim (büyük U Sequelize convention)
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

/**
 * ============================================
 * BAĞIMSIZ MODELLER
 * ============================================
 * 
 * Aşağıdaki modeller diğer modellerle ilişkisi olmayan
 * bağımsız modellerdir:
 * 
 * - Visitor: IP bazlı ziyaretçi takibi
 * - Announcement: Duyurular (herkese açık)
 * - Message: İletişim mesajları (admin'e gelen)
 * - Setting: Key-value ayarları
 */

/**
 * ============================================
 * EXPORT
 * ============================================
 */

module.exports = {
    sequelize,
    User,
    Course,
    Review,
    Visitor,
    Announcement,
    Message,
    Setting
};

/**
 * ============================================
 * KULLANIM ÖRNEKLERİ
 * ============================================
 * 
 * // 1. Kullanıcının oluşturduğu kursları getir
 * const instructor = await User.findByPk(1, {
 *     include: [{ model: Course, as: 'instructedCourses' }]
 * });
 * 
 * // 2. Kursun eğitmenini getir
 * const course = await Course.findByPk(1, {
 *     include: [{ model: User, as: 'instructor' }]
 * });
 * 
 * // 3. Kullanıcının kayıtlı olduğu kursları getir
 * const user = await User.findByPk(1, {
 *     include: [{ model: Course, as: 'enrolledCourses' }]
 * });
 * 
 * // 4. Kursun öğrencilerini getir
 * const course = await Course.findByPk(1, {
 *     include: [{ model: User, as: 'students' }]
 * });
 * 
 * // 5. Kursun yorumlarını ve yorum sahiplerini getir
 * const course = await Course.findByPk(1, {
 *     include: [{
 *         model: Review,
 *         include: [{ model: User }]
 *     }]
 * });
 * 
 * // 6. Kullanıcıyı kursa kaydet
 * const course = await Course.findByPk(1);
 * const user = await User.findByPk(1);
 * await course.addStudent(user);
 * 
 * // 7. Kullanıcının kursa kayıtlı olup olmadığını kontrol et
 * const isEnrolled = await course.hasStudent(user);
 * 
 * // 8. Kullanıcıyı kurstan çıkar
 * await course.removeStudent(user);
 */

