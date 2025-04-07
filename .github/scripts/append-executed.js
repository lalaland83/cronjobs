const fs = require('fs');

const pendingPath = 'pending.json';
const executedPath = 'executed.json';

// Lade Dateien
const pending = fs.existsSync(pendingPath)
  ? JSON.parse(fs.readFileSync(pendingPath, 'utf8'))
  : [];

const executed = fs.existsSync(executedPath)
  ? JSON.parse(fs.readFileSync(executedPath, 'utf8'))
  : [];

// Nimm das erste Pending-Element
const next = pending.shift();

if (!next) {
  console.log('⚠️  Keine pending-Zeit gefunden.');
  process.exit(0);
}

// Füge das Pending-Datum zu Executed hinzu
executed.push(next);

// Speichern
fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
fs.writeFileSync(executedPath, JSON.stringify(executed, null, 2));

console.log(`✅ Verschoben: ${next}`);
