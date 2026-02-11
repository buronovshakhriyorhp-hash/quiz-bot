
const fs = require('fs');
const path = require('path');

const srcUtils = path.join(__dirname, 'src', 'utils');
const srcQuestions = path.join(__dirname, 'src', 'utils', 'questions.js');
const rootQuestions = path.join(__dirname, 'questions.js');

if (!fs.existsSync(srcUtils)) {
    fs.mkdirSync(srcUtils, { recursive: true });
    console.log('Created src/utils');
}

if (fs.existsSync(rootQuestions)) {
    fs.renameSync(rootQuestions, srcQuestions);
    console.log('Moved questions.js');
} else {
    console.log('questions.js already moved or missing');
}
