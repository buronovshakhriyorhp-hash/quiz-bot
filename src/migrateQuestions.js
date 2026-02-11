
const sequelize = require('./database/db');
const Question = require('./models/Question');
const questionsData = require('./utils/questions');

async function migrate() {
    try {
        await sequelize.sync(); // Create table if not exists

        for (const [topic, qList] of Object.entries(questionsData)) {
            for (const q of qList) {
                // Check if exists to avoid duplicates
                const exists = await Question.findOne({ where: { questionText: q.question } });
                if (!exists) {
                    await Question.create({
                        topic: topic,
                        questionText: q.question,
                        options: q.options,
                        correctOptionIndex: q.correct,
                        type: 'text'
                    });
                    console.log(`Migrated: ${q.question.substring(0, 30)}...`);
                }
            }
        }
        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
