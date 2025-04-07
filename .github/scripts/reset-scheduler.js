const fs = require('fs');
const { execSync } = require('child_process');

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

try {
  // 🔄 Git Config setzen für Actions
  run(`git config user.email "41898282+github-actions[bot]@users.noreply.github.com"`);
  run(`git config user.name "github-actions[bot]"`);

  // 🧹 Alte pending.json löschen
  if (fs.existsSync('pending.json')) {
    fs.unlinkSync('pending.json');
    console.log('🧹 Alte pending.json gelöscht');
  }

  // 🔧 Neue pending.json generieren
  run('npm run generate:pending');

  // 🕒 Nächsten Schedule in YAML schreiben
  run('npm run generate:schedule');

  // ✅ Änderungen committen
  run('git add pending.json .github/workflows/execute-job.yml');
  run('git commit -m "📅 Initial reset"');
  console.log('✅ Reset erfolgreich abgeschlossen.');

} catch (error) {
  console.error('❌ Fehler beim Reset:', error.message);
  process.exit(1);
}

// Force mark a dummy file change to ensure Git sees changes
fs.writeFileSync('dummy.txt', `Last reset at ${new Date().toISOString()}\n`);
