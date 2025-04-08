const fs = require('fs');
const path = require('path');

const EXECUTE_JOB_PATH = path.join('.github', 'workflows', 'execute-job.yml');
const STOP_FILE = 'stop.json';

const TIME_BUFFER_MINUTES = 2;
const TIME_RANGE_MINUTES = 5;

function shouldStop() {
  try {
    const stop = JSON.parse(fs.readFileSync(STOP_FILE, 'utf8'));
    const stopping = stop?.stop === true;
    console.log(`📄 stop.json gefunden. Stop-Flag: ${stopping}`);
    return stopping;
  } catch (e) {
    console.log('📄 stop.json nicht gefunden oder ungültig – fahre fort.');
    return false;
  }
}

function generateRandomCronDate() {
  const now = new Date();
  const min = new Date(now.getTime() + TIME_BUFFER_MINUTES * 60000);
  const max = new Date(min.getTime() + TIME_RANGE_MINUTES * 60000);
  const randomTime = new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime()));

  console.log(`🕒 Jetzt:       ${now.toISOString()}`);
  console.log(`🕒 Zeitfenster: ${min.toISOString()} - ${max.toISOString()}`);
  console.log(`🎯 Gewählt:     ${randomTime.toISOString()}`);

  return {
    minute: randomTime.getUTCMinutes(),
    hour: randomTime.getUTCHours(),
  };
}

function updateExecuteJobYML(minute, hour) {
  const content = `
name: Execute Job

on:
  schedule:
    - cron: '${minute} ${hour} * * *'
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: cronjob-lock
  cancel-in-progress: true

jobs:
  run-script:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run script
        run: node .github/scripts/script.js

      - name: Commit initial schedule manually
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add .github/workflows/execute-job.yml
          git commit -m "🟢 First cron scheduled"
          git push
`;

  fs.writeFileSync(EXECUTE_JOB_PATH, content.trim());
  console.log(`✅ Neue Cron-Zeit in execute-job.yml geschrieben: ${minute} ${hour} UTC`);
}

function main() {
  console.log('🚀 Starte Cron-Runner...');
  if (shouldStop()) {
    console.log('🛑 Stop-Datei erkannt. Cron-Loop wird nicht fortgesetzt.');
    return;
  }

  const { minute, hour } = generateRandomCronDate();
  updateExecuteJobYML(minute, hour);
}

main();
