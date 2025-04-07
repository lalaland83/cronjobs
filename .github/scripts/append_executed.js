const fs = require('fs');

const PENDING_FILE = 'pending.json';
const EXECUTED_FILE = 'executed.json';

const executed = fs.existsSync(EXECUTED_FILE)
  ? JSON.parse(fs.readFileSync(EXECUTED_FILE))
  : [];

executed.push(new Date().toISOString());
fs.writeFileSync(EXECUTED_FILE, JSON.stringify(executed, null, 2));

// Wenn ein Vielfaches von 5 erreicht, neue pending generieren
if (executed.length % 5 === 0) {
  const generate = require('./generate_pending');
}
