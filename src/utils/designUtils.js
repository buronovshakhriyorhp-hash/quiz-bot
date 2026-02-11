const { ADMIN_ID } = require('../config/config');

const GROUP_ICONS = {
    'N8': '💎',
    'N9': '⚡️',
    'N10': '🔥'
};

/**
 * Formats a message with a consistent design system.
 * @param {string} emoji - The emoji for the header.
 * @param {string} title - The bold title.
 * @param {string} content - The main body content.
 * @param {string} footer - Optional footer text (e.g., call to action).
 * @returns {string} Formatted HTML string.
 */
function formatMessage(emoji, title, content, footer = '') {
    let msg = `${emoji} <b>${title}</b>\n\n`;
    msg += `${content}\n\n`;
    msg += `-----------------------\n`;
    if (footer) {
        msg += `<i>${footer}</i>`;
    }
    return msg;
}

/**
 * Generates an ASCII progress bar.
 * @param {number} value - Current value.
 * @param {number} max - Maximum value.
 * @param {number} length - Length of the bar (default 10).
 * @returns {string} E.g., "[▓▓▓▓▓░░░░░]"
 */
function getProgressBar(value, max, length = 10) {
    const percent = Math.min(Math.max(value / max, 0), 1);
    const filledLen = Math.round(length * percent);
    const emptyLen = length - filledLen;
    // Alternative chars: █ ░ or ▓ ░
    const filled = '▓'.repeat(filledLen);
    const empty = '░'.repeat(emptyLen);
    return `[${filled}${empty}]`;
}

function getGroupIcon(groupId) {
    return GROUP_ICONS[groupId] || '🛡';
}

/**
 * Logs errors to the admin via Telegram message.
 * @param {object} bot - Telegram bot instance.
 * @param {Error} error - The error object.
 * @param {string} context - Where the error happened.
 */
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

module.exports = {
    formatMessage,
    getProgressBar,
    getGroupIcon,
    logErrorToAdmin,
    getRandomSuccessMessage,
    escapeHTML
};
