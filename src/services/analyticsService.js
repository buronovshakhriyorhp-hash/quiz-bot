const sequelize = require('../database/db');
const Season = require('../models/Season');
const User = require('../models/User');

async function getGrowthAnalytics() {
    // 1. Fetch Current Live Scores
    const groups = ['N8', 'N9', 'N10'];
    const currentScores = {};
    for (const group of groups) {
        // cycleScore is current
        currentScores[group] = await User.sum('cycleScore', { where: { groupId: group } }) || 0;
    }

    // 2. Fetch Previous Season Scores
    const lastSeason = await Season.findOne({
        order: [['createdAt', 'DESC']],
    });

    const growthRates = {};

    if (lastSeason && lastSeason.results) {
        for (const group of groups) {
            const prevScore = lastSeason.results[group] ? lastSeason.results[group].xp : 0;
            const current = currentScores[group];

            if (prevScore === 0) {
                growthRates[group] = current > 0 ? 100 : 0; // 100% growth if started from 0
            } else {
                const growth = ((current - prevScore) / prevScore) * 100;
                growthRates[group] = parseFloat(growth.toFixed(2));
            }
        }
    } else {
        // No history
        groups.forEach(g => growthRates[g] = 0);
    }

    return {
        currentScores,
        growthRates
    };
}

module.exports = { getGrowthAnalytics };
