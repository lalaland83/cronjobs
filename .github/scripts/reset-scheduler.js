const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pendingFile = path.join(process.cwd(), 'pending.json');

// 🧹 Alte Datei löschen
if (fs.existsSync(pendingFile)) {
  fs.unlinkSync(pendingFile);
  console.log('🧹 Alte pending.json gelöscht');
}

// 📅 Neue Zeiten generieren
const now = new Date();
const timestamps = [];
for (let i = 0; i < 5; i++) {
  const randomOffset = Math.floor(Math.random() * 4 * 60 * 1000); // innerhalb von 4 Minuten
  const newTime = new Date(now.getTime() + randomOffset);
  timestamps.push(newTime.toISOString());
}

// 🧠 Um sicher zu gehen, dass sich die Datei ändert, fügen wir einen extra Timestamp ein
const meta = { generated_at: new Date().toISOString() };

const output = {
  meta,
  timestamps
};

// 💾 Speichern
fs.writeFileSync(pendingFile, JSON.stringify(output, null, 2));
console.log('📄 Neue pending.json geschrieben:', pendingFile);

// 🕵️ Git-Diff anzeigen (zum Debuggen)
try {
  const diff = execSync(`git diff ${pendingFile}`).toString();
  if (diff.trim()) {
    console.log('🟢 Änderungen erkannt:\n', diff);
  } else {
    console.log('🔴 Keine Änderungen erkannt – Inhalt evtl. identisch?');
  }
} catch (err) {
  console.error('❌ Fehler beim git diff:', err);
}
