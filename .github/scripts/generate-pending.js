const fs = require('fs');
const path = require('path');

const NUM_TIMESTAMPS = 5;
const INTERVAL_MINUTES = 10;
const BUFFER_MINUTES = 2; // Sicherheitsabstand für ersten Cron

// Jetztzeit + 2 Minuten Sicherheitsabstand
const now = new Date(Date.now() + BUFFER_MINUTES * 60 * 1000);
const timestamps = [];

for (let i = 0; i < NUM_TIMESTAMPS; i++) {
  const offset = Math.floor(Math.random() * INTERVAL_MINUTES * 60 * 1000);
  const ts = new Date(now.getTime() + offset).toISOString();
  timestamps.push(ts);
}

// Sortieren
timestamps.sort((a, b) => new Date(a) - new Date(b));

const pending = {
  meta: {
    generated_at: new Date().toISOString()
  },
  timestamps
};

const outputPath = path.join(__dirname, '..', '..', 'pending.json');
fs.writeFileSync(outputPath, JSON.stringify(pending, null, 2));
console.log(`📅 Generated new pending.json with:\n`, timestamps);
