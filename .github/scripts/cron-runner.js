const fs = require('fs');
const path = require('path');

const EXECUTE_JOB_PATH = path.join('.github', 'workflows', 'execute-job.yml');
const STOP_FILE = 'stop.json';

const TIME_BUFFER_MINUTES = 2;
const TIME_RANGE_MINUTES = 3;

function shouldStop() {
  try {
    const stop = JSON.parse(fs.readFileSync(STOP_FILE, 'utf8'));
    return stop?.stop === true;
  } catch (e) {
    return false;
  }
}

function generateRandomCronDate() {
  const now = new Date();
  const min = new Date(now.getTime() + TIME_BUFFER_MINUTES * 60000);
  const max = new Date(min.getTime() + TIME_RANGE_MINUTES * 60000);
  const randomTime = new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime()));

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
        run: node scripts/script.js

      - name: Commit updated cron (if any)
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 🔁 Next cron scheduled
          file_pattern: '.github/workflows/execute-job.yml'
`;
  fs.writeFileSync(EXECUTE_JOB_PATH, content.trim());
  console.log(`✅ Neue Zeit generiert: ${minute} ${hour} UTC`);
}

function main() {
  if (shouldStop()) {
    console.log('🛑 Stop-Datei erkannt. Cron-Loop wird nicht fortgesetzt.');
    return;
  }

  const { minute, hour } = generateRandomCronDate();
  updateExecuteJobYML(minute, hour);
}

main();
