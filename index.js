const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');
const express = require('express');
const app = express();

// Health check endpoint for 24/7 hosting (Render, Railway, etc.)
app.get('/', (req, res) => {
    res.send('Bot is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// User provided token
const token = '8518065189:AAGphDDwfZlPU3Mq9IXn2G0L4VRL9E-UUx4';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// State management (in-memory for simplicity)
// structure: { chatId: { currentTopic: 'html', currentQuestionIndex: 0, score: 0 } }
const userSessions = {};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
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
    bot.sendMessage(chatId, "Assalomu alaykum! IT Quiz botiga xush kelibsiz.\nIltimos, bilimingizni sinash uchun fanlardan birini tanlang:", opts);
});

// Callback query handler (for buttons)
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    // Handle topic selection
    if (data.startsWith('topic_')) {
        const topic = data.split('_')[1];

        // Initialize session
        userSessions[chatId] = {
            currentTopic: topic,
            currentQuestionIndex: 0,
            score: 0
        };

        // Start questioning
        askQuestion(chatId);

        // Create visual feedback that button was pressed
        bot.answerCallbackQuery(callbackQuery.id, { text: `${topic.toUpperCase()} tanlandi!`, show_alert: false });
    }
    // Handle answer selection
    else if (data.startsWith('ans_')) {
        const [_, originalIndexStr, answerIndexStr] = data.split('_');
        const answerIndex = parseInt(answerIndexStr);
        const originalIndex = parseInt(originalIndexStr); // Index of the question when it was asked

        const session = userSessions[chatId];

        if (!session) {
            bot.sendMessage(chatId, "Sessiya tugagan yoki topilmadi. Iltimos /start ni bosing.");
            return;
        }

        // Validate if this answer corresponds to the current question (prevent old button clicks)
        if (session.currentQuestionIndex !== originalIndex) {
            bot.answerCallbackQuery(callbackQuery.id, { text: "Bu eski savol.", show_alert: true });
            return;
        }

        const topicQuestions = questions[session.currentTopic];
        const currentQuestion = topicQuestions[session.currentQuestionIndex];

        let feedbackText = "";

        if (answerIndex === currentQuestion.correct) {
            session.score++;
            feedbackText = "✅ To'g'ri!";
        } else {
            feedbackText = `❌ Noto'g'ri. To'g'ri javob: ${currentQuestion.options[currentQuestion.correct]}`;
        }

        // Delete the previous question message to keep chat clean (optional, but professional)
        // Or just edit it to remove buttons? Let's just send result and next question.
        bot.sendMessage(chatId, feedbackText);

        session.currentQuestionIndex++;

        if (session.currentQuestionIndex < topicQuestions.length) {
            askQuestion(chatId);
        } else {
            // Quiz finished
            const resultMsg = `🏁 <b>Test yakunlandi!</b>\n\nFan: ${session.currentTopic.toUpperCase()}\nNatija: ${session.score} / ${topicQuestions.length}\n\nQayta ishlash uchun /start ni bosing.`;
            bot.sendMessage(chatId, resultMsg, { parse_mode: 'HTML' });
            delete userSessions[chatId];
        }

        bot.answerCallbackQuery(callbackQuery.id);
    }
});

function askQuestion(chatId) {
    const session = userSessions[chatId];
    const topicQuestions = questions[session.currentTopic];
    const questionData = topicQuestions[session.currentQuestionIndex];

    const inlineKeyboard = questionData.options.map((option, index) => {
        return [{ text: option, callback_data: `ans_${session.currentQuestionIndex}_${index}` }];
    });

    const opts = {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };

    bot.sendMessage(chatId, `❓ <b>${session.currentQuestionIndex + 1}-savol:</b>\n${questionData.question}`, { ...opts, parse_mode: 'HTML' });
}

console.log("Bot ishga tushdi...");
