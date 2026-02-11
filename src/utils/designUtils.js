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
 * Generates a Premium Card Layout
 * @param {string} groupId - User's group ID for branding
 * @param {string} status - Top status line (e.g., "📊 3/10 | ⏳ 15s")
 * @param {string} xpBadge - XP indicator (e.g., "🟡 +10 XP")
 * @param {string} content - Main question content
 * @param {string} footer - Explanation or bottom text
 */
function formatCard(groupId, status, xpBadge, content, footer = '') {
    const theme = getTheme(groupId);

    // Header Construction
    // Using a cleaner, modern look:
    // ╭─── 💎 N8 GURUHI ───╮
    let msg = `╭─── <b>${theme.header}</b> ───╮\n`;

    // Status Row
    msg += `│ ${status}\n`;

    // XP Row (Optional, maybe combine with status? Let's keep it separate for visibility as requested)
    if (xpBadge) {
        msg += `│ ${xpBadge}\n`;
    }

    msg += `╰─────────────────────╯\n\n`; // End of header block

    // Main Content
    msg += `${content}\n`;

    // Footer / Explanation
    if (footer) {
        msg += `\n─────────────────────\n`;
        msg += `${footer}`;
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
    formatMessage: formatCard // Alias for backward compatibility if needed, though signatures differ
};
