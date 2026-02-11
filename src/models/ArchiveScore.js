const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const ArchiveScore = sequelize.define('ArchiveScore', {
    seasonNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    winnerGroup: {
        type: DataTypes.STRING,
        allowNull: true // e.g., 'N8'
    },
    groupScores: {
        type: DataTypes.JSON, // { N8: 500, N9: 450 }
        allowNull: true
    },
    mvpUserId: {
        type: DataTypes.INTEGER, // User ID of the global or group MVP
        allowNull: true
    }
});

module.exports = ArchiveScore;
