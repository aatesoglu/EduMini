const { User } = require('../models');

// Tüm kullanıcıları getir
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Yeni kullanıcı oluştur
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // E-posta adresi kontrolü
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
        }

        const newUser = await User.create({
            username,
            email,
            password, // Model hook'unda hash'lenecek
            role: role || 'student'
        });

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Kullanıcı detaylarını getir
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kullanıcı güncelle
const updateUser = async (req, res) => {
    try {
        console.log('Update User Request Body (Raw):', req.body);
        console.log('Update User Request File:', req.file);

        // Prevent crash if req.body is undefined
        const body = req.body || {};
        const { username, email, password } = body;

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;

        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        if (req.file) {
            updateData.profileImage = req.file.filename;
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            console.log('Update User: User not found with ID', req.params.id);
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        await user.update(updateData);

        // Şifreyi hariç tutarak döndür
        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Kullanıcı rolünü güncelle (Sadece admin)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({ status: 'fail', message: 'Geçersiz rol' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'Kullanıcı bulunamadı' });
        }

        await user.update({ role });

        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// Kullanıcı sil
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'Kullanıcı bulunamadı' });
        }

        await user.destroy();
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Kullanıcının kayıtlı olduğu kursları getir
const getMyCourses = async (req, res) => {
    try {
        const { Course, User } = require('../models');
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Course,
                    as: 'enrolledCourses',
                    through: { attributes: [] }, // Ara tablo özelliklerini getirme
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['id', 'username', 'email']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Serialize courses with instructor data
        const courses = user.enrolledCourses.map(course => {
            const courseData = course.toJSON ? course.toJSON() : course;
            return courseData;
        });

        res.json({
            status: 'success',
            data: {
                courses: courses
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserRole,
    deleteUser,
    getMyCourses
};
