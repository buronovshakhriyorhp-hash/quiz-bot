
const User = require('../models/User');
const { enforceSubscription } = require('../services/subscriptionService');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const user = msg.from;

    console.log(`Received message from ${user.first_name}: ${text}`);

    if (!text) return;

    try {
        let userRecord = await User.findOne({ where: { telegramId: user.id.toString() } });

        // Upsert Logic
        if (!userRecord) {
            userRecord = await User.create({
                telegramId: user.id.toString(),
                firstName: user.first_name,
                username: user.username,
                // joinDate, totalScore, stats use defaults
            });
        } else {
            // Update info
            let changed = false;
            if (userRecord.firstName !== user.first_name || userRecord.username !== user.username) {
                userRecord.firstName = user.first_name;
                userRecord.username = user.username;
                changed = true;
            }
            // Always update activity
            userRecord.lastActiveAt = new Date();
            await userRecord.save();
        }

        const isAllowed = await enforceSubscription(bot, chatId, user.id);
        if (!isAllowed) return;

        if (text === '/start' || text === `/start@${(await bot.getMe()).username}`) {
            // Check if group chat
            if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
                // ... existing group logic ...
            }

            // Check if User has Group ID
            if (!userRecord.groupId) {
                const groupOpts = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: 'N8 Guruhi', callback_data: 'set_group_N8' },
                                { text: 'N9 Guruhi', callback_data: 'set_group_N9' },
                                { text: 'N10 Guruhi', callback_data: 'set_group_N10' }
                            ]
                        ]
                    }
                };
                await bot.sendMessage(chatId, `Assalomu alaykum, ${user.first_name}!\n\nMusobaqada qatnashish uchun iltimos <b>o'z guruhingizni tanlang</b>:`, { ...groupOpts, parse_mode: 'HTML' });
                return;
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

        } else if (text === '/profile') {
            const u = userRecord;
            const total = (u.correctAnswers || 0) + (u.incorrectAnswers || 0);
            const winRate = total > 0 ? Math.round((u.correctAnswers / total) * 100) : 0;

            // Level calculation
            const level = Math.floor(u.totalScore / 50) + 1;
            let levelTitle = "Havaskor";
            if (level > 5 && level <= 10) levelTitle = "Bilimdon";
            if (level > 10 && level <= 20) levelTitle = "Mutaxassis";
            if (level > 20) levelTitle = "Ekspert";
            if (level > 50) levelTitle = "Grandmaster";

            const joinDate = u.joinDate ? new Date(u.joinDate).toLocaleDateString('uz-UZ') : 'Noma\'lum';
            const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString('uz-UZ') : 'Hozirgina';

            const profileMsg = `👤 <b>PROFIL: ${u.firstName}</b>\n\n` +
                `🔰 <b>Daraja:</b> ${levelTitle} (Level ${level})\n` +
                `✨ <b>XP (Ball):</b> ${u.totalScore}\n\n` +
                `📊 <b>Statistika:</b>\n` +
                `✅ To'g'ri: ${u.correctAnswers || 0} ta\n` +
                `❌ Xato: ${u.incorrectAnswers || 0} ta\n` +
                `📈 Aniqlik: ${winRate}%\n\n` +
                `📅 A'zo bo'lgan: ${joinDate}\n` +
                `🕒 Oxirgi faollik: ${lastActive}`;

            await bot.sendMessage(chatId, profileMsg, { parse_mode: 'HTML' });

        } else if (text === '/top') {
            const topUsers = await User.findAll({
                order: [['totalScore', 'DESC']],
                limit: 10
            });

            if (topUsers.length === 0) {
                await bot.sendMessage(chatId, "Hozircha reyting bo'sh.");
            } else {
                let message = "🏆 <b>TOP 10 Bilimdonlar:</b>\n\n";
                topUsers.forEach((u, index) => {
                    let medal = '';
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';
                    else medal = `${index + 1}.`;

                    const name = u.firstName ? u.firstName.replace(/</g, "&lt;") : (u.username || "Foydalanuvchi");
                    message += `${medal} <b>${name}</b> - ${u.totalScore} ball\n`;
                });

                await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
            }
        } else if (text === '/help') {
            await bot.sendMessage(chatId, "Yordam:\n/start - Botni qayta ishga tushirish\n/profile - Mening profilim\n/top - 🏆 Reytingni ko'rish\n/help - Yordam");
        }
    } catch (error) {
        console.error('Error in message handler:', error);
        await bot.sendMessage(chatId, `Xatolik yuz berdi: ${error.message}\nIltimos keyinroq urinib ko'ring.`);
    }
};
