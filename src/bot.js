
const TelegramBot = require('node-telegram-bot-api');
const sequelize = require('./database/db');
const { TOKEN } = require('./config/config');
const messageHandler = require('./handlers/messageHandler');
const callbackHandler = require('./handlers/callbackHandler');
const adminHandler = require('./handlers/adminHandler');
const User = require('./models/User'); // Ensure model is loaded
const { scheduleDailyChallenge } = require('./services/dailyChallengeService');
const { scheduleGroupCompetition } = require('./services/groupCompetitionService');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bot is running (Webhook Mode)!');
});

// Self-ping to keep the bot alive
const https = require('https');
setInterval(() => {
    https.get('https://quiz-bot-yo95.onrender.com');
}, 14 * 60 * 1000); // Every 14 minutes

// Webhook Route
app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Set Webhook
    const RENDER_URL = 'https://quiz-bot-yo95.onrender.com';
    try {
        await bot.setWebHook(`${RENDER_URL}/bot${TOKEN}`);
        console.log(`Webhook set to: ${RENDER_URL}/bot${TOKEN}`);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
});

// Initialize Bot (No Polling)
const bot = new TelegramBot(TOKEN, { polling: false });

// Schedule Daily Challenge
scheduleDailyChallenge(bot);
// Schedule Group Competition
scheduleGroupCompetition(bot);

// Database Connection
sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database error:', err));

const isRateLimited = require('./middleware/rateLimiter');

// Handlers
bot.on('message', async (msg) => {
    const userId = msg.from.id;
    if (isRateLimited(userId)) return;

    await adminHandler(bot, msg);
    await messageHandler(bot, msg);
});

bot.on('callback_query', async (query) => {
    const userId = query.from.id;
    if (isRateLimited(userId)) {
        await bot.answerCallbackQuery(query.id, { text: "⚠️ Iltimos, biroz sekinroq!", show_alert: true });
        return;
    }
    await callbackHandler(bot, query);
});

console.log('Bot is running professionally (Webhook)...');
