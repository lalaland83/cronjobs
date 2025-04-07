const fs = require('fs');
const path = require('path');

const now = new Date();
now.setUTCSeconds(0, 0);

// ⏳ Startzeit = jetzt + 2 Minuten
const startTime = new Date(now.getTime() + 2 * 60 * 1000);
const interval = 90 * 1000; // mindestens 90 Sekunden Abstand

const timestamps = [];

for (let i = 0; i < 5; i++) {
  const ts = new Date(startTime.getTime() + i * interval);
  timestamps.push(ts.toISOString());
}

const data = {
  meta: {
    generated_at: new Date().toISOString()
  },
  timestamps
};

const outputPath = path.join(__dirname, '..', '..', 'pending.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`📅 Generated pending.json with timestamps:\n`, timestamps);
