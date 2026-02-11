
const { formatMessage, getGroupIcon, logErrorToAdmin, getRandomSuccessMessage } = require('../utils/designUtils');
const User = require('../models/User');
const Question = require('../models/Question');
const sequelize = require('../database/db');
const { Op } = require('sequelize');
const { enforceSubscription } = require('../services/subscriptionService');

// Simple in-memory cache for sections
const sectionCache = new Map();
const SECTION_CACHE_TTL = 600 * 1000; // 10 minutes

async function getCachedSections(topic) {
    if (sectionCache.has(topic)) {
        const cached = sectionCache.get(topic);
        if (Date.now() - cached.timestamp < SECTION_CACHE_TTL) {
            return cached.data;
        }
    }

    const sections = await Question.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('section')), 'section']],
        where: { topic: topic }
    });

    const data = sections;
    sectionCache.set(topic, { data, timestamp: Date.now() });
    return data;
}

const { getProgressBar } = require('../utils/designUtils');

async function askQuestion(bot, chatId, user, isFirstQuestion = false, messageId = null) {
    if (!user.currentSection) {
        return bot.sendMessage(chatId, "Xatolik: Bo'lim tanlanmagan.");
    }

    // Identify total questions for this section
    const totalQuestions = await Question.count({
        where: {
            topic: user.currentTopic,
            section: user.currentSection
        }
    });

    if (totalQuestions === 0) {
        return bot.sendMessage(chatId, "Xatolik: Bu bo'limda savollar yo'q.");
    }

    // Auto-finish after 10 questions or when out of questions
    if (user.currentQuestionIndex >= totalQuestions || user.currentQuestionIndex >= 10) {
        // Quiz finished logic (Scorecard)
        const earnedPoints = user.tempScore;
        user.totalScore += earnedPoints;
        user.cycleScore = (user.cycleScore || 0) + earnedPoints;
        await user.save();

        // Calculate Rank in Group
        const rank = await User.count({
            where: {
                groupId: user.groupId,
                cycleScore: { [Op.gt]: user.cycleScore }
            }
        }) + 1;

        const resultMsg = `🎉 <b>Tabriklaymiz! Test yakunlandi.</b>\n\n` +
            `📚 Fan: <b>${user.currentTopic.toUpperCase()}</b>\n` +
            `📂 Bo'lim: <b>${user.currentSection}</b>\n\n` +
            `✅ Natija: <b>${user.tempScore}</b> / ${Math.min(10, totalQuestions)} ta to'g'ri\n` +
            `🏆 Umumiy ballingiz: <b>${user.totalScore}</b>\n` +
            `📊 Guruhdagi o'rningiz: <b>#${rank}</b>\n\n` +
            `🔄 Qayta ishlash uchun /start ni bosing.`;

        // Either edit or send new if finishing
        if (messageId) {
            try {
                await bot.editMessageText(resultMsg, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML'
                });
            } catch (e) {
                await bot.sendMessage(chatId, resultMsg, { parse_mode: 'HTML' });
            }
        } else {
            await bot.sendMessage(chatId, resultMsg, { parse_mode: 'HTML' });
        }

        // Reset session
        user.currentTopic = null;
        user.currentSection = null;
        user.currentQuestionIndex = 0;
        user.tempScore = 0;
        user.currentQuestionStart = null;
        await user.save();
        return;
    }

    // ADAPTIVE FETCHING
    // 1. Try to find a question of 'nextDifficulty' that hasn't been answered
    let questionData = await Question.findOne({
        where: {
            topic: user.currentTopic,
            section: user.currentSection,
            difficulty: user.nextDifficulty,
            id: { [Op.notIn]: (user.answeredQuestions || []) }
        },
        order: sequelize.random() // Randomize
    });

    // 2. Fallback: If no question of that difficulty, try ANY difficulty
    if (!questionData) {
        questionData = await Question.findOne({
            where: {
                topic: user.currentTopic,
                section: user.currentSection,
                id: { [Op.notIn]: (user.answeredQuestions || []) }
            },
            order: sequelize.random()
        });
    }

    if (!questionData) {
        // Fallback: If all questions answered, maybe reset or just say done? 
        // For now, let's just say "Savollar tugadi" but nicely.
        // Actually, the check at the top (idx >= total) might have caught this, 
        // but adaptive logic defies "offset". 
        // Let's rely on this check.
        await bot.sendMessage(chatId, "Bu bo'limdagi barcha savollarni yechib bo'ldingiz! 🎉");
        return;
    }

    if (!questionData) {
        await bot.sendMessage(chatId, "Savollar tugadi.");
        return;
    }

    // Generate Buttons with Question ID
    const inlineKeyboard = questionData.options.map((option, index) => {
        return [{ text: option, callback_data: `ans_${questionData.id}_${index}` }];
    });

    const opts = {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        },
        parse_mode: 'HTML'
    };

    // ... (rest of function) ...
}

