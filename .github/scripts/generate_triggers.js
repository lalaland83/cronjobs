const fs = require('fs').promises;
const TRIGGER_COUNT = parseInt(process.env.TRIGGER_COUNT || '4');

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
  const TRIGGER_CONFIG_FILE = 'trigger_config.json';
  const PAT = process.env.PAT_PUSH;
  const OWNER = process.env.USERNAME;
  const REPO = process.env.REPO_PUPLIC;
  const BRANCH = process.env.BRANCH;

  const today = new Date().toISOString().split('T')[0];
  const triggerTimes = [];
  const MIN_GAP = 10;
  const MAX_MINUTES = 1438;

  while (triggerTimes.length < TRIGGER_COUNT) {
    const time = Math.floor(Math.random() * (MAX_MINUTES - MIN_GAP * TRIGGER_COUNT)) + 2;
    if (!triggerTimes.some(t => Math.abs(t - time) < MIN_GAP)) {
      triggerTimes.push(time);
    }
  }
  triggerTimes.sort((a, b) => a - b);

  const config = {
    date: today,
    triggerTimes,
  };

  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(TRIGGER_CONFIG_FILE, content);
  console.log('[INFO] Generated new config:', config);

  await commitFile(fetch, TRIGGER_CONFIG_FILE, content, PAT, OWNER, REPO, BRANCH, `Update ${TRIGGER_CONFIG_FILE} for ${today}`);
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
