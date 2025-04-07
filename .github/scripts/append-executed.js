const fs = require('fs');
const executedFile = 'executed.json';
const executed = fs.existsSync(executedFile) ? JSON.parse(fs.readFileSync(executedFile)) : [];
executed.push(new Date().toISOString());
fs.writeFileSync(executedFile, JSON.stringify(executed, null, 2));
console.log('✅ Appended executed time.');