const fs = require('fs');
const PENDING_FILE = 'pending.json';
const INTERVAL_MINUTES = 5;
const COUNT = 5;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateTimestamps(count) {
  const now = new Date();
  const timestamps = new Set();
  while (timestamps.size < count) {
    const offset = getRandomInt(INTERVAL_MINUTES * 60 * 1000);
    const future = new Date(now.getTime() + offset);
    timestamps.add(future.toISOString());
  }
  return Array.from(timestamps).sort();
}

const newTimes = generateTimestamps(COUNT);
fs.writeFileSync(PENDING_FILE, JSON.stringify(newTimes, null, 2));
console.log('📅 Generated pending.json with:', newTimes);