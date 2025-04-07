const fs = require('fs');
const path = '.github/workflows/execute-job.yml';
const pending = JSON.parse(fs.readFileSync('pending.json'));
if (pending.length === 0) {
  console.log('✅ No pending tasks.');
  process.exit(0);
}
const nextTime = new Date(pending.shift());
const cronTime = `${nextTime.getUTCMinutes()} ${nextTime.getUTCHours()} * * *`;
let template = fs.readFileSync(path, 'utf-8');
template = template.replace(/cron: '.*'/, `cron: '${cronTime}'`);
fs.writeFileSync(path, template);
fs.writeFileSync('pending.json', JSON.stringify(pending, null, 2));
console.log('🕒 Next scheduled task at:', cronTime);