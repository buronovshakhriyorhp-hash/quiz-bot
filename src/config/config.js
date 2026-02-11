
require('dotenv').config();

module.exports = {
    TOKEN: process.env.BOT_TOKEN || '8240929012:AAGW_FShcQlGQZaGpbb6Zh1c8K-iEw8mIFo', // Fallback for dev
    ADMIN_ID: process.env.ADMIN_ID || '1595460589',
    CHANNEL_USERNAME: process.env.CHANNEL_USERNAME || '@Shakhr1yor_blog',
    PORT: process.env.PORT || 3000
};
