const cron = require('node-cron');
const sequelize = require('../database/db');
const Question = require('../models/Question');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { Op } = require('sequelize');

let currentTask = null;

async function scheduleDailyChallenge(bot, time = null) {
    // If time is not provided, fetch from DB or use default
    if (!time) {
        try {
            await Settings.sync(); // Ensure table exists
            const setting = await Settings.findOne({ where: { key: 'daily_time' } });
            time = setting ? setting.value : '12:00';
        } catch (e) {
            console.error('Error fetching settings:', e);
            time = '12:00';
        }
    }

    // Stop existing task if any
    if (currentTask) {
        currentTask.stop();
        console.log('Stopped previous Daily Challenge task.');
    }

    // Parse time HH:mm -> cron format "mm HH * * *"
    const [hour, minute] = time.split(':');
    const cronExpression = `${minute} ${hour} * * *`;

    // Schedule
    currentTask = cron.schedule(cronExpression, async () => {
        console.log(`Running Daily Challenge at ${time}...`);

        try {
            // 1. Find a HARD question (or fallback to medium)
            const hardQuestion = await Question.findOne({
                where: { difficulty: 'hard' },
                order: sequelize.random() // Random selection
            });

            let selectedQuestion = hardQuestion;

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
                selectedQuestion = mediumQuestion;
            }

            // 2. Formatting
            const options = selectedQuestion.options.map((opt, i) => {
                return [{ text: opt, callback_data: `dc_${selectedQuestion.id}_${i}` }];
            });

            // Calculate deadline (1 hour later)
            const deadlineHour = (parseInt(hour) + 1) % 24;
            const deadlineTime = `${deadlineHour.toString().padStart(2, '0')}:${minute}`;

            const message = `🔥 <b>KUNLIK MUSOBAQA!</b> 🔥\n\n` +
                `Bugungi eng qiyin savolga javob bering va <b>2x XP</b> yutib oling!\n` +
                `⏳ Vaqt: <b>${deadlineTime} gacha</b> ulgurishingiz kerak.\n\n` +
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

    console.log(`Daily Challenge scheduled for ${time} everyday.`);
}

async function rescheduleDailyChallenge(bot, newTime) {
    await Settings.upsert({ key: 'daily_time', value: newTime });
    await scheduleDailyChallenge(bot, newTime);
}

module.exports = { scheduleDailyChallenge, rescheduleDailyChallenge };
