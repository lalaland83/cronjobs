const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXECUTED_FILE = 'executed.json';
const STOP_FILE = 'stop.json';

function shouldStop() {
  try {
    const stop = JSON.parse(fs.readFileSync(STOP_FILE, 'utf8'));
    return stop?.stop === true;
  } catch {
    return false;
  }
}

function logExecution() {
  const now = new Date().toISOString();
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(EXECUTED_FILE, 'utf8'));
  } catch {}

  logs.push({ timestamp: now });
  fs.writeFileSync(EXECUTED_FILE, JSON.stringify(logs, null, 2));
  console.log(`✅ Job ausgeführt um ${now}`);
}

function commitExecuted() {
  try {
    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
    execSync(`git add ${EXECUTED_FILE}`);
    execSync('git commit -m "📝 Execution logged"');
    execSync('git push');
    console.log('🚀 Execution log commited und gepusht.');
  } catch (e) {
    console.error('❌ Commit/Push fehlgeschlagen oder nicht notwendig.');
  }
}

function triggerNext() {
  console.log('⏩ Starte cron-runner...');
  execSync('node scripts/cron-runner.js');
}

function main() {
  if (shouldStop()) {
    console.log('🛑 Stop-Datei erkannt. Kein weiterer Run.');
    return;
  }

  logExecution();
  commitExecuted();
  triggerNext();
}

main();
