const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Attempt = sequelize.define('Attempt', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    chosenOptionIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    xpEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    timeTaken: { // in milliseconds
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Attempt;
