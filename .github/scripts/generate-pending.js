const fs = require('fs');
const path = require('path');

const NUM_TIMESTAMPS = 5;
const INTERVAL_MINUTES = 10;

const now = new Date();
const timestamps = [];

for (let i = 0; i < NUM_TIMESTAMPS; i++) {
  const offset = Math.floor(Math.random() * INTERVAL_MINUTES * 60 * 1000); // Zufall in ms
  const ts = new Date(now.getTime() + offset).toISOString();
  timestamps.push(ts);
}

// Sortieren nach Zeit
timestamps.sort((a, b) => new Date(a) - new Date(b));

const pending = {
  meta: {
    generated_at: now.toISOString()
  },
  timestamps
};

const outputPath = path.join(__dirname, '..', '..', 'pending.json');
fs.writeFileSync(outputPath, JSON.stringify(pending, null, 2));
console.log(`📅 Generated new pending.json with:\n`, timestamps);
console.log(`📄 Geschrieben nach: ${outputPath}`);
