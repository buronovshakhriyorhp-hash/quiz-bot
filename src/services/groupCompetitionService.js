const cron = require('node-cron');
const sequelize = require('../database/db');
const User = require('../models/User');
const { Op } = require('sequelize');

async function scheduleGroupCompetition(bot) {
    // Schedule for 10:00 every 10 days
    // Cron: 0 10 */10 * * runs on 1st, 11th, 21st, 31st...
    cron.schedule('0 10 */10 * *', async () => {
        console.log('Running Group Competition...');

        try {
            // 1. Calculate Scores per Group
            const groups = ['N8', 'N9', 'N10'];
            const results = [];

            for (const group of groups) {
                const totalXP = await User.sum('cycleScore', { where: { groupId: group } });
                results.push({ group, xp: totalXP || 0 });
            }

            // 2. Sort Winner
            results.sort((a, b) => b.xp - a.xp);

            // 3. Format Message
            let message = `🏆 <b>GURUHLAR JANGI YAKUNLANDI!</b> 🏆\n\n`;
            message += `Bu 10 kunlik mavsum g'olibi: <b>${results[0].group}</b>! 🎉\n\n`;
            message += `📊 <b>NATIJALAR:</b>\n`;

            results.forEach((r, i) => {
                let medal = '';
                if (i === 0) medal = '🥇';
                else if (i === 1) medal = '🥈';
                else if (i === 2) medal = '🥉';

                message += `${medal} <b>${r.group}</b> - ${r.xp} XP\n`;
            });

            message += `\n🔄 Barcha <b>cycleScore</b> ballari 0 ga tushirildi.\n yangi mavsum boshlandi! Olg'a! 🚀`;

            // 4. Broadcast
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

            // 5. Reset Cycle Scores
            await User.update({ cycleScore: 0 }, { where: {} });
            console.log(`Cycle scores reset.`);

        } catch (error) {
            console.error('Error in Group Competition:', error);
        }
    });

    console.log('Group Competition scheduled (Every 10 days).');
}

module.exports = { scheduleGroupCompetition };
