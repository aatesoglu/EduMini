const { Course, User, Review, sequelize } = require('../models');
const { Op } = require('sequelize');

// Tüm kursları getir (Filtreleme, Sıralama ve Sayfalama ile)
const getAllCourses = async (req, res) => {
    try {
        // 1) Filtreleme
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Sequelize için where objesi oluştur
        let whereClause = {};

        // Basit filtreler
        Object.keys(queryObj).forEach(key => {
            // gte, gt, lte, lt kontrolü
            if (typeof queryObj[key] === 'object') {
                Object.keys(queryObj[key]).forEach(operator => {
                    if (['gte', 'gt', 'lte', 'lt'].includes(operator)) {
                        if (!whereClause[key]) whereClause[key] = {};
                        whereClause[key][Op[operator]] = queryObj[key][operator];
                    }
                });
            } else {
                whereClause[key] = queryObj[key];
            }
        });

        // Arama (Search)
        if (req.query.search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${req.query.search}%` } },
                { description: { [Op.like]: `%${req.query.search}%` } }
            ];
        }

        // 2) Sıralama
        let order = [['created_at', 'DESC']];
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').map(field => {
                if (field.startsWith('-')) {
                    return [field.substring(1), 'DESC'];
                }
                return [field, 'ASC'];
            });
            order = sortBy;
        }

        // 3) Alanları sınırlama (Attributes)
        let attributes = undefined;
        if (req.query.fields) {
            attributes = req.query.fields.split(',');
        }

        // 4) Sayfalama
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const offset = (page - 1) * limit;

        // Sorguyu çalıştır
        const { count, rows } = await Course.findAndCountAll({
            where: whereClause,
            order,
            attributes,
            limit,
            offset,
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'username', 'email'] }
            ]
        });

        // Her kurs için review sayısını ekle
        const coursesWithReviewCount = await Promise.all(
            rows.map(async (course) => {
                const courseData = course.toJSON();
                const reviewCount = await Review.count({
                    where: { courseId: course.id }
                });
                courseData.reviewCount = reviewCount;
                return courseData;
            })
        );

        const pages = Math.ceil(count / limit);

        res.status(200).json({
            status: 'success',
            results: rows.length,
            total: count,
            pages,
            currentPage: page,
            data: {
                courses: coursesWithReviewCount
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Yeni kurs oluştur
const createCourse = async (req, res) => {
    try {
        // Eğitmen kontrolü
        const instructor = await User.findByPk(req.user.id);
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(403).json({
                status: 'error',
                message: 'Sadece eğitmenler kurs oluşturabilir'
            });
        }

        // Kurs verisi
        const courseData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            duration: req.body.duration,
            category: req.body.category,
            isPublished: req.body.isPublished || false,
            instructorId: req.user.id
        };

        // Görsel yüklendiyse path'i ekle
        if (req.file) {
            courseData.image = `/img/courses/${req.file.filename}`;
        } else if (req.body.image) {
            // Eğer URL string olarak gönderilmişse (geriye dönük uyumluluk)
            courseData.image = req.body.image;
        } else {
            // Varsayılan görsel
            courseData.image = 'default-course.jpg';
        }

        const newCourse = await Course.create(courseData);

        res.status(201).json({
            status: 'success',
            data: {
                course: newCourse
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Tek bir kursu getir
const getCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'username', 'email'] },
                { model: Review } // Review ilişkisi tanımlıysa
            ]
        });

        if (!course) {
            return res.status(404).json({
                status: 'error',
                message: 'Kurs bulunamadı'
            });
        }

        // Review sayısını hesapla
        const reviewCount = await Review.count({
            where: { courseId: course.id }
        });

        // Course objesine reviewCount ekle
        const courseData = course.toJSON();
        courseData.reviewCount = reviewCount;

        res.status(200).json({
            status: 'success',
            data: {
                course: courseData
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Kursu güncelle
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                status: 'error',
                message: 'Kurs bulunamadı'
            });
        }

        // Sadece kurs sahibi veya admin güncelleyebilir
        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        // Güncelleme verisi
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            duration: req.body.duration,
            category: req.body.category,
            isPublished: req.body.isPublished
        };

        // Yeni görsel yüklendiyse
        if (req.file) {
            // Eski görseli sil (eğer kendi sunucumuzdaysa)
            if (course.image && course.image.startsWith('/img/courses/')) {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join('public', course.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old course image:', err);
                    });
                }
            }
            updateData.image = `/img/courses/${req.file.filename}`;
        } else if (req.body.image !== undefined) {
            // Görsel URL olarak güncellenmişse
            updateData.image = req.body.image;
        }

        await course.update(updateData);

        // Güncellenmiş kursu getir
        const updatedCourse = await Course.findByPk(req.params.id, {
            include: [
                { model: User, as: 'instructor', attributes: ['id', 'username', 'email'] }
            ]
        });

        res.status(200).json({
            status: 'success',
            data: {
                course: updatedCourse
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Kursu sil
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                status: 'error',
                message: 'Kurs bulunamadı'
            });
        }

        // Sadece kurs sahibi veya admin silebilir
        if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        await course.destroy();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Kursa kayıt ol
const enrollCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                status: 'error',
                message: 'Kurs bulunamadı'
            });
        }

        const user = await User.findByPk(req.user.id);

        // Kullanıcı zaten kayıtlı mı kontrol et (Sequelize mixin)
        const isEnrolled = await course.hasStudent(user);
        if (isEnrolled) {
            return res.status(400).json({
                status: 'error',
                message: 'Bu kursa zaten kayıtlısınız'
            });
        }

        // Kursa öğrenci ekle
        await course.addStudent(user);

        res.status(200).json({
            status: 'success',
            message: 'Kursa başarıyla kaydoldunuz',
            data: {
                course
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Kurs arama (Search endpoint'i getAllCourses içinde handle edildiği için burayı ona yönlendirebiliriz veya ayrı tutabiliriz)
// Ancak getAllCourses zaten search parametresini alıyor.
const searchCourses = async (req, res) => {
    // getAllCourses fonksiyonunu çağırabiliriz veya aynı mantığı buraya kopyalayabiliriz.
    // Basitlik için getAllCourses'u çağıralım.
    req.query.search = req.query.query; // query parametresini search'e ata
    return getAllCourses(req, res);
};

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    searchCourses
};
