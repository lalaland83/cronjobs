const fs = require('fs').promises;
const path = require('path');

async function loadFetch() {
  const fetchModule = await import('node-fetch'); // Dynamischer ESM-Import
  return fetchModule.default;
}

async function createFile() {
  const fetch = await loadFetch(); // Fetch dynamisch laden
  console.log('[DEBUG] Fetch function loaded:', typeof fetch); // Debugging

  const GITHUB_PAT = process.env.PAT_PUSH;
  const GITHUB_REPO_OWNER = process.env.USERNAME;
  const GITHUB_REPO_NAME = process.env.REPO;
  const GITHUB_BRANCH = process.env.BRANCH;
  const GITHUB_TARGET_FILE = process.env.KEY_FILE || 'bla.json';
  const GITHUB_COMMIT_MESSAGE = `Create ${GITHUB_TARGET_FILE} for testing`;

  if (!GITHUB_PAT || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME || !GITHUB_BRANCH) {
    console.error('[ERROR] Missing environment variables.');
    process.exit(1);
  }

  const contentData = { ready: true };
  const encodedContent = Buffer.from(JSON.stringify(contentData, null, 2)).toString('base64');
  let fileSha = null;

  try {
    // Prüfen, ob die Datei existiert
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
    // Datei erstellen oder aktualisieren
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
