const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const UserMistake = sequelize.define('UserMistake', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    section: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: false,
            fields: ['userId', 'topic', 'section']
        }
    ]
});

module.exports = UserMistake;
