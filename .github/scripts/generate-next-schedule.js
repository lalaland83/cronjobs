const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));

// Timestamps sortieren
const sortedTimestamps = pending.timestamps.sort((a, b) => new Date(a) - new Date(b));

// Buffer: 2 Minuten in die Zukunft
const bufferMs = 2 * 60 * 1000;
const now = new Date();
const minTime = new Date(now.getTime() + bufferMs);

// Suche den nächsten gültigen Timestamp (mindestens 2 Minuten in der Zukunft)
const nextValid = sortedTimestamps.find(ts => new Date(ts) > minTime);

if (!nextValid) {
  console.error('❌ Kein gültiger Timestamp gefunden, alle zu früh oder leer.');
  process.exit(1);
}

const nextTimestamp = new Date(nextValid);
let cronMinute = nextTimestamp.getUTCMinutes();
const cronHour = nextTimestamp.getUTCHours();

// Fallback: Wenn exakt gleich, +1 Minute (GitHub ignoriert Duplikate)
if (cronMinute === now.getUTCMinutes() && cronHour === now.getUTCHours()) {
  cronMinute = (cronMinute + 1) % 60;
}

const newSchedule = `${cronMinute} ${cronHour} * * *`;

let workflow = fs.readFileSync(workflowPath, 'utf-8');

// Ersetze vorhandene Cron-Zeile
workflow = workflow.replace(/schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/, `schedule:\n  - cron: "${newSchedule}"`);

fs.writeFileSync(workflowPath, workflow);

console.log(`🕒 Next scheduled task at: ${newSchedule}`);
