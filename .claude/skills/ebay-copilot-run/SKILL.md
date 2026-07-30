---
name: ebay-copilot-run
description: >
  Launch, preview, and smoke-test the eBay Dropship Copilot tool that lives in
  ebay-dropship-bot/ of this repo — the audit/title-generator/sourcing web app
  (index.html) and its companion Discord bot (discord-bot/). Use this whenever
  asked to run, start, preview, open, or verify the eBay Dropship Copilot, the
  "eBay bot", the "dropshipping tool", or the Discord bot, or to confirm a
  change to ebay-dropship-bot/js/*.js, index.html, or discord-bot/commands/*.js
  still works before committing — even if the request is just "run the app",
  "test my change", or "make sure nothing broke", without naming the tool
  explicitly. Also the right tool to sanity-check Discord slash commands
  without a real Discord token, since no live gateway connection is available
  in this environment.
---

# Lancer et vérifier eBay Dropship Copilot

Ce skill couvre les deux surfaces du sous-projet `ebay-dropship-bot/` : l'app
web statique (`index.html`) et le bot Discord (`discord-bot/`). Les deux
partagent le même moteur (`js/rules.js`, `audit.js`, `generator.js`,
`sourcing.js`) — un changement dans `js/` peut donc affecter les deux, testez
toujours les deux quand vous touchez ce dossier.

## Pourquoi des scripts automatisés plutôt qu'un simple `open index.html`

Il n'y a pas de framework de test dans ce sous-projet (vanilla JS, pas de
build). Les scripts ci-dessous reproduisent ce qui a été validé manuellement
lors de la création de l'outil : un serveur HTTP local + navigateur headless
pour le web, et une simulation d'interaction Discord (sans token, sans
connexion réelle au gateway) pour le bot. Utilisez-les au lieu de réinventer
un test ad hoc à chaque fois.

## Tester l'app web

```bash
NODE_PATH=/opt/node22/lib/node_modules node .claude/skills/ebay-copilot-run/scripts/smoke-test-web.js
```

Ce script sert `ebay-dropship-bot/` via `python3 -m http.server`, ouvre la
page dans Chromium headless (préinstallé sur cet environnement sous
`/opt/pw-browsers`, d'où le `NODE_PATH` qui pointe vers le `playwright`
installé globalement), remplit et soumet chacun des 4 onglets (Audit,
Générateur, Sourcing & Marge, Base de connaissances), et échoue (exit code 1)
s'il détecte une erreur JS console ou si un résultat attendu ne s'affiche pas.
Le serveur HTTP est arrêté automatiquement à la fin.

Sur une autre machine que cet environnement Claude Code : `npm install
playwright` dans un dossier temporaire et retirez `executablePath` dans le
script pour laisser Playwright télécharger son propre Chromium.

Pour une inspection visuelle plutôt qu'un smoke test automatisé (ex. après un
changement CSS), lancez le serveur à la main et prenez des captures d'écran
avec Playwright, ou demandez à l'utilisateur d'ouvrir l'URL dans son
navigateur — voir la skill `run` intégrée pour le pattern général.

## Tester le bot Discord (sans token réel)

```bash
node .claude/skills/ebay-copilot-run/scripts/smoke-test-bot.js
```

Nécessite que les dépendances soient installées une fois :
`cd ebay-dropship-bot/discord-bot && npm install`.

Ce script charge chaque fichier de `discord-bot/commands/*.js`, valide sa
définition (`SlashCommandBuilder.toJSON()` — détecte les erreurs de structure
d'options avant même de déployer), puis appelle `execute()` avec une
interaction simulée dont les valeurs viennent de
`scripts/bot-scenarios.json`. Il vérifie aussi que les embeds produits
respectent les limites Discord (titre ≤256, description ≤4096, champ
≤1024...). C'est la seule façon fiable de tester le bot ici : il n'y a pas de
token Discord réel dans cet environnement, donc `npm start` ne peut pas se
connecter au gateway.

Une commande listée dans `commands/` mais absente de `bot-scenarios.json`
est signalée (`⚠️  pas de scénario`) et son exécution est ignorée — c'est
attendu pour une commande tout juste créée avant d'avoir ajouté son scénario
(voir la skill `ebay-copilot-add-command`).

Pour déboguer une commande précise avec des valeurs personnalisées :
```bash
node .claude/skills/ebay-copilot-run/scripts/discord-mock.js \
  ebay-dropship-bot/discord-bot/commands/audit.js \
  '{"titre":"...", "description":"...", "categorie":"Autre", "photos":5, "retours":"30j", "expedition":"france", "delai_annonce":5, "delai_fournisseur":3}'
```

## Vérification rapide du moteur seul (sans navigateur ni bot)

Pour un changement purement logique dans `js/rules.js`, `audit.js`,
`generator.js` ou `sourcing.js`, un simple `require()` Node suffit et est
beaucoup plus rapide qu'un test navigateur complet :

```bash
node -e '
const RULES = require("./ebay-dropship-bot/js/rules.js");
const Audit = require("./ebay-dropship-bot/js/audit.js");
console.log(Audit.run({ title: "Test", description: "Une description assez longue pour passer le test de longueur minimale du moteur, avec suffisamment de mots.", category: "Autre", photoCount: "6" }).score);
'
```

## En cas d'échec

- **Erreur JS dans le web** : rejouez le scénario dans `smoke-test-web.js`
  manuellement (retirez `stdio: "ignore"` du `spawn` pour voir les logs du
  serveur, ou ouvrez `http://127.0.0.1:8934` vous-même pendant que le script
  tourne — augmentez le `waitForTimeout` si besoin).
- **`data.toJSON()` échoue pour une commande Discord** : presque toujours une
  erreur de structure `SlashCommandBuilder` (option requise après une
  optionnelle, choix invalide, nom d'option avec majuscule/espace — Discord
  exige des noms d'option en minuscules sans espace).
- **`execute()` échoue** : le mock ne fournit que `options.getString/Integer/
  Number/Boolean` et `reply/followUp` — si une commande utilise une autre
  méthode de l'API discord.js (`deferReply`, `showModal`...), étendez
  `discord-mock.js` en conséquence plutôt que de contourner le test.
