const cron = require('node-cron');
const sequelize = require('../database/db');
const Question = require('../models/Question');
const User = require('../models/User');
const { Op } = require('sequelize');

async function scheduleDailyChallenge(bot) {
    // Schedule for 12:00 every day
    cron.schedule('0 12 * * *', async () => {
        console.log('Running Daily Challenge...');

        try {
            // 1. Find a HARD question (or fallback to medium)
            const hardQuestion = await Question.findOne({
                where: { difficulty: 'hard' },
                order: sequelize.random() // Random selection
            });

            if (!hardQuestion) {
                // Fallback if no hard questions exist yet
                console.log('No hard questions available, trying medium.');
                const mediumQuestion = await Question.findOne({
                    where: { difficulty: 'medium' },
                    order: sequelize.random()
                });

                if (!mediumQuestion) {
                    console.log('No questions available at all.');
                    return;
                }
                // use medium but warn
                var selectedQuestion = mediumQuestion;
            } else {
                var selectedQuestion = hardQuestion;
            }

            // 2. Formatting
            const options = selectedQuestion.options.map((opt, i) => {
                return [{ text: opt, callback_data: `dc_${selectedQuestion.id}_${i}` }];
            });

            const message = `🔥 <b>KUNLIK MUSOBAQA!</b> 🔥\n\n` +
                `Bugungi eng qiyin savolga javob bering va <b>2x XP</b> yutib oling!\n` +
                `⏳ Vaqt: <b>13:00 gacha</b> ulgurishingiz kerak.\n\n` +
                `❓ Savol:\n<b>${selectedQuestion.questionText}</b>`;

            // 3. Broadcast to ALL users
            const users = await User.findAll({ attributes: ['telegramId'] });

            let sentCount = 0;
            for (const user of users) {
                try {
                    await bot.sendMessage(user.telegramId, message, {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: options }
                    });
                    sentCount++;
                    // Avoid hitting rate limits (20 messages per second is limit, 50ms = 20/s)
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (e) {
                    console.error(`Failed to send DC to ${user.telegramId}:`, e.message);
                }
            }

            console.log(`Daily Challenge sent to ${sentCount} users.`);

        } catch (error) {
            console.error('Error in Daily Challenge:', error);
        }
    });

    console.log('Daily Challenge scheduled for 12:00 everyday.');
}

module.exports = { scheduleDailyChallenge };
