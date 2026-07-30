/* ==========================================================================
   smoke-test-bot.js — Teste toutes les commandes du bot Discord sans token
   réel (via discord-mock.js). À lancer depuis n'importe quel dossier :
     node .claude/skills/ebay-copilot-run/scripts/smoke-test-bot.js
   Nécessite que `npm install` ait été fait dans ebay-dropship-bot/discord-bot/.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const { testCommand } = require("./discord-mock.js");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const BOT_DIR = path.join(REPO_ROOT, "ebay-dropship-bot", "discord-bot");
const COMMANDS_DIR = path.join(BOT_DIR, "commands");
const SCENARIOS_PATH = path.join(__dirname, "bot-scenarios.json");

(async () => {
  if (!fs.existsSync(path.join(BOT_DIR, "node_modules"))) {
    console.error(`node_modules introuvable dans ${BOT_DIR}. Lancez d'abord : cd ebay-dropship-bot/discord-bot && npm install`);
    process.exit(1);
  }

  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, "utf8"));
  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".js"));

  let failures = 0;
  for (const file of files) {
    if (!(file in scenarios)) {
      console.log(`⚠️  ${file} : pas de scénario dans bot-scenarios.json — ajoutez-en un (voir la skill ebay-copilot-add-command). Test ignoré.`);
      continue;
    }
    const result = await testCommand(path.join(COMMANDS_DIR, file), scenarios[file]);
    if (result.ok) {
      console.log(`✅ ${file} — OK (${result.json.name}, ${result.json.options ? result.json.options.length : 0} option(s))`);
    } else {
      failures++;
      console.log(`❌ ${file} — ÉCHEC :`);
      result.issues.forEach(i => console.log(`   - ${i}`));
    }
  }

  console.log(`\n${files.length - failures}/${files.length} commande(s) OK.`);
  process.exit(failures > 0 ? 1 : 0);
})();
