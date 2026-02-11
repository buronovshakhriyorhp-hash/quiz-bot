
const User = require('../models/User');
const { enforceSubscription } = require('../services/subscriptionService');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const user = msg.from;

    console.log(`Received message from ${user.first_name}: ${text}`);

    if (!text) return;

    try {
        // Find or create user
        const [dbUser, created] = await User.findOrCreate({
            where: { telegramId: user.id.toString() },
            defaults: {
                firstName: user.first_name,
                username: user.username,
                totalScore: 0
            }
        });

        const isAllowed = await enforceSubscription(bot, chatId, user.id);
        if (!isAllowed) return;

        if (text === '/start' || text === `/start@${(await bot.getMe()).username}`) {
            // Check if group chat
            if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
                // Check if bot is admin
                const botMember = await bot.getChatMember(chatId, (await bot.getMe()).id);
                if (botMember.status !== 'administrator' && botMember.status !== 'creator') {
                    // silently ignore or send message?
                    await bot.sendMessage(chatId, "Iltimos, ishlashim uchun meni ushbu guruhga ADMIN qiling.");
                    return;
                }

                // Allow proceeding to show Main Menu in the group
            }

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
            await bot.sendMessage(chatId, `Assalomu alaykum, ${user.first_name}! IT Quiz botiga xush kelibsiz.\nIltimos, bilimingizni sinash uchun fanlardan birini tanlang:`, opts);
        } else if (text === '/top') {
            const topUsers = await User.findAll({
                order: [['totalScore', 'DESC']],
                limit: 10
            });

            let message = "🏆 **Top 10 Foydalanuvchilar:**\n\n";
            topUsers.forEach((u, index) => {
                const name = u.firstName || u.username || 'Noma\'lum';
                message += `${index + 1}. ${name} - ${u.totalScore} ball\n`;
            });

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } else if (text === '/help') {
            await bot.sendMessage(chatId, "Yordam:\n/start - Botni qayta ishga tushirish\n/top - Reytingni ko'rish");
        }
    } catch (error) {
        console.error('Error in message handler:', error);
        await bot.sendMessage(chatId, `Xatolik yuz berdi: ${error.message}\nIltimos keyinroq urinib ko'ring.`);
    }
};
