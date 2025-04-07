const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

// 📄 pending.json laden
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
const nextTimestamp = new Date(pending.timestamps[0]);

// ⏱ Uhrzeit extrahieren
const minute = nextTimestamp.getUTCMinutes();
const hour = nextTimestamp.getUTCHours();

// 🕒 Cron-String vorbereiten
const newSchedule = `${minute} ${hour} * * *`;

// 🔁 Alte Zeit in Workflow-Datei ersetzen
let workflow = fs.readFileSync(workflowPath, 'utf-8');
workflow = workflow.replace(
  /schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/,
  `schedule:\n  - cron: "${newSchedule}"`
);

// 💾 Neue Datei schreiben
fs.writeFileSync(workflowPath, workflow);
console.log(`🕒 Next scheduled task at: ${newSchedule}`);
