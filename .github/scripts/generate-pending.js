const fs = require('fs');
const path = require('path');

const pendingPath = path.join(__dirname, '..', '..', 'pending.json');

const now = new Date();
const timestamps = new Set();

while (timestamps.size < 5) {
  const offset = Math.floor(Math.random() * (10 * 60 * 1000)); // 10 Minuten
  const future = new Date(now.getTime() + offset + 2 * 60 * 1000); // +2 Minuten Puffer
  timestamps.add(future.toISOString());
}

const sorted = Array.from(timestamps).sort(); // Sortierung als ISO-Strings klappt super

const data = {
  meta: {
    generated_at: now.toISOString()
  },
  timestamps: sorted
};

fs.writeFileSync(pendingPath, JSON.stringify(data, null, 2));
console.log('✅ Neue sortierte pending.json gespeichert');
