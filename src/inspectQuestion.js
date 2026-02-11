
const sequelize = require('./database/db');
const Question = require('./models/Question');

async function inspect() {
    try {
        const questions = await Question.findAll({
            where: { topic: 'javascript', section: 'Basics' },
            limit: 20
        });

        console.log(`Found ${questions.length} questions.`);
        questions.forEach((q, i) => {
            console.log(`[${i}] ${q.questionText}`);
            console.log(`    Options type: ${typeof q.options}`);
            console.log(`    Options: ${JSON.stringify(q.options)}`);
        });

    } catch (e) {
        console.error(e);
    }
}

inspect();
