
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Question = sequelize.define('Question', {
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    section: { // e.g., 'Basics', 'DOM', 'Async'
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'General'
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    options: {
        type: DataTypes.JSON, // Stores array of strings
        allowNull: false
    },
    correctOptionIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: { // 'text', 'photo', 'video'
        type: DataTypes.STRING,
        defaultValue: 'text'
    },
    mediaFileId: { // Telegram file_id for photo/video
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Question;
