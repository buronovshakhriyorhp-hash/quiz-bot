const rateLimit = new Map();
const LIMIT_TIME_MS = 1000; // 1 second

function isRateLimited(userId) {
    const now = Date.now();
    const lastRequest = rateLimit.get(userId);

    if (lastRequest && (now - lastRequest < LIMIT_TIME_MS)) {
        return true;
    }

    rateLimit.set(userId, now);
    return false;
}

module.exports = isRateLimited;
