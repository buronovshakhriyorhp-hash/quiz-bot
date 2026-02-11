const cron = require('node-cron');
const Question = require('../models/Question');
const User = require('../models/User');
const { formatMessage, getRandomSuccessMessage } = require('../utils/designUtils');
const sequelize = require('../database/db');

let activeBossQuestionId = null;
let bossSolved = false;

function scheduleCommunityBoss(bot) {
    // Schedule at 20:00 every day
    cron.schedule('0 20 * * *', async () => {
        console.log('👹 Spawning Community Boss...');
        bossSolved = false;

        // Find a HARD question
        const bossQuestion = await Question.findOne({
            where: { difficulty: 'hard' },
            order: sequelize.random()
        });

        if (!bossQuestion) {
            console.log('No hard question found for Boss.');
            return;
        }

        activeBossQuestionId = bossQuestion.id;

        // Broadcast to all users (Chunking to avoid limits)
        const users = await User.findAll({ attributes: ['telegramId'] });
        const message = formatMessage('👹', 'COMMUNITY BOSS CHIQDI!',
            `Diqqat! Bugungi <b>BOSS</b> savol paydo bo'ldi.\n\n` +
            `Kim birinchi bo'lib to'g'ri javob topsa, o'z guruhiga <b>+50 XP</b> olib keladi.\n\n` +
            `👇 Quyidagi tugmani bosib yechishni boshlang!`,
            'Tez bo\'ling!'
        );

        const opts = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: '⚔️ BOSS BILAN OLISHISH', callback_data: `boss_fight_${bossQuestion.id}` }]]
            }
        };

        for (const u of users) {
            try {
                await bot.sendMessage(u.telegramId, message, opts);
            } catch (e) {
                // ignore blocked users
            }
        }
    }, {
        timezone: "Asia/Tashkent"
    });
}

// Handler for Boss logic (needs to be called from callbackHandler)
async function handleBossFight(bot, callbackQuery, questionId) {
    // Show the question
    const questionData = await Question.findByPk(questionId);
    if (!questionData) return;

    const inlineKeyboard = questionData.options.map((option, index) => {
        return [{ text: option, callback_data: `boss_ans_${questionId}_${index}` }];
    });

    await bot.editMessageText(
        formatMessage('👹', 'BOSS SAVOLI', questionData.questionText),
        {
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
        }
    );
}

async function handleBossAnswer(bot, callbackQuery, questionId, answerIndex) {
    const user = await User.findOne({ where: { telegramId: callbackQuery.from.id.toString() } });
    const questionData = await Question.findByPk(questionId);

    if (bossSolved) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Kech qoldingiz! Boss allaqachon yengildi.", show_alert: true });
        return;
    }

    const isCorrect = answerIndex === questionData.correctOptionIndex;

    if (isCorrect) {
        bossSolved = true;
        // AWARD BONUS
        user.cycleScore = (user.cycleScore || 0) + 50;
        user.totalScore += 50;
        await user.save();

        const successMsg = getRandomSuccessMessage();
        await bot.editMessageText(
            formatMessage('🏆', 'BOSS YENGILDI!',
                `<b>${user.firstName}</b> Bossni yengdi va <b>${user.groupId}</b> guruhiga +50 XP olib keldi! 🎉\n\n✅ Javob: ${questionData.options[answerIndex]}`
            ),
            {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id,
                parse_mode: 'HTML'
            }
        );

        // Notify Admins or Broadcast winner?
        // Simple acknowledgment
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Tabriklaymiz! +50 XP!", show_alert: true });
    } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Noto'g'ri! Boss sizga zarba berdi! 💥", show_alert: true });
    }
}

module.exports = { scheduleCommunityBoss, handleBossFight, handleBossAnswer };
