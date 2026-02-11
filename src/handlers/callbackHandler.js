
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
        // Quiz finished
        const earnedPoints = user.tempScore;
        user.totalScore += earnedPoints;
        await user.save();

        const resultMsg = `🎉 <b>Tabriklaymiz! Test yakunlandi.</b>\n\n📚 Fan: <b>${user.currentTopic.toUpperCase()}</b>\n📂 Bo'lim: <b>${user.currentSection}</b>\n\n✅ Natija: <b>${user.tempScore}</b> / ${Math.min(10, totalQuestions)} ta to'g'ri\n🏆 Umumiy ballingiz: <b>${user.totalScore}</b>\n\n🔄 Qayta ishlash uchun /start ni bosing.`;

        // Either edit or send new if finishing
        if (messageId) {
            try {
                await bot.editMessageText(resultMsg, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML'
                });
            } catch (e) {
                // if edit fails (e.g. message too old), send new
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

    // Add "Back" button if needed, but usually not in quiz flow? 
    // Maybe "Stop Quiz" button? For now, keep simple.

    const opts = {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        },
        parse_mode: 'HTML'
    };

    const escapeHTML = (str) => {
        return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const safeQuestionText = escapeHTML(questionData.questionText);
    const progressText = `📊 <b>Savol: ${user.currentQuestionIndex + 1}/${Math.min(10, totalQuestions)}</b>`;
    const fullText = `${progressText}\n\n❓ ${safeQuestionText}`;

    if (isFirstQuestion) {
        await bot.sendMessage(chatId, fullText, opts);
    } else if (messageId) {
        await bot.editMessageText(fullText, {
            chat_id: chatId,
            message_id: messageId,
            ...opts
        });
    } else {
        // Fallback
        await bot.sendMessage(chatId, fullText, opts);
    }
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

        if (data === 'main_menu') {
            const opts = {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML',
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
            await bot.editMessageText(`Assalomu alaykum, ${user.firstName}! IT Quiz botiga xush kelibsiz.\nIltimos, bilimingizni sinash uchun fanlardan birini tanlang:`, opts);
            await bot.answerCallbackQuery(callbackQuery.id);
            return;
        }

        // Handle topic selection
        if (data.startsWith('topic_')) {
            const topic = data.split('_')[1];

            user.currentTopic = topic;
            await user.save();

            // Fetch sections dynamically (now cached)
            const sections = await getCachedSections(topic);

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

            keyboard.push([{ text: '🔙 Ortga (Top)', callback_data: 'main_menu' }]); // Back to Main Menu

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

            await askQuestion(bot, chatId, user, true);
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
            let feedbackText = "";

            if (isCorrect) {
                user.tempScore += 1;
                user.correctAnswers = (user.correctAnswers || 0) + 1; // Increment correct
                feedbackText = "✅ <b>To'g'ri!</b> Tabriklaymiz!";
                await bot.answerCallbackQuery(callbackQuery.id, { text: "✅ To'g'ri!", show_alert: false });
            } else {
                user.incorrectAnswers = (user.incorrectAnswers || 0) + 1; // Increment incorrect
                const correctOption = questionData.options[questionData.correctOptionIndex];
                feedbackText = `❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>${correctOption}</b>`;
                await bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Noto'g'ri!", show_alert: false });
            }

            user.lastActiveAt = new Date(); // Update activity

            await user.save();

            // Modify keyboard to show result and freeze
            const newKeyboard = questionData.options.map((option, index) => {
                let text = option;
                if (index === answerIndex) {
                    text = isCorrect ? `✅ ${option}` : `❌ ${option}`;
                } else if (index === questionData.correctOptionIndex && !isCorrect) {
                    // Optionally show correct answer too?
                    text = `✅ ${option}`;
                }

                return [{ text: text, callback_data: 'noop' }]; // Disable button
            });

            // Add Next Button
            newKeyboard.push([{ text: "➡️ Keyingi savol", callback_data: 'next_question' }]);

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

            const progressText = `📊 <b>Savol: ${user.currentQuestionIndex + 1}/${Math.min(10, totalQuestions)}</b>`;
            const fullText = `${progressText}\n\n❓ ${safeQuestionText}\n\n${feedbackText}`;

            await bot.editMessageText(fullText, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: newKeyboard }
            });
        }

        // Handle Next Question
        if (data === 'next_question') {
            // Move to next question
            user.currentQuestionIndex += 1;
            await user.save();

            // Ask next (edit message)
            await askQuestion(bot, chatId, user, false, msg.message_id);
            // Acknowledge callback to stop spinner
            await bot.answerCallbackQuery(callbackQuery.id);
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
