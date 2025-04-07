const { execSync } = require("child_process");
const fs = require("fs");

function run(cmd) {
  console.log(`🔧 ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

// Optional: alte pending.json leeren (falls du das willst)
if (fs.existsSync("pending.json")) {
  fs.unlinkSync("pending.json");
  console.log("🧹 Alte pending.json gelöscht");
}

// 1. Neue pending.json erzeugen
run("npm run generate:pending");

// 2. Nächsten Schedule setzen
run("npm run generate:schedule");

// 3. Commit vorbereiten
run('git add pending.json .github/workflows/execute-job.yml');
run('git commit -m "📅 Initial reset"');
run('git push');
