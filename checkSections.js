
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./src/database/db');
const Question = require('./src/models/Question');

async function listSections() {
    try {
        await sequelize.authenticate();
        // Use raw query for distinct because Sequelize aggregate can be tricky with simple distinct
        const sections = await sequelize.query("SELECT DISTINCT section FROM Questions WHERE topic = 'javascript'", { type: sequelize.QueryTypes.SELECT });
        console.log('JS Sections:', sections.map(s => s.section));

        const htmlSections = await sequelize.query("SELECT DISTINCT section FROM Questions WHERE topic = 'html'", { type: sequelize.QueryTypes.SELECT });
        console.log('HTML Sections:', htmlSections.map(s => s.section));

    } catch (e) {
        console.error(e);
    }
}

listSections();
