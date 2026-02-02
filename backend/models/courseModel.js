const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { generateSlug } = require('../utils/slug');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Kurs başlığı zorunludur' },
            len: { args: [1, 100], msg: 'Kurs başlığı en fazla 100 karakter olabilir' }
        }
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Kurs açıklaması zorunludur' }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'Ücret 0\'dan küçük olamaz' }
        }
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: 'default-course.jpg'
    },
    category: {
        type: DataTypes.ENUM('web', 'mobil', 'veri-bilimi', 'yapay-zeka', 'diger'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['web', 'mobil', 'veri-bilimi', 'yapay-zeka', 'diger']],
                msg: 'Geçerli bir kategori seçin'
            }
        }
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    duration: {
        type: DataTypes.FLOAT, // Saat cinsinden
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Kurs süresi zorunludur' }
        }
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    instructorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Tablo adı (sequelize default olarak çoğul yapar)
            key: 'id'
        }
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeValidate: async (course) => {
            if (course.title && (course.isNewRecord || course.changed('title'))) {
                // Temel slug üretimi utils fonksiyonuna taşındı
                course.slug = generateSlug(course.title);

                // Benzersiz slug kontrolü (mevcut davranış korunuyor)
                const count = await Course.count({ where: { slug: course.slug } });
                if (count > 0) {
                    course.slug = `${course.slug}-${Date.now()}`;
                }
            }
        }
    }
});

module.exports = Course;
