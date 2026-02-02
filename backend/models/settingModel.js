const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/dbInit'); // index.js'de sequelize instance'ı nereden geliyorsa oradan almalı, burada index.js'den alacağız.

module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('Setting', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'settings',
        timestamps: true, // created_at, updated_at
        underscored: true
    });

    return Setting;
};
