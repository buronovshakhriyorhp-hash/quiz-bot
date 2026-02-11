module.exports = {
    apps: [{
        name: "quiz-bot",
        script: "./src/bot.js",
        watch: false,
        max_memory_restart: "300M",
        env: {
            NODE_ENV: "production",
        }
    }]
};
