const { execSync } = require('child_process');

async function loadFetch() {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
}

async function main() {
  const fetch = await loadFetch();

  console.log('[INFO] Running create-file.js...');
  try {
    execSync(`node .github/scripts/create-file.js`, { 
      stdio: 'inherit', 
      env: {
        ...process.env,
        PAT_PUSH: process.env.PAT_PUSH,
        REPO_PUBLIC: process.env.REPO_PUBLIC,
        USERNAME: process.env.USERNAME,
        BRANCH: process.env.BRANCH,
        KEY_FILE: process.env.KEY_FILE
      }
    });
  } catch (err) {
    console.error('[ERROR] Running create-file.js:', err);
    process.exit(1);
  }

  console.log('[INFO] Waiting 30 seconds...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  console.log('[INFO] Sending API call...');
  fetch('https://multichaintools.vercel.app/api/github-trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: 'main' }),
  }).then(() => console.log('[INFO] API call sent')).catch(err => console.error('[ERROR] API call failed:', err));
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
