const fs = require('fs').promises;

async function loadFetch() {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
}

async function commitFile(fetch, filePath, content, pat, owner, repo, branch, commitMessage) {
  const encodedContent = Buffer.from(content).toString('base64');
  let fileSha = null;

  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
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
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
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
  const TRIGGER_COUNT = parseInt(process.env.TRIGGER_COUNT || '4');
  const TRIGGER_CONFIG_FILE = 'trigger_config.json';
  const PAT = process.env.PAT_PUSH;
  const OWNER = process.env.USERNAME;
  const REPO = process.env.REPO;
  const BRANCH = process.env.BRANCH;

  // Aktuelle Zeit prüfen (Mitternachts-Check)
  const now = new Date();
  const minutesSinceMidnight = Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 60000);

  // Nur bei Mitternacht (+2 Minuten Puffer) neue Trigger generieren
  if (minutesSinceMidnight < 2) {
    const today = now.toISOString().split('T')[0];
    const config = {
      date: today,
      triggerTimes: Array.from({ length: TRIGGER_COUNT }, () => Math.floor(Math.random() * 1438) + 2).sort((a, b) => a - b), // +2 Minuten Puffer
      executed: [],
    };

    const content = JSON.stringify(config, null, 2);
    await fs.writeFile(TRIGGER_CONFIG_FILE, content);
    console.log('[INFO] Generated new config:', config);

    // Config pushen
    await commitFile(fetch, TRIGGER_CONFIG_FILE, content, PAT, OWNER, REPO, BRANCH, `Update ${TRIGGER_CONFIG_FILE} for ${today}`);
  } else {
    console.log('[INFO] Not midnight, skipping generation:', minutesSinceMidnight);
  }
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