module.exports = async (bot, callbackQuery) => {
    // ... (beginning of module) ...

    // Handle normal answer
    if (data.startsWith('ans_')) {
        const parts = data.split('_');
        const questionId = parts[1];
        const answerIndex = parseInt(parts[2]);

        // Validate answer using ID
        const questionData = await Question.findByPk(questionId);

        if (!questionData) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Xatolik: Savol topilmadi.", show_alert: true });
            return;
        }

        const isCorrect = answerIndex === questionData.correctOptionIndex;
        // ... (rest of logic) ...
        let feedbackText = "";

        if (isCorrect) {
            user.tempScore += 1;
            user.cycleScore = (user.cycleScore || 0) + 1; // Add to cycle score
            user.correctAnswers = (user.correctAnswers || 0) + 1; // Increment correct

            const successMsg = getRandomSuccessMessage();
            feedbackText = `✅ <b>${successMsg}</b>`;
            await bot.answerCallbackQuery(callbackQuery.id, { text: `✅ ${successMsg}`, show_alert: false });
        } else {
            user.incorrectAnswers = (user.incorrectAnswers || 0) + 1; // Increment incorrect
            const correctOption = questionData.options[questionData.correctOptionIndex];
            feedbackText = `❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>${correctOption}</b>`;

            // AI MENTOR EXPLANATION
            if (questionData.explanation) {
                feedbackText += `\n\n💡 <b>Izoh (Mentor):</b>\n${questionData.explanation}`;
            }

            await bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Noto'g'ri!", show_alert: false });
        }

        // ADAPTIVE LOGIC
        if (isCorrect && !isTimeout) {
            // Increase difficulty
            if (user.nextDifficulty === 'easy') user.nextDifficulty = 'medium';
            else if (user.nextDifficulty === 'medium') user.nextDifficulty = 'hard';
        } else {
            // Decrease difficulty
            if (user.nextDifficulty === 'hard') user.nextDifficulty = 'medium';
            else if (user.nextDifficulty === 'medium') user.nextDifficulty = 'easy';
        }

        // Mark question as answered
        let answered = user.answeredQuestions || [];
        if (!Array.isArray(answered)) answered = [];
        answered.push(questionData.id);
        user.answeredQuestions = answered;

        user.lastActiveAt = new Date(); // Update activity
        await user.save();

        // Modify keyboard to show result and freeze
        const newKeyboard = questionData.options.map((option, index) => {
            let text = option;
            if (index === answerIndex) {
                text = (isCorrect && !isTimeout) ? `✅ ${option}` : `❌ ${option}`;
            } else if (index === questionData.correctOptionIndex && (!isCorrect || isTimeout)) {
                // Optionally show correct answer too?
                text = `✅ ${option}`;
            }

            return [{ text: text, callback_data: 'noop' }]; // Disable button
        });

        // REMOVED "Next Question" button for Smart Pause
        // newKeyboard.push([{ text: "➡️ Keyingi savol", callback_data: 'next_question' }]);

        const escapeHTML = (str) => {
            return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const safeQuestionText = escapeHTML(questionData.questionText);

        // Total questions count needed for progress bar rerender
        const totalQuestions = await Question.count({
            where: {
                topic: user.currentTopic,
                section: user.currentSection
            }
        });

        // Feedback with Countdown
        feedbackText += `\n\n⏳ <b>3 soniyadan so'ng keyingi savol...</b>`;

        await bot.editMessageText(
            formatMessage('📝', `BO'LIM: ${user.currentSection}`, `❓ <b>${user.currentQuestionIndex + 1}/${Math.min(10, totalQuestions)}</b>\n\n${safeQuestionText}\n\n${feedbackText}`),
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: newKeyboard }
            }
        );

        // SMART PAUSE
        setTimeout(async () => {
            user.currentQuestionIndex += 1;
            await user.save();
            await askQuestion(bot, chatId, user, false, msg.message_id);
        }, 3000); // 3 seconds delay
    }

    // Handle Next Question (Legacy)
    if (data === 'next_question') {
        // Move to next question
        user.currentQuestionIndex += 1;
        await user.save();

        // Ask next (edit message)
        await askQuestion(bot, chatId, user, false, msg.message_id);
        // Acknowledge callback to stop spinner
        await bot.answerCallbackQuery(callbackQuery.id);
    }

    if (data.startsWith('boss_fight_')) {
        const questionId = data.split('_')[2];
        const { handleBossFight } = require('../services/communityBossService');
        await handleBossFight(bot, callbackQuery, questionId);
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    if (data.startsWith('boss_ans_')) {
        const parts = data.split('_');
        const questionId = parts[2];
        const answerIndex = parseInt(parts[3]);
        const { handleBossAnswer } = require('../services/communityBossService');
        await handleBossAnswer(bot, callbackQuery, questionId, answerIndex);
        return;
    }

} catch (e) {
    console.error(e);
    const errorMessage = e.message || "Aniqlanmagan xatolik";
    if (errorMessage.includes("message is not modified")) {
        // Ignore this error, just answer the callback to stop loading animation
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    await bot.answerCallbackQuery(callbackQuery.id, {
        text: `⚠️ Xatolik: ${errorMessage}`,
        show_alert: true
    });
}
};
