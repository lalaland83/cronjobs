const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
const now = new Date();
const buffer = 2 * 60 * 1000; // 2 Minuten Sicherheitsabstand

// Nächsten sinnvollen Timestamp suchen
const nextTimestamp = pending.timestamps
  .map(t => new Date(t))
  .find(t => t.getTime() > now.getTime() + buffer);

if (!nextTimestamp) {
  console.error('❌ Kein gültiger Timestamp gefunden.');
  process.exit(1);
}

const cronMinute = nextTimestamp.getUTCMinutes();
const cronHour = nextTimestamp.getUTCHours();
const newSchedule = `${cronMinute} ${cronHour} * * *`;

let workflow = fs.readFileSync(workflowPath, 'utf-8');

// Bestehenden schedule-Eintrag ersetzen
workflow = workflow.replace(
  /schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/,
  `schedule:\n  - cron: "${newSchedule}"`
);

fs.writeFileSync(workflowPath, workflow);
console.log(`🕒 Next scheduled task at: ${newSchedule}`);
