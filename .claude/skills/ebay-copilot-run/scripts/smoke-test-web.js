/* ==========================================================================
   smoke-test-web.js — Sert ebay-dropship-bot/ en local, ouvre chaque onglet
   dans un navigateur headless et vérifie l'absence d'erreurs JS.

   Usage :
     NODE_PATH=/opt/node22/lib/node_modules node .claude/skills/ebay-copilot-run/scripts/smoke-test-web.js

   Sur cet environnement Claude Code, Chromium est préinstallé sous
   /opt/pw-browsers et le module playwright est disponible globalement via
   /opt/node22/lib/node_modules (d'où le NODE_PATH ci-dessus). Sur une autre
   machine : `npm install playwright` dans un dossier temporaire puis retirez
   `executablePath` pour laisser Playwright télécharger son propre Chromium.
   ========================================================================== */

const path = require("path");
const { spawn } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const APP_DIR = path.join(REPO_ROOT, "ebay-dropship-bot");
const PORT = process.env.SMOKE_TEST_PORT || 8934;
const CHROMIUM_PATH = "/opt/pw-browsers/chromium";

function waitForServer(url, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryFetch = () => {
      require("http").get(url, (res) => { res.resume(); resolve(); })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) reject(new Error("Le serveur local n'a pas démarré à temps"));
          else setTimeout(tryFetch, 150);
        });
    };
    tryFetch();
  });
}

async function main() {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (e) {
    console.error("Module 'playwright' introuvable. Sur cet environnement : lancez avec NODE_PATH=/opt/node22/lib/node_modules. Ailleurs : npm install playwright.");
    process.exit(1);
  }

  const server = spawn("python3", ["-m", "http.server", String(PORT)], { cwd: APP_DIR, stdio: "ignore" });
  const baseUrl = `http://127.0.0.1:${PORT}`;

  let exitCode = 0;
  try {
    await waitForServer(`${baseUrl}/index.html`, 5000);

    const launchOpts = require("fs").existsSync(CHROMIUM_PATH) ? { executablePath: CHROMIUM_PATH } : {};
    const browser = await chromium.launch(launchOpts);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(`PAGEERROR: ${e.message}`));
    page.on("console", msg => { if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`); });

    await page.goto(`${baseUrl}/index.html`);
    await page.waitForTimeout(200);
    console.log(`✅ Page chargée (${await page.title()})`);

    // Onglet Audit : cas volontairement fautif pour vérifier que le moteur réagit
    await page.click('button[data-tab="audit"]');
    await page.fill("#a-title", "L@@K SUPER PROMO !!! Titre bien trop long pour être valide sur eBay avec plein de mots inutiles WOW meilleur prix du web");
    await page.fill("#a-description", "Description courte.");
    await page.fill("#a-photos", "1");
    await page.click('#audit-form button[type="submit"]');
    await page.waitForTimeout(200);
    const auditVisible = await page.isVisible("#audit-result");
    console.log(auditVisible ? "✅ Onglet Audit fonctionne" : "❌ Onglet Audit : résultat non affiché");
    if (!auditVisible) exitCode = 1;

    // Onglet Générateur
    await page.click('button[data-tab="generator"]');
    await page.fill("#g-name", "Produit de test");
    await page.click('#gen-form button[type="submit"]');
    await page.waitForTimeout(200);
    const genVisible = await page.isVisible("#gen-result");
    console.log(genVisible ? "✅ Onglet Générateur fonctionne" : "❌ Onglet Générateur : résultat non affiché");
    if (!genVisible) exitCode = 1;

    // Onglet Sourcing
    await page.click('button[data-tab="sourcing"]');
    await page.click('#margin-form button[type="submit"]');
    await page.click('#niche-form button[type="submit"]');
    await page.waitForTimeout(200);
    const marginVisible = await page.isVisible("#margin-result");
    const nicheVisible = await page.isVisible("#niche-result");
    console.log(marginVisible && nicheVisible ? "✅ Onglet Sourcing & Marge fonctionne" : "❌ Onglet Sourcing & Marge : résultat manquant");
    if (!marginVisible || !nicheVisible) exitCode = 1;

    // Onglet Base de connaissances
    await page.click('button[data-tab="knowledge"]');
    const kbItems = await page.locator(".accordion-item").count();
    console.log(kbItems > 0 ? `✅ Base de connaissances : ${kbItems} sujet(s)` : "❌ Base de connaissances vide");
    if (kbItems === 0) exitCode = 1;

    await browser.close();

    if (errors.length) {
      console.log(`❌ ${errors.length} erreur(s) JS détectée(s) :`);
      errors.forEach(e => console.log(`   - ${e}`));
      exitCode = 1;
    } else {
      console.log("✅ Aucune erreur JS/console détectée");
    }
  } catch (e) {
    console.error("Échec du smoke test :", e.message);
    exitCode = 1;
  } finally {
    server.kill();
  }

  process.exit(exitCode);
}

main();
