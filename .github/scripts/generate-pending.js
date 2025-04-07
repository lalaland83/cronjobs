// .github/scripts/generate-pending.js
const fs = require('fs');
const path = require('path');

// Absoluter Pfad zur richtigen Datei im Projekt-Root
const filePath = path.resolve(__dirname, '../../pending.json');

const timestamps = [];
for (let i = 0; i < 5; i++) {
  const now = new Date();
  const offset = Math.floor(Math.random() * 300); // bis zu 5 Minuten (in Sekunden)
  now.setSeconds(now.getSeconds() + offset);
  timestamps.push(now.toISOString());
}

// Optional: alte Datei löschen
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  console.log('🗑️ Alte pending.json gelöscht');
}

// Neue Datei schreiben
fs.writeFileSync(filePath, JSON.stringify(timestamps, null, 2));
console.log('📅 Generated new pending.json with:', timestamps);
console.log('📄 Geschrieben nach:', filePath);
