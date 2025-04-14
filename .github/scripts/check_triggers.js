const fs = require('fs').promises;

async function loadFetch() {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
}

async function createFile(fetch, targetFile, pat, owner, repo, branch, commitMessage) {
  const contentData = { ready: true };
  const encodedContent = Buffer.from(JSON.stringify(contentData, null, 2)).toString('base64');
  let fileSha = null;

  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetFile}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      fileSha = fileInfo.sha;
      console.log('[INFO] Existing file found, SHA:', fileSha);
    } else if (getRes.status === 404) {
      console.log('[INFO] File does not exist. Will create new.');
    } else {
      throw new Error(`Fetching existing file failed: ${getRes.statusText}`);
    }
  } catch (err) {
    console.error('[ERROR] Fetching existing file:', err);
    process.exit(1);
  }

  try {
    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${targetFile}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${pat}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch,
          sha: fileSha || undefined,
        }),
      }
    );

    const data = await putRes.json();
    if (putRes.ok) {
      console.log('[SUCCESS] File updated:', data.content.path);
    } else {
      console.error('[ERROR] GitHub update failed:', data);
      process.exit(1);
    }
  } catch (err) {
    console.error('[ERROR] GitHub request error:', err);
    process.exit(1);
  }
}

async function main() {
  const fetch = await loadFetch();
  const TRIGGER_CONFIG_FILE = 'trigger_config.json';
  const TARGET_FILE = process.env.KEY_FILE || 'bla.json';
  const PAT = process.env.PAT_PUSH;
  const OWNER = process.env.USERNAME;
  const REPO = process.env.REPO_PUPLIC;
  const BRANCH = process.env.BRANCH;

  // Aktuelle Zeit
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesSinceMidnight = Math.floor((now - midnight) / 60000);

  // Config lesen
  let config;
  try {
    config = JSON.parse(await fs.readFile(TRIGGER_CONFIG_FILE));
    console.log('[INFO] Loaded config:', config);
  } catch (err) {
    console.error('[ERROR] Reading config:', err);
    return; // Keine Config, nichts tun
  }

  // Trigger prüfen
  for (const [index, time] of config.triggerTimes.entries()) {
    if (time <= minutesSinceMidnight) {
      console.log(`[INFO] Trigger ${index} at minute ${time} activated`);
      await createFile(fetch, TARGET_FILE, PAT, OWNER, REPO, BRANCH, `Create ${TARGET_FILE} for trigger ${index}`);

      // 30 Sekunden warten
      console.log('[INFO] Waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));

      // API-Call (fire-and-forget)
      fetch('https://multichaintools.vercel.app/api/github-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'main' }),
      }).then(() => console.log('[INFO] API call sent')).catch(err => console.error('[ERROR] API call failed:', err));
      
      break; // Nur ein Trigger pro Lauf
    }
  }
  console.log('[INFO] No trigger activated');
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
