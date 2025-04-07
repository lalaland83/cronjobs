const fs = require('fs');
const path = require('path');

const PENDING_FILE = 'pending.json';
const WORKFLOW_FILE = '.github/workflows/cron-job.yml';

function generateCronExpression(date) {
  const d = new Date(date);
  const min = d.getUTCMinutes();
  const hour = d.getUTCHours();
  return `${min} ${hour} * * *`;
}

function getNextPendingTime() {
  if (!fs.existsSync(PENDING_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8'));
  const now = new Date().toISOString();
  const future = data.filter(ts => ts > now);
  future.sort();
  return future[0] || null;
}

function writeWorkflow(cronExpr) {
  const content = `name: Cron Job Runner

on:
  schedule:
    - cron: '${cronExpr}'
  workflow_dispatch:

jobs:
  run-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run task and update schedules
        run: |
          npm install
          node run-task.js

      - name: Auto-commit updates
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Update executed + regenerate schedule
          file_pattern: pending.json executed.json .github/workflows/cron-job.yml
`;
  fs.mkdirSync(path.dirname(WORKFLOW_FILE), { recursive: true });
  fs.writeFileSync(WORKFLOW_FILE, content);
  console.log(`✅ Created new cron schedule: ${cronExpr}`);
}

const nextTime = getNextPendingTime();
if (nextTime) {
  const cronExpr = generateCronExpression(nextTime);
  writeWorkflow(cronExpr);
} else {
  console.log('⏸️ No future pending tasks.');
}
