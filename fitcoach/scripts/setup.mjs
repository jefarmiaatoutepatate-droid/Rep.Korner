#!/usr/bin/env node
/**
 * Installation guidée de FitCoach : déploie le proxy du coach, puis publie la
 * version PWA sur Cloudflare Pages.
 *
 *   npm run setup
 *
 * Fonctionne sur Windows, macOS et Linux. Le script ne stocke ni n'affiche
 * jamais ta clé API : elle est saisie directement dans wrangler, qui l'envoie
 * chiffrée à Cloudflare.
 */
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_DIR = join(ROOT, 'backend', 'cloudflare-worker');
const APP_JSON = join(ROOT, 'app.json');

const c = {
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  accent: (s) => `\x1b[36m${s}\x1b[0m`,
};

// Ce script est un assistant : il pose des questions et relaie des outils qui
// ouvrent un navigateur. Il lui faut donc un vrai terminal.
if (!input.isTTY) {
  console.error(
    '\n\x1b[31m✗ `npm run setup` doit être lancé dans un terminal interactif.\x1b[0m\n' +
      '  Ouvre un terminal (PowerShell, Terminal, iTerm…) et relance la commande.\n' +
      '  Sinon, suis le guide pas-à-pas : docs/PWA.md\n',
  );
  process.exit(1);
}

const rl = createInterface({ input, output });

// Si l'entrée est fermée (Ctrl+D, exécution non interactive), on arrête proprement
// au lieu de rester bloqué ou de sortir sans rien dire.
let closed = false;
rl.on('close', () => { closed = true; });

async function ask(q) {
  if (closed) throw new Error('Entrée interrompue — installation annulée.');
  return Promise.race([
    rl.question(q),
    new Promise((_, reject) =>
      rl.once('close', () => reject(new Error('Entrée interrompue — installation annulée.'))),
    ),
  ]);
}

const yes = async (q) => /^(o|oui|y|yes)?$/i.test((await ask(`${q} ${c.dim('[O/n]')} `)).trim());

/** Lance une commande en laissant l'utilisateur interagir (login navigateur, saisie…). */
function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  return r.status === 0;
}

function title(step, total, text) {
  console.log(`\n${c.accent(`━━━ Étape ${step}/${total} ━━━`)} ${c.b(text)}\n`);
}

