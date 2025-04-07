const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));
const nextTimestamp = new Date(pending.timestamps[0]);

const minute = nextTimestamp.getUTCMinutes();
const hour = nextTimestamp.getUTCHours();

let cronMinute = minute;
const now = new Date();

if (now.getUTCMinutes() === minute && now.getUTCHours() === hour) {
  cronMinute = (minute + 1) % 60; // ⛔ identischer Cron würde ignoriert werden
}

const newSchedule = `${cronMinute} ${hour} * * *`;

let workflow = fs.readFileSync(workflowPath, 'utf-8');

// Ersetze die erste Zeile nach "schedule:" mit dem neuen Wert
workflow = workflow.replace(/schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/, `schedule:\n  - cron: "${newSchedule}"`);

fs.writeFileSync(workflowPath, workflow);
console.log(`🕒 Next scheduled task at: ${newSchedule}`);
