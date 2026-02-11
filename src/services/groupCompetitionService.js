const cron = require('node-cron');
const sequelize = require('../database/db');
const User = require('../models/User');
const Season = require('../models/Season');
const { Op } = require('sequelize');

const { formatMessage, getProgressBar, getGroupIcon, logErrorToAdmin } = require('../utils/designUtils');

async function scheduleGroupCompetition(bot) {
    // Schedule for 10:00 every 10 days
    // Cron: 0 10 */10 * * runs on 1st, 11th, 21st, 31st...
    cron.schedule('0 10 */10 * *', async () => {
        console.log('Running Group Competition...');

        try {
            // 1. Calculate Scores & MVPs per Group
            const groups = ['N8', 'N9', 'N10'];
            const results = [];
            const seasonData = {};

            for (const group of groups) {
                const totalXP = await User.sum('cycleScore', { where: { groupId: group } });

                // Find MVP
                const mvpUser = await User.findOne({
                    where: { groupId: group },
                    order: [['cycleScore', 'DESC']],
                    limit: 1
                });

                const groupData = {
                    group,
                    xp: totalXP || 0,
                    mvp: mvpUser ? {
                        name: mvpUser.firstName || mvpUser.username || "Noname",
                        score: mvpUser.cycleScore
                    } : null
                };

                results.push(groupData);
                seasonData[group] = groupData;
            }

            // 2. Sort Winner
            results.sort((a, b) => b.xp - a.xp);
            const winner = results[0];
            const maxScore = winner.xp > 0 ? winner.xp : 1; // Avoid division by zero

            // 3. Archive Season
            await Season.create({
                winnerGroup: winner.group,
                results: seasonData,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // approx 10 days ago
            });

            // 4. Format Message with Design System
            let content = `Bu mavsum g'olibi: <b>${getGroupIcon(winner.group)} ${winner.group}</b>! 🎉\n\n`;

            results.forEach((r, i) => {
                let medal = '';
                if (i === 0) medal = '🥇';
                else if (i === 1) medal = '🥈';
                else if (i === 2) medal = '🥉';

                const bar = getProgressBar(r.xp, maxScore, 12);
                content += `${medal} <b>${r.group}</b> ${bar} <code>${r.xp} XP</code>\n`;
                if (r.mvp) {
                    content += `   └ 👤 MVP: <b>${r.mvp.name}</b> (${r.mvp.score})\n`;
                }
                content += '\n'; // Spacing
            });

            content += `Barcha <b>cycleScore</b> ballari 0 ga tushirildi.\nYangi mavsum boshlandi! Olg'a! 🚀`;

            const message = formatMessage('🏆', 'GURUHLAR JANGI YAKUNLANDI!', content);

            // 5. Broadcast
            const users = await User.findAll({ attributes: ['telegramId'] });
            let sentCount = 0;
            for (const user of users) {
                try {
                    await bot.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
                    sentCount++;
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (e) {
                    // ignore blocked
                }
            }
            console.log(`Competition Results sent to ${sentCount} users.`);

            // 6. Reset Cycle Scores
            await User.update({ cycleScore: 0 }, { where: {} });
            console.log(`Cycle scores reset.`);

        } catch (error) {
            console.error('Error in Group Competition:', error);
            logErrorToAdmin(bot, error, 'groupCompetitionService');
        }
    });

    console.log('Group Competition scheduled (Every 10 days).');
}

module.exports = { scheduleGroupCompetition };
