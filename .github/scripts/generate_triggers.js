const fs = require('fs').promises;
const TRIGGER_COUNT = parseInt(process.env.TRIGGER_COUNT || '4');

async function loadFetch() {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
}

async function createFile() {
  const fetch = await loadFetch();
  console.log('[DEBUG] Fetch function loaded:', typeof fetch);

  const GITHUB_PAT = process.env.PAT_PUSH;
  const GITHUB_REPO_OWNER = process.env.USERNAME;
  const GITHUB_REPO_NAME = process.env.REPO_PUPLIC;
  const GITHUB_BRANCH = process.env.BRANCH;
  const GITHUB_TARGET_FILE = 'trigger_config.json';
  const GITHUB_COMMIT_MESSAGE = `Update ${GITHUB_TARGET_FILE} for ${new Date().toISOString().split('T')[0]}`;

  if (!GITHUB_PAT || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME || !GITHUB_BRANCH) {
    console.error('[ERROR] Missing environment variables:', {
      pat: !!GITHUB_PAT,
      owner: !!GITHUB_REPO_OWNER,
      repo: !!GITHUB_REPO_NAME,
      branch: !!GITHUB_BRANCH,
    });
    process.exit(1);
  }

  console.log('[DEBUG] API request to:', `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_TARGET_FILE}?ref=${GITHUB_BRANCH}`);

  const today = new Date().toISOString().split('T')[0];
  const triggerTimes = [];
  const MIN_GAP = 60;
  const MAX_MINUTES = 1400;

  while (triggerTimes.length < TRIGGER_COUNT) {
    const time = Math.floor(Math.random() * (MAX_MINUTES - MIN_GAP * TRIGGER_COUNT)) + 2;
    if (!triggerTimes.some(t => Math.abs(t - time) < MIN_GAP)) {
      triggerTimes.push(time);
    }
  }
  triggerTimes.sort((a, b) => a - b);

  const config = { date: today, triggerTimes };
  const contentData = JSON.stringify(config, null, 2);
  const encodedContent = Buffer.from(contentData).toString('base64');
  let fileSha = null;

  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_TARGET_FILE}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
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
      console.error('[ERROR] Fetching existing file failed:', getRes.statusText);
      process.exit(1);
    }
  } catch (err) {
    console.error('[ERROR] Fetching existing file failed:', err);
    process.exit(1);
  }

  try {
    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_TARGET_FILE}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: GITHUB_COMMIT_MESSAGE,
          content: encodedContent,
          branch: GITHUB_BRANCH,
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

createFile().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
