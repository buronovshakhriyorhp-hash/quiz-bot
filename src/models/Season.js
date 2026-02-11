
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Season = sequelize.define('Season', {
    winnerGroup: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    results: {
        type: DataTypes.JSON, // { "N8": { score: 100, mvp: { name: "Ali", score: 50 } }, ... }
        allowNull: false
    }
});

module.exports = Season;
