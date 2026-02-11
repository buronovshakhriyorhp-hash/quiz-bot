
const TelegramBot = require('node-telegram-bot-api');
const sequelize = require('./database/db');
const { TOKEN } = require('./config/config');
const messageHandler = require('./handlers/messageHandler');
const callbackHandler = require('./handlers/callbackHandler');
const adminHandler = require('./handlers/adminHandler');
const User = require('./models/User'); // Ensure model is loaded
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

// Self-ping to keep the bot alive
const https = require('https');
setInterval(() => {
    https.get('https://quiz-bot-yo95.onrender.com');
}, 14 * 60 * 1000); // Every 14 minutes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize Bot
const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300, // Check for updates every 300ms
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Database Connection
sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database error:', err));

// Handlers
bot.on('message', async (msg) => {
    await adminHandler(bot, msg);
    await messageHandler(bot, msg);
});
bot.on('callback_query', (query) => callbackHandler(bot, query));

console.log('Bot is running professionally...');

// Error handling
bot.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});
