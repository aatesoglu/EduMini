const { User, Course, Visitor, sequelize } = require('../models');
const AppError = require('../utils/appError');
const { getOnlineUsers: getSocketOnlineUsers } = require('../utils/socket');

// Dashboard İstatistiklerini Getir
exports.getDashboardStats = async (req, res, next) => {
    try {
        // 1. Toplam Kullanıcı Sayısı
        const totalUsers = await User.count();

        // 2. Toplam Kurs Sayısı
        const totalCourses = await Course.count();

        // 3. Anlık Online Kullanıcı Sayısı
        const onlineUsersCount = getSocketOnlineUsers().length;

        // 4. Toplam Ziyaretçi Sayısı
        const totalVisitors = await Visitor.getTotalVisitors();

        // 5. Son Kayıtlar (Enrollments tablosundan)
        // Sequelize otomatik oluşturulan junction tablosuna erişim
        const Enrollment = sequelize.model('Enrollments');
        const recentEnrollmentsRaw = await Enrollment.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        // Kayıt detaylarını zenginleştir (Öğrenci ve Kurs isimlerini al)
        const recentEnrollments = await Promise.all(recentEnrollmentsRaw.map(async (enrollment) => {
            const student = await User.findByPk(enrollment.UserId, { attributes: ['username'] });
            const course = await Course.findByPk(enrollment.CourseId, { attributes: ['title'] });
            return {
                id: enrollment.createdAt.getTime(), // Unique ID olarak timestamp
                student: student ? student.username : 'Silinmiş Kullanıcı',
                course: course ? course.title : 'Silinmiş Kurs',
                date: enrollment.createdAt.toLocaleDateString('tr-TR')
            };
        }));

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalUsers,
                    totalCourses,
                    onlineUsers: onlineUsersCount,
                    totalVisitors
                },
                recentEnrollments
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        next(new AppError('İstatistikler alınırken bir hata oluştu', 500));
    }
};

// Tüm kullanıcıları getir (Öğrenci, Eğitmen, Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        console.log('Admin: Fetching all users...');
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        console.log(`Admin: Found ${users.length} users.`);

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        console.error('Admin: Error fetching users:', error);
        next(error);
    }
};

// Kullanıcı sil (Admin yetkisiyle)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return next(new AppError('Kullanıcı bulunamadı', 404));
        }

        await user.destroy();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Kullanıcı rolünü güncelle
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return next(new AppError('Kullanıcı bulunamadı', 404));
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};
