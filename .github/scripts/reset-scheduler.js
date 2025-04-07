const fs = require('fs');
const { execSync } = require('child_process');

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

// 🧹 pending.json zurücksetzen
fs.writeFileSync('pending.json', '[]');
console.log('🧹 Alte pending.json gelöscht');

// 🔧 Neue pending-Zeiten generieren
run('npm run generate:pending');

// 🔧 Nächsten Schedule setzen
run('npm run generate:schedule');
