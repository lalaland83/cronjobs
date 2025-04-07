const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
const nextTimestamp = new Date(pending.timestamps[0]);

// 2 Minuten Puffer einbauen
const cronTarget = new Date(nextTimestamp.getTime() + 2 * 60 * 1000);
const minute = cronTarget.getUTCMinutes();
const hour = cronTarget.getUTCHours();

const newSchedule = `${minute} ${hour} * * *`;

let workflow = fs.readFileSync(workflowPath, 'utf-8');

// Ersetze die Cron-Zeile
workflow = workflow.replace(
  /schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/,
  `schedule:\n  - cron: "${newSchedule}"`
);

fs.writeFileSync(workflowPath, workflow);
console.log(`🕒 Cron auf nächste Zeit gesetzt: ${newSchedule}`);
