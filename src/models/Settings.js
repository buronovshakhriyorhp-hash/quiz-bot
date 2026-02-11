
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Settings = sequelize.define('Settings', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Settings;
