
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const User = sequelize.define('User', {
    telegramId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    },
    joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    totalScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currentTopic: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentSection: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentQuestionIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    tempScore: { // Score for the current quiz session
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = User;
