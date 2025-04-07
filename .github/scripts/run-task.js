const fs = require('fs');
const { execSync } = require('child_process');

const PENDING_FILE = 'pending.json';
const EXECUTED_FILE = 'executed.json';

function runTask() {
  console.log('🚀 Running scheduled task...');
  // Hier kann deine eigentliche Logik rein
  // z.B. API-Aufrufe, Jobs etc.
}

function moveToExecuted() {
  if (!fs.existsSync(PENDING_FILE)) return;

  const pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  const now = new Date().toISOString();

  const due = pending.filter(ts => ts <= now);
  const future = pending.filter(ts => ts > now);

  if (due.length === 0) {
    console.log('⏩ Nothing due to execute.');
    return;
  }

  let executed = [];
  if (fs.existsSync(EXECUTED_FILE)) {
    executed = JSON.parse(fs.readFileSync(EXECUTED_FILE, 'utf8'));
  }

  runTask();

  // Move first due task to executed
  executed.push(due[0]);
  fs.writeFileSync(EXECUTED_FILE, JSON.stringify(executed, null, 2));
  fs.writeFileSync(PENDING_FILE, JSON.stringify(future, null, 2));
  console.log(`✅ Moved ${due[0]} to executed.`);

  // Wenn Anzahl Vielfaches von 5 → neue Zeiten generieren
  if (executed.length % 5 === 0) {
    console.log('🔁 Generating new schedule batch...');
    execSync('node generate-random-times.js');
  }

  // Nächste Zeit setzen
  execSync('node generate_next_schedule.js');
}

moveToExecuted();
