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

async function getCourseMVP() {
    // 1. Get all seasons
    const seasons = await Season.findAll();
    const userStats = {}; // { telegramId: { name: 'Ali', totalXP: 100, wins: 2 } }

    // 2. Aggregate from history
    seasons.forEach(s => {
        if (s.results) {
            Object.values(s.results).forEach(groupData => {
                if (groupData.mvp) {
                    // We don't have ID in old history structure, just name/score. 
                    // ideally we should have stored ID. For now, we skip history user aggregation purely by name as it's unreliable.
                    // Instead, let's rely on User.totalScore which is LIFETIME score.
                }
            });
        }
    });

    // 3. Real "Course MVP" is simply the best User by totalScore
    const mvp = await User.findOne({
        order: [['totalScore', 'DESC']],
        attributes: ['firstName', 'username', 'totalScore', 'groupId', 'correctAnswers', 'incorrectAnswers']
    });

    return mvp;
}

module.exports = { getGrowthAnalytics, getCourseMVP };
