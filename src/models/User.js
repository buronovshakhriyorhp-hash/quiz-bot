
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
    lastActiveAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    totalScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cycleScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    incorrectAnswers: {
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
    },
    currentQuestionStart: { // For timer logic
        type: DataTypes.DATE,
        allowNull: true
    },
    nextDifficulty: {
        type: DataTypes.STRING, // 'easy', 'medium', 'hard'
        defaultValue: 'medium'
    },
    answeredQuestions: {
        type: DataTypes.JSON, // Array of question IDs [1, 5, 12]
        defaultValue: []
    },
    mistakes: {
        type: DataTypes.JSON, // Array of question IDs that were wrong [5, 12]
        defaultValue: []
    },
    isRetakeMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isReviewMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;
