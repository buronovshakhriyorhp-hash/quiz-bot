
const sequelize = require('./database/db');
const Question = require('./models/Question');

async function check() {
    try {
        const counts = await Question.findAll({
            attributes: ['topic', 'section', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['topic', 'section']
        });

        console.log(JSON.stringify(counts, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
