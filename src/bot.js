
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

const Season = require('./models/Season');

app.get('/', (req, res) => {
    res.send('Bot is running (Webhook Mode)! <br> <a href="/dashboard?key=@Gumsmass645">Go to Dashboard</a>');
});

// Admin Dashboard Route
app.get('/dashboard', async (req, res) => {
    const key = req.query.key;
    // Simple mock auth. In real app use env var.
    if (key !== '@Gumsmass645') { // Updated secret key
        return res.status(403).send('Unauthorized');
    }

    // 1. Live Stats
    const groups = ['N8', 'N9', 'N10'];
    const liveStats = {};
    for (const group of groups) {
        const totalXP = await User.sum('cycleScore', { where: { groupId: group } }) || 0;
        liveStats[group] = totalXP;
    }

    // 2. History
    const history = await Season.findAll({ order: [['createdAt', 'DESC']], limit: 10 });

    // 3. HTML Template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bot Admin Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: sans-serif; padding: 20px; background: #f4f4f9; }
            .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart-container { position: relative; height: 300px; width: 100%; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Group Competition Dashboard</h1>
            
            <h3>⚡ Live Standings (Current Season)</h3>
            <div class="chart-container">
                <canvas id="liveChart"></canvas>
            </div>

            <h3>📜 History (Past Seasons)</h3>
            <table>
                <tr>
                    <th>Date</th>
                    <th>Winner</th>
                    <th>Scores</th>
                    <th>MVPs</th>
                </tr>
                ${history.map(h => {
        const r = h.results; // JSON
        const scores = Object.keys(r).map(g => `${g}: ${r[g].xp}`).join(', ');
        const mvps = Object.keys(r).map(g => `${g}: ${r[g].mvp ? r[g].mvp.name : '-'}`).join(', ');
        return `<tr>
                        <td>${new Date(h.createdAt).toLocaleDateString()}</td>
                        <td><b>${h.winnerGroup}</b></td>
                        <td>${scores}</td>
                        <td>${mvps}</td>
                    </tr>`;
    }).join('')}
            </table>
        </div>

        <script>
            const ctx = document.getElementById('liveChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(groups)},
                    datasets: [{
                        label: 'Current XP (Cycle Score)',
                        data: ${JSON.stringify(groups.map(g => liveStats[g]))},
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        </script>
    </body>
    </html>
    `;

    res.send(html);
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
