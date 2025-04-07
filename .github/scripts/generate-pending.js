const fs = require('fs');
const path = require('path');

const COUNT = 5;
const RANGE_MINUTES = 10;

function getRandomTimestamps(count, rangeMinutes) {
  const now = new Date();
  const timestamps = [];

  for (let i = 0; i < count; i++) {
    const randomOffset = Math.floor(Math.random() * rangeMinutes * 60 * 1000);
    const timestamp = new Date(now.getTime() + randomOffset);
    timestamps.push(timestamp);
  }

  return timestamps
    .sort((a, b) => a - b)
    .map(ts => ts.toISOString()); // erst nach dem Sortieren konvertieren!
}


const timestamps = getRandomTimestamps(COUNT, RANGE_MINUTES);

const data = {
  meta: {
    generated_at: new Date().toISOString(),
  },
  timestamps,
};

const filePath = path.join(__dirname, '..', '..', 'pending.json');
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`📅 Generated new pending.json with:`);
console.log(JSON.stringify(data.timestamps, null, 2));
console.log(`📄 Geschrieben nach: ${filePath}`);
