const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');
const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'execute-job.yml');

// Log Schritt 1 – Lade pending.json
console.log('📂 Lade pending.json...');
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf-8'));

if (!pending.timestamps || pending.timestamps.length === 0) {
  console.error('❌ Keine Timestamps in pending.json gefunden. Abbruch.');
  process.exit(1);
}

// Nimm den ersten Timestamp aus pending
const nextTimestamp = new Date(pending.timestamps[0]);
console.log('📅 Nächster geplanter Timestamp:', nextTimestamp.toISOString());

// Extrahiere Stunden und Minuten
let minute = nextTimestamp.getUTCMinutes();
let hour = nextTimestamp.getUTCHours();

// Sicherheits-Check: Verhindere doppelten Cron mit aktuellem Zeitpunkt
const now = new Date();
console.log('🕒 Aktuelle Zeit (UTC):', now.toISOString());

if (now.getUTCMinutes() === minute && now.getUTCHours() === hour) {
  console.log('⚠️ Geplanter Zeitpunkt entspricht aktueller Minute. +1 zur Sicherheit.');
  minute = (minute + 1) % 60;
  if (minute === 0) hour = (hour + 1) % 24;
}

const newSchedule = `${minute} ${hour} * * *`;
console.log('🛠️ Neuer Cron-Zeitplan:', newSchedule);

// Lade das Workflow-File
console.log('📂 Lade execute-job.yml...');
let workflow = fs.readFileSync(workflowPath, 'utf-8');

// Ersetze den schedule-Eintrag
const scheduleRegex = /schedule:\s*\n\s*-\s*cron:\s*["'][^"']+["']/;
if (!scheduleRegex.test(workflow)) {
  console.error('❌ Kein gültiger schedule-Block in der Workflow-Datei gefunden.');
  process.exit(1);
}

workflow = workflow.replace(scheduleRegex, `schedule:\n  - cron: "${newSchedule}"`);

// Schreibe das neue Workflow-File zurück
fs.writeFileSync(workflowPath, workflow);
console.log('✅ Workflow-Datei aktualisiert und gespeichert.');

// Debug: Optional zeige neuen schedule-Block an
console.log('\n🔍 Neuer schedule-Block in execute-job.yml:');
console.log('------------------------------------------');
console.log(`on:\n  schedule:\n    - cron: "${newSchedule}"`);
console.log('------------------------------------------');

console.log('🎉 Setup abgeschlossen. Der nächste Run sollte durch GitHub getriggert werden.');
