const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Kullanıcı adı zorunludur' },
            len: { args: [3, 255], msg: 'Kullanıcı adı en az 3 karakter olmalıdır' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Bu e-posta adresi zaten kullanımda'
        },
        validate: {
            notEmpty: { msg: 'E-posta adresi zorunludur' },
            isEmail: { msg: 'Lütfen geçerli bir e-posta adresi girin' }
        }
    },
    profileImage: {
        type: DataTypes.STRING,
        defaultValue: 'default.jpg'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Şifre zorunludur' },
            len: { args: [6, 255], msg: 'Şifre en az 6 karakter olmalıdır' }
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'instructor', 'admin'),
        defaultValue: 'student'
    },
    passwordChangedAt: {
        type: DataTypes.DATE
    },
    passwordResetToken: {
        type: DataTypes.STRING
    },
    passwordResetExpires: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true, // created_at, updated_at otomatik oluşturulur
    underscored: true, // created_at şeklinde isimlendirme
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
                user.passwordChangedAt = new Date(Date.now() - 1000);
            }
        }
    }
});

// Instance method: Şifre kontrolü
User.prototype.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method: Token sonrası şifre değişimi kontrolü
User.prototype.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

module.exports = User;