async function main() {
  console.log(`\n${c.b('🏋️  Installation de FitCoach')}\n`);
  console.log('Ce script va :');
  console.log('  1. déployer le proxy qui alimente Coach Léo (optionnel)');
  console.log('  2. publier la version installable sur ton iPhone');
  console.log(c.dim('\nTout est gratuit. Tu auras besoin d\'un compte Cloudflare.\n'));

  if (!(await yes('On y va ?'))) {
    console.log('\nAnnulé. Relance avec `npm run setup` quand tu veux.\n');
    return rl.close();
  }

  // ---------- Étape 1 : le proxy du coach ----------
  title(1, 3, 'Le coach (proxy Claude)');
  console.log('Coach Léo a besoin d\'un petit serveur relais qui garde ta clé API');
  console.log('Anthropic côté serveur (jamais dans l\'app).');
  console.log(c.dim('Tu peux passer cette étape : l\'app marchera, mais sans le coach.\n'));

  let proxyUrl = null;
  if (await yes('Déployer le proxy du coach maintenant ?')) {
    if (!existsSync(WORKER_DIR)) {
      console.log(c.err('\n✗ Dossier du Worker introuvable.'));
    } else {
      console.log(c.dim('\n→ Installation des dépendances du Worker…\n'));
      run('npm', ['install'], WORKER_DIR);

      console.log(c.dim('\n→ Connexion à Cloudflare (une page va s\'ouvrir dans ton navigateur)…\n'));
      run('npx', ['wrangler', 'login'], WORKER_DIR);

      console.log(`\n${c.b('Ta clé API Anthropic')} ${c.dim('(console.anthropic.com → API Keys)')}`);
      console.log(c.dim('Elle sera demandée par wrangler et envoyée chiffrée à Cloudflare.\n'));
      run('npx', ['wrangler', 'secret', 'put', 'ANTHROPIC_API_KEY'], WORKER_DIR);

      console.log(c.dim('\n→ Déploiement du Worker…\n'));
      run('npx', ['wrangler', 'deploy'], WORKER_DIR);

      console.log(`\n${c.warn('↑ Repère l\'adresse affichée ci-dessus')} ${c.dim('(https://….workers.dev)')}`);
      const url = (await ask('\nColle-la ici (ou Entrée pour passer) : ')).trim();
      if (url.startsWith('http')) proxyUrl = url.replace(/\/+$/, '');
    }
  }

  // ---------- Étape 2 : brancher l'app sur le proxy ----------
  title(2, 3, 'Configuration');
  const app = JSON.parse(readFileSync(APP_JSON, 'utf8'));
  app.expo.extra ??= {};

  if (proxyUrl) {
    app.expo.extra.claudeProxyUrl = proxyUrl;
    writeFileSync(APP_JSON, JSON.stringify(app, null, 2) + '\n');
    console.log(c.ok(`✓ Coach branché sur ${proxyUrl}`));
  } else {
    const current = app.expo.extra.claudeProxyUrl ?? '';
    if (!current || current.includes('YOUR-WORKER')) {
      console.log(c.warn('⚠ Proxy non configuré : le coach affichera un message d\'aide.'));
      console.log(c.dim('  Tout le reste (journal, séances, bilan) fonctionne normalement.'));
      console.log(c.dim('  Tu pourras relancer `npm run setup` plus tard.'));
    } else {
      console.log(c.ok(`✓ Proxy déjà configuré : ${current}`));
    }
  }

  // ---------- Étape 3 : publier la PWA ----------
  title(3, 3, 'Publication de l\'app');

  if (!(await yes('Publier l\'app sur Cloudflare Pages (gratuit) ?'))) {
    console.log('\nOK. Tu pourras le faire avec `npm run deploy:web`.\n');
    return rl.close();
  }

  console.log(c.dim('\n→ Compilation de la version web…\n'));
  if (!run('npx', ['expo', 'export', '--platform', 'web'], ROOT)) {
    console.log(c.err('\n✗ La compilation a échoué. Copie l\'erreur ci-dessus pour la faire analyser.\n'));
    return rl.close();
  }

  console.log(c.dim('\n→ Publication…\n'));
  console.log(c.dim('  (si un projet est demandé, choisis « Create a new project » et garde le nom fitcoach)\n'));
  const ok = run('npx', ['wrangler', 'pages', 'deploy', 'dist', '--project-name=fitcoach'], ROOT);

  if (!ok) {
    console.log(c.err('\n✗ La publication a échoué. Vérifie que tu es connecté (npx wrangler login).\n'));
    return rl.close();
  }

  // ---------- Fin ----------
  console.log(`\n${c.ok('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}`);
  console.log(c.b('  ✓ FitCoach est en ligne'));
  console.log(`${c.ok('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`);
  console.log(`${c.b('Sur ton iPhone :')}\n`);
  console.log(`  1. Ouvre l'adresse ci-dessus dans ${c.b('Safari')} ${c.dim('(pas Chrome)')}`);
  console.log(`  2. Bouton ${c.b('Partager')} ${c.dim('(carré avec une flèche vers le haut)')}`);
  console.log(`  3. ${c.b('« Sur l\'écran d\'accueil »')} → Ajouter\n`);
  console.log(c.dim('  Lance ensuite l\'app depuis son icône : elle s\'ouvre en plein écran,'));
  console.log(c.dim('  fonctionne hors ligne, et ton PC n\'est plus nécessaire.\n'));
  console.log(c.dim('  Mise à jour plus tard : npm run deploy:web\n'));

  rl.close();
}

main().catch((e) => {
  console.error(c.err(`\n✗ ${e.message}\n`));
  rl.close();
  process.exit(1);
});
