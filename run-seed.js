const seed = require('./src/utils/seedProfessional');
// The seedProfessional.js file has a self-invoking seed() call at the end, 
// so requiring it should trigger the seed. 
// However, looking at the file content:
// line 447: seed();
// So just requiring it is enough.
console.log("Seeding started...");
