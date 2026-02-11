
const sequelize = require('./database/db');
const User = require('./models/User');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection OK.');

        // sync first? No, test current state.

        const [user, created] = await User.findOrCreate({
            where: { telegramId: '123456789' },
            defaults: {
                firstName: 'TestUser',
                username: 'test',
                totalScore: 0
            }
        });

        console.log('User created:', user.toJSON());
    } catch (e) {
        console.error('ERROR:', e);
    }
}

test();
