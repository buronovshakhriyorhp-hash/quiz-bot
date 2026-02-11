
const { CHANNEL_USERNAME, ADMIN_ID } = require('../config/config');

const subscriptionCache = new Map();
const CACHE_TTL = 120 * 1000; // 2 minutes

async function checkSubscription(bot, userId) {
    // Admin bypass
    if (userId.toString() === ADMIN_ID) return true;

    // Check Cache
    const cached = subscriptionCache.get(userId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.isSubscribed;
    }

    try {
        const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
        const status = chatMember.status;
        const isSubscribed = ['creator', 'administrator', 'member'].includes(status);

        // Update Cache
        subscriptionCache.set(userId, {
            isSubscribed: isSubscribed,
            timestamp: Date.now()
        });

        return isSubscribed;
    } catch (error) {
        console.error('Subscription check error:', error.message);

        if (error.response && error.response.statusCode === 400) {
            console.warn('WARNING: Bot is likely not an admin in the channel. Allowing user.');
            return true;
        }
        return true; // Fail open
    }
}

async function enforceSubscription(bot, chatId, userId) {
    const isSubscribed = await checkSubscription(bot, userId);

    if (!isSubscribed) {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📢 Kanalga a\'zo bo\'lish', url: `https://t.me/${CHANNEL_USERNAME.replace('@', '')}` }],
                    [{ text: '✅ Tasdiqlash', callback_data: 'check_subscription' }]
                ]
            }
        };
        await bot.sendMessage(chatId, `⚠️ <b>Diqqat!</b>\n\nBotdan foydalanish uchun bizning kanalimizga a'zo bo'lishingiz shart.\n\nKanal: ${CHANNEL_USERNAME}`, { parse_mode: 'HTML', ...opts });
        return false;
    }
    return true;
}

module.exports = { checkSubscription, enforceSubscription };
