
const XLSX = require('xlsx');
const Question = require('../models/Question');
const fs = require('fs');

async function importFromExcel(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        let count = 0;
        for (const row of data) {
            // Flexible column names (English or Uzbek)
            let topic = row['Topic'] || row['mavzu'] || row['Mavzu'];
            let questionText = row['Question'] || row['savol'] || row['Savol'];
            let optionsStr = row['Options'] || row['javoblar'] || row['Javoblar'];
            let correctIndex = row['CorrectIndex'] || row['togri_javob'] || row['Togri_javob'];

            if (topic && questionText && optionsStr && correctIndex !== undefined) {
                // Determine separator: pipe (|) or comma (,)
                let options = [];
                if (optionsStr.includes('|')) {
                    options = optionsStr.split('|').map(o => o.trim());
                } else {
                    options = optionsStr.split(',').map(o => o.trim());
                }

                if (options.length < 2) continue;

                // Check duplicate
                const exists = await Question.findOne({ where: { questionText } });
                if (!exists) {
                    await Question.create({
                        topic: topic.toLowerCase(),
                        questionText,
                        options,
                        correctOptionIndex: parseInt(correctIndex),
                        type: 'text'
                    });
                    count++;
                }
            }
        }
        return count;
    } catch (error) {
        console.error('Import error:', error);
        throw error;
    } finally {
        // Clean up file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

module.exports = { importFromExcel };
