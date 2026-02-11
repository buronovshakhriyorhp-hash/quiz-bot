
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
    explanation: { // AI Mentor feedback
        type: DataTypes.TEXT,
        allowNull: true
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
    difficulty: {
        type: DataTypes.STRING, // 'easy', 'medium', 'hard'
        defaultValue: 'medium'
    },
    mediaFileId: { // Telegram file_id for photo/video
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: false,
            fields: ['topic']
        },
        {
            unique: false,
            fields: ['topic', 'section']
        }
    ]
});

module.exports = Question;
