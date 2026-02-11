
const User = require('../models/User');
const Question = require('../models/Question');
const sequelize = require('../database/db');
const { Op } = require('sequelize');
const { enforceSubscription } = require('../services/subscriptionService');

async function askQuestion(bot, chatId, user) {
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
        // Quiz finished
        const earnedPoints = user.tempScore;
        user.totalScore += earnedPoints;
        await user.save();

        const resultMsg = `🏁 <b>Test yakunlandi!</b>\n\nFan: ${user.currentTopic.toUpperCase()}\nBo'lim: ${user.currentSection}\nNatija: ${user.tempScore}\nUmumiy ballingiz: ${user.totalScore}\n\nQayta ishlash uchun /start ni bosing.`;

        await bot.sendMessage(chatId, resultMsg, { parse_mode: 'HTML' });

        // Reset session
        user.currentTopic = null;
        user.currentSection = null;
        user.currentQuestionIndex = 0;
        user.tempScore = 0;
        await user.save();
        return;
    }

    // Fetch specific question by offset
    const questionData = await Question.findOne({
        where: {
            topic: user.currentTopic,
            section: user.currentSection
        },
        offset: user.currentQuestionIndex,
        limit: 1
    });

    if (!questionData) {
        // Fallback if index mismatch
        await bot.sendMessage(chatId, "Savollar tugadi.");
        return;
    }

    const inlineKeyboard = questionData.options.map((option, index) => {
        return [{ text: option, callback_data: `ans_${index}` }];
    });

    const opts = {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };

    const escapeHTML = (str) => {
        return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const safeQuestionText = escapeHTML(questionData.questionText);

    await bot.sendMessage(chatId, `❓ <b>${user.currentQuestionIndex + 1}-savol:</b>\n${safeQuestionText}`, { ...opts, parse_mode: 'HTML' });
}

module.exports = async (bot, callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    const telegramId = callbackQuery.from.id.toString();

    try {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "Iltimos, avval /start ni bosing.", show_alert: true });
            return;
        }

        const isAllowed = await enforceSubscription(bot, chatId, telegramId);
        if (!isAllowed && data !== 'check_subscription') {
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        if (data === 'check_subscription') {
            const isSubscribed = await enforceSubscription(bot, chatId, telegramId);
            if (isSubscribed) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Rahmat! Obuna tasdiqlandi.", show_alert: true });
                const opts = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: 'HTML', callback_data: 'topic_html' },
                                { text: 'CSS', callback_data: 'topic_css' },
                                { text: 'JavaScript', callback_data: 'topic_javascript' }
                            ]
                        ]
                    }
                };
                await bot.sendMessage(chatId, `Assalomu alaykum, ${user.firstName}! IT Quiz botiga xush kelibsiz.\nIltimos, bilimingizni sinash uchun fanlardan birini tanlang:`, opts);
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Siz hali kanalga a'zo bo'lmadingiz!", show_alert: true });
            }
            return;
        }

        // Handle topic selection
        if (data.startsWith('topic_')) {
            const topic = data.split('_')[1];

            user.currentTopic = topic;
            await user.save();

            // Fetch sections dynamically
            const sections = await Question.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('section')), 'section']],
                where: { topic: topic }
            });

            let sectionList = sections.map(s => s.section).filter(s => s);
            sectionList = [...new Set(sectionList)];

            // Grouping Logic for Nested Menus
            const groups = ['Basics', 'General'];
            const keyboard = [];

            // Add Groups first
            groups.forEach(group => {
                const groupItems = sectionList.filter(s => s.startsWith(group));
                if (groupItems.length > 0) {
                    keyboard.push([{ text: `📂 ${group}`, callback_data: `group_${group}` }]);
                    // Remove these from the main list so they don't show up twice
                    sectionList = sectionList.filter(s => !s.startsWith(group));
                }
            });

            // Add remaining individual sections
            for (let i = 0; i < sectionList.length; i += 2) {
                const row = [];
                row.push({ text: sectionList[i], callback_data: `section_${sectionList[i]}` });
                if (sectionList[i + 1]) {
                    row.push({ text: sectionList[i + 1], callback_data: `section_${sectionList[i + 1]}` });
                }
                keyboard.push(row);
            }

            keyboard.push([{ text: '🔙 Ortga (Top)', callback_data: 'check_subscription' }]); // Back to Main Menu

            await bot.editMessageText(`<b>${topic.toUpperCase()}</b> bo'limini tanlang:`, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboard }
            });
            return;
        }

        // Handle Group Selection (Nested Menu)
        if (data.startsWith('group_')) {
            const groupName = data.split('_')[1];
            const topic = user.currentTopic;

            // Fetch sub-sections
            const sections = await Question.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('section')), 'section']],
                where: {
                    topic: topic,
                    section: { [Op.like]: `${groupName}%` }
                }
            });

            let subSections = sections.map(s => s.section).sort(); // Sort I, II, III

            const keyboard = [];
            for (let i = 0; i < subSections.length; i += 2) {
                const row = [];
                row.push({ text: subSections[i], callback_data: `section_${subSections[i]}` });
                if (subSections[i + 1]) {
                    row.push({ text: subSections[i + 1], callback_data: `section_${subSections[i + 1]}` });
                }
                keyboard.push(row);
            }

            keyboard.push([{ text: '🔙 Ortga', callback_data: `topic_${topic}` }]);

            await bot.editMessageText(`📂 <b>${groupName}</b> bo'limlari:`, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboard }
            });
            return;
        }

        // Handle section selection (Start Quiz)
        if (data.startsWith('section_')) {
            const section = data.split('section_')[1]; // Fixed split to handle names with underscores if any? limit to 1 split?
            // Actually data is "section_Basics I". split('_') gives ['section', 'Basics I'].
            // But if section name has _, it might break.
            // Safer: substring.
            // const section = data.substring(8);

            user.currentSection = section;
            user.currentQuestionIndex = 0;
            user.tempScore = 0;
            await user.save();

            await askQuestion(bot, chatId, user);
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        // Handle answer
        if (data.startsWith('ans_')) {
            const answerIndex = parseInt(data.split('_')[1]);

            // Validate answer
            const questionData = await Question.findOne({
                where: {
                    topic: user.currentTopic,
                    section: user.currentSection
                },
                offset: user.currentQuestionIndex,
                limit: 1
            });

            if (!questionData) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Xatolik: Savol topilmadi.", show_alert: true });
                return;
            }

            const isCorrect = answerIndex === questionData.correctOptionIndex;
            if (isCorrect) {
                user.tempScore += 1; // 1 point per correct answer
                await bot.answerCallbackQuery(callbackQuery.id, { text: "✅ To'g'ri!", show_alert: false });
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Noto'g'ri!", show_alert: false });
            }

            await user.save();

            // Move to next question
            user.currentQuestionIndex += 1;
            await user.save();

            // Ask next
            await askQuestion(bot, chatId, user);
        }

    } catch (e) {
        console.error(e);
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Xatolik yuz berdi.", show_alert: true });
    }
};
