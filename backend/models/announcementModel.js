const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Duyuru başlığı zorunludur' }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Duyuru içeriği zorunludur' }
        }
    },
    type: {
        type: DataTypes.ENUM('news', 'announcement'),
        defaultValue: 'announcement'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Announcement;
