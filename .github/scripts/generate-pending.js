const fs = require('fs');

function generateRandomTimes(baseDate = new Date()) {
  const times = new Set();
  while (times.size < 5) {
    const offset = Math.floor(Math.random() * 5 * 60 * 1000); // innerhalb von 5 Minuten
    const newTime = new Date(baseDate.getTime() + offset).toISOString();
    times.add(newTime);
  }
  return Array.from(times);
}

const pending = generateRandomTimes();

// Bestehende vergleichen, nur neu schreiben wenn anders
const filePath = 'pending.json';
const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];

const changed = JSON.stringify(existing) !== JSON.stringify(pending);
if (changed) {
  fs.writeFileSync(filePath, JSON.stringify(pending, null, 2));
  console.log('📅 Generated new pending.json with:', pending);
} else {
  // Force change: füge leeren Eintrag ein und dann wieder raus (Hack)
  fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  fs.writeFileSync(filePath, JSON.stringify(pending, null, 2));
  console.log('📅 No change detected – forced rewrite to trigger commit.');
}
