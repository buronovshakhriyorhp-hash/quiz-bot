const User = require('../models/User');
const Question = require('../models/Question');
const { formatMessage, escapeHTML } = require('../utils/designUtils');

async function handleReview(bot, callbackQuery) {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const telegramId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;

    const user = await User.findOne({ where: { telegramId } });
    if (!user) return;

    // Start Review Mode
    if (data === 'start_review') {
        const mistakes = user.mistakes || [];
        if (mistakes.length === 0) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: "🎉 Sizda xatolar yo'q! Ajoyib natija!", show_alert: true });
            return;
        }

        // Fetch first mistake
        const questionId = mistakes[0];
        await sendReviewQuestion(bot, chatId, questionId, 0, mistakes.length);
        await bot.answerCallbackQuery(callbackQuery.id);
        return;
    }

    // Handle Review Answer (Next/Skip)
    if (data.startsWith('rev_next_')) {
        const index = parseInt(data.split('_')[2]);
        const mistakes = user.mistakes || [];

        if (index >= mistakes.length) {
            await bot.editMessageText("🎉 <b>Xatolar tahlili tugadi!</b>\nEndi bilimingiz mustahkamlandi.", {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'HTML'
            });
            return;
        }

        const questionId = mistakes[index];
        await sendReviewQuestion(bot, chatId, questionId, index, mistakes.length);
        await bot.answerCallbackQuery(callbackQuery.id);
    }
}

async function sendReviewQuestion(bot, chatId, questionId, index, total) {
    const question = await Question.findByPk(questionId);
    if (!question) {
        // Skip if deleted
        return;
    }

    const correctOption = question.options[question.correctOptionIndex];
    const safeText = escapeHTML(question.questionText);
    const explanation = question.explanation ? `\n\n💡 <b>Izoh:</b> ${question.explanation}` : '';

    const text = `🔄 <b>Xatolar Tahlili (${index + 1}/${total})</b>\n\n` +
        `❓ ${safeText}\n\n` +
        `✅ To'g'ri javob: <b>${correctOption}</b>` +
        explanation;

    const opts = {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: "➡️ Keyingisi", callback_data: `rev_next_${index + 1}` }],
                [{ text: "🏠 Bosh menyu", callback_data: `main_menu` }]
            ]
        }
    };

    // If message exists, try edit, else send
    await bot.sendMessage(chatId, text, opts);
    // Note: We use sendMessage mostly because reviewing scrolling up is easier, 
    // but typically we edit. However, `rev_next` comes from a button on a previous msg.
    // Let's try to Edit properly if we can pass msgId, but here we simplify to sendMessage 
    // to avoid "message not modified" loop if text is same (unlikely).
    // Actually, let's keep it clean: User clicks "Review" -> New Msg. User clicks Next -> Edit.
}

module.exports = { handleReview };
