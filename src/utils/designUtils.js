const { ADMIN_ID } = require('../config/config');

const THEMES = {
    'N8': { icon: '💎', color: 'blue', header: '💎 N8 GURUHI', title: 'StartUp Factory' },
    'N9': { icon: '⚡️', color: 'yellow', header: '⚡️ N9 GURUHI', title: 'Code Wizards' },
    'N10': { icon: '🔥', color: 'red', header: '🔥 N10 GURUHI', title: 'Fire Bandits' },
    'default': { icon: '🚀', color: 'white', header: '🚀 IT QUIZ', title: 'Bilimonlar' }
};

function getTheme(groupId) {
    return THEMES[groupId] || THEMES['default'];
}

/**
 * Generates the specific Premium Card Layout request
 * Structure:
 * ╭─── 💎 N8 GURUHI ───╮
 * ⏳ 15s...   [▰▰▰▱...] (in code block)
 * 
 * <b>Question Text</b>
 * 
 * 🟡 +10 XP
 */
function formatCard(groupId, status, xpBadge, content, footer = '') {
    const theme = getTheme(groupId);

    // 1. Header
    let msg = `╭─── <b>${theme.header}</b> ───╮\n`;

    // 2. Status Bar (Code Block)
    // Ensure it's in a code block for the "terminal" look
    msg += `<code>${status}</code>\n\n`;

    // 3. Question (BOLD) + Newline
    // Content is already passed. ensure it has newline before.
    msg += `${content}\n`;

    // 4. XP (Bottom Line)
    if (xpBadge) {
        msg += `\n${xpBadge}`;
    }

    // 5. Footer (Explanation)
    if (footer) {
        msg += `\n\n${footer}`;
    }

    return msg;
}

/**
 * Generates a Modern Progress Bar
 * Style: ▰▰▰▱▱▱▱▱
 */
function getModernProgressBar(value, max, length = 10) {
    const percent = Math.min(Math.max(value / max, 0), 1);
    const filledLen = Math.round(length * percent);
    const emptyLen = length - filledLen;
    // Premium chars
    const filled = '▰'.repeat(filledLen);
    const empty = '▱'.repeat(emptyLen);
    return `${filled}${empty}`;
}

const SUCCESS_MESSAGES = [
    "Dahshat! 🔥",
    "Qoyil! ⚡️",
    "Super! 🚀",
    "Yorvoribsiz! 🎯",
    "Barakalla! 🌟",
    "Al'o natija! 💎",
    "To'g'ri! Davom eting! ⏩"
];

function getRandomSuccessMessage() {
    const randomIndex = Math.floor(Math.random() * SUCCESS_MESSAGES.length);
    return SUCCESS_MESSAGES[randomIndex];
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function logErrorToAdmin(bot, error, context = '') {
    try {
        if (ADMIN_ID) {
            const errorMsg = `⚠️ <b>XATOLIK!</b>\n\nJoy: ${context}\nXabar: <pre>${error.message}</pre>`;
            await bot.sendMessage(ADMIN_ID, errorMsg, { parse_mode: 'HTML' });
        }
    } catch (e) {
        console.error('Failed to log error to admin:', e);
    }
}

module.exports = {
    getTheme,
    formatCard,
    getModernProgressBar,
    getRandomSuccessMessage,
    escapeHTML,
    logErrorToAdmin,
    formatMessage: formatCard // Alias
};
