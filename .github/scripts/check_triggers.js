const fs = require('fs').promises;
const { execSync } = require('child_process');

async function loadFetch() {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
}

async function main() {
  const fetch = await loadFetch();
  const TRIGGER_CONFIG_FILE = 'trigger_config.json';
  const TARGET_FILE = process.env.KEY_FILE || 'bla.json';
  const REPO = process.env.REPO_PUPLIC;
  const BRANCH = process.env.BRANCH;

  console.log(`[DEBUG] Using repo: ${REPO}, branch: ${BRANCH}, file: ${TARGET_FILE}`);

  let config;
  try {
    config = JSON.parse(await fs.readFile(TRIGGER_CONFIG_FILE));
    console.log('[INFO] Loaded config:', config);
  } catch (err) {
    console.error('[ERROR] Reading config:', err);
    return;
  }

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesSinceMidnight = Math.floor((now - midnight) / 60000);

  for (const [index, time] of config.triggerTimes.entries()) {
    if (time <= minutesSinceMidnight) {
      console.log(`[INFO] Trigger ${index} at minute ${time} activated`);
      execSync(`node .github/scripts/create-file.js`, { stdio: 'inherit', env: process.env });

      console.log('[INFO] Waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));

      fetch('https://multichaintools.vercel.app/api/github-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'main' }),
      }).then(() => console.log('[INFO] API call sent')).catch(err => console.error('[ERROR] API call failed:', err));
      
      break;
    }
  }
  console.log('[INFO] No trigger activated');
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
