const cron = require('node-cron');
const sequelize = require('../database/db');
const User = require('../models/User');
const Season = require('../models/Season');
const { Op } = require('sequelize');

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

            // 3. Archive Season
            await Season.create({
                winnerGroup: winner.group,
                results: seasonData,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // approx 10 days ago
            });

            // 4. Format Message
            let message = `🏆 <b>GURUHLAR JANGI YAKUNLANDI!</b> 🏆\n\n`;
            message += `Bu mavsum g'olibi: <b>${winner.group}</b>! 🎉\n\n`;
            message += `📊 <b>NATIJALAR:</b>\n`;

            results.forEach((r, i) => {
                let medal = '';
                if (i === 0) medal = '🥇';
                else if (i === 1) medal = '🥈';
                else if (i === 2) medal = '🥉';

                message += `${medal} <b>${r.group}</b> - ${r.xp} XP\n`;
                if (r.mvp) {
                    message += `    👤 MVP: <b>${r.mvp.name}</b> (${r.mvp.score})\n`;
                }
            });

            message += `\n🔄 Barcha <b>cycleScore</b> ballari 0 ga tushirildi.\n yangi mavsum boshlandi! Olg'a! 🚀`;

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
        }
    });

    console.log('Group Competition scheduled (Every 10 days).');
}

module.exports = { scheduleGroupCompetition };
