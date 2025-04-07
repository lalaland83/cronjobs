const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');

// Startzeit = jetzt + 2 Minuten Puffer
const now = new Date();
const start = new Date(now.getTime() + 2 * 60 * 1000); // +2 min
const end = new Date(start.getTime() + 10 * 60 * 1000); // +10 min Fenster

const minGapMs = 90 * 1000; // 90 Sekunden Abstand

function getRandomTimestampBetween(start, end) {
  const diff = end.getTime() - start.getTime();
  const offset = Math.floor(Math.random() * diff);
  return new Date(start.getTime() + offset);
}

const timestamps = [];

while (timestamps.length < 5) {
  const candidate = getRandomTimestampBetween(start, end);

  const isValid = timestamps.every(existing =>
    Math.abs(new Date(existing) - candidate) >= minGapMs
  );

  if (isValid) {
    timestamps.push(candidate.toISOString());
  }
}

// Timestamps sortieren
timestamps.sort((a, b) => new Date(a) - new Date(b));

// JSON schreiben
const result = {
  meta: {
    generated_at: new Date().toISOString()
  },
  timestamps
};

fs.writeFileSync(pendingPath, JSON.stringify(result, null, 2));
console.log(`✅ Neue pending.json geschrieben: ${pendingPath}`);
