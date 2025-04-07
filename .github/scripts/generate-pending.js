const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');

// Konfigurierbare Werte
const MIN_OFFSET_MINUTES = 2;
const RANGE_MINUTES = 3;

// Zeit jetzt + minOffset
const now = new Date();
const minTime = new Date(now.getTime() + MIN_OFFSET_MINUTES * 60 * 1000);

// Zeit jetzt + minOffset + range
const maxTime = new Date(minTime.getTime() + RANGE_MINUTES * 60 * 1000);

// Zufälliger Zeitpunkt zwischen minTime und maxTime
const randomTime = new Date(
  minTime.getTime() + Math.random() * (maxTime.getTime() - minTime.getTime())
);

// JSON erzeugen
const result = {
  meta: {
    generated_at: new Date().toISOString()
  },
  timestamps: [randomTime.toISOString()]
};

// Schreiben
fs.writeFileSync(pendingPath, JSON.stringify(result, null, 2));
console.log('✅ Neue pending.json mit 1 Timestamp:', result.timestamps[0]);
