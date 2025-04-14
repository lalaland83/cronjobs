const fs = require('fs').promises;

async function main() {
  const TRIGGER_COUNT = parseInt(process.env.TRIGGER_COUNT || '4');
  const TRIGGER_CONFIG_FILE = 'trigger_config.json';
  const today = new Date().toISOString().split('T')[0];

  let config;
  try {
    config = JSON.parse(await fs.readFile(TRIGGER_CONFIG_FILE));
    if (config.date !== today) throw new Error('New day');
    console.log('[INFO] Loaded existing config:', config);
  } catch {
    config = {
      date: today,
      triggerTimes: Array.from({ length: TRIGGER_COUNT }, () => Math.floor(Math.random() * 1440)).sort((a, b) => a - b),
      executed: [],
    };
    await fs.writeFile(TRIGGER_CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('[INFO] Created new config:', config);
  }

  // Simulieren einer Trigger-Prüfung (nur Logging)
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesSinceMidnight = Math.floor((now - midnight) / 60000);
  console.log('[INFO] Current minutes since midnight:', minutesSinceMidnight);

  for (let i = 0; i < config.triggerTimes.length; i++) {
    if (config.triggerTimes[i] <= minutesSinceMidnight && !config.executed.includes(i)) {
      console.log(`[INFO] Trigger ${i} at minute ${config.triggerTimes[i]} would activate`);
      // Keine Aktion, nur testen
    }
  }
}

main().catch(err => {
  console.error('[ERROR] Script failed:', err);
  process.exit(1);
});
