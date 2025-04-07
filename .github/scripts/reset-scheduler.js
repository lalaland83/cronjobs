// .github/scripts/reset-scheduler.js

const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');

// === Konfiguration ===
const MIN_OFFSET_MINUTES = 2;
const RANGE_MINUTES = 3;

// === Timestamp-Logik ===
const now = new Date();
const min = new Date(now.getTime() + MIN_OFFSET_MINUTES * 60 * 1000);
const max = new Date(min.getTime() + RANGE_MINUTES * 60 * 1000);

// Zufälligen Zeitpunkt zwischen `min` und `max` wählen
const randomTimestamp = new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime())).toISOString();

// Neue pending.json
const pending = {
  meta: {
    generated_at: new Date().toISOString()
  },
  timestamps: [randomTimestamp]
};

// Alte Datei löschen (falls nötig)
if (fs.existsSync(pendingPath)) {
  fs.unlinkSync(pendingPath);
  console.log('🧹 Alte pending.json gelöscht');
}

// Neue Datei schreiben
fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
console.log(`📄 Neue pending.json geschrieben: ${pendingPath}`);
console.log(`⏱ Timestamp gesetzt: ${randomTimestamp}`);
