# 📱 FitCoach

Application mobile personnelle de suivi **nutrition + musculation + composition corporelle**, avec calcul automatique des macros et bilan hebdomadaire. Interface en français.

**Direction visuelle « Nocturne » — sobre & classe** : fond bleu encre (`#0A1120`), un accent périwinkle unique (`#7C93FF`), surfaces claires (`#F4F6FC`) mises en avant avec parcimonie, macros désaturées, icônes en trait fin (SVG), bottom-nav flottante. Palette harmonisée dans `src/constants/theme.ts`.

Construite selon la spec produit fournie (FitCoach — §1 à §8).

---

## Stack

| Domaine | Choix |
|---|---|
| Framework | Expo (React Native) + TypeScript + `expo-router` (5 tabs) |
| Storage | SQLite (`expo-sqlite`, API async) |
| State | Zustand |
| Auth | Comptes locaux (`expo-crypto` hash + sel, session `expo-secure-store`), cloud-ready Supabase |
| Charts | `react-native-gifted-charts` |
| Dégradés | `expo-linear-gradient` (fonds, avatar) |
| Icônes | `react-native-svg` (jeu d'icônes en trait, `components/Icon.tsx`) |
| Notifications | `expo-notifications` |
| Fuzzy search | `fuse.js` |
| Backend proxy | Cloudflare Worker (clé API Claude côté serveur) |
| Build | EAS Build (APK Android + IPA / build simulateur iOS) |

> Le styling utilise des styles inline centralisés autour d'une palette unique
> (`src/constants/theme.ts`) et de composants réutilisables (`components/ui.tsx` :
> `Card`, `Button`, `Thumb`, `StatTile`, `GradientBg`…). NativeWind était recommandé
> dans la spec mais introduit une incompatibilité babel avec le SDK 51 ; la palette
> centralisée donne le même résultat sans fragiliser le build.

---

## Structure

```
fitcoach/
├── app/                      # écrans (expo-router)
│   ├── _layout.tsx           # racine : init DB + notifications
│   ├── (tabs)/
│   │   ├── _layout.tsx       # bottom nav 5 onglets
│   │   ├── index.tsx         # 🏠 Home — dashboard du jour
│   │   ├── nutrition.tsx     # 🍽️ recherche + ajout aliments + quick-add
│   │   ├── entrainement.tsx  # 💪 liste des 4 séances
│   │   ├── progression.tsx   # 📈 courbes poids / charges + mensurations
│   │   └── bilan.tsx         # 📊 bilan hebdo + export PDF
│   └── workout/[id].tsx      # logging d'une séance (sets, timer repos)
├── src/
│   ├── constants/            # profil, cibles, programme (§1/§7), thème
│   ├── db/                   # schéma (§5), seed, repositories
│   ├── lib/                  # LOGIQUE PURE (macros, bilan, parse, dates) + services
│   ├── store/                # Zustand
│   ├── components/           # ProgressRing, MacroBar, ui
│   └── types/
├── backend/cloudflare-worker # proxy API Claude (niveau 3, §4)
└── __tests__/                # tests unitaires (macros, bilan, parse)
```

Séparation logique / UI : tout le calcul métier vit dans `src/lib/*` sans
dépendance Expo/RN, ce qui le rend testable en Node.

---

## Démarrer

```bash
cd fitcoach
npm install
npm start          # puis 'a' pour Android, ou scanner le QR avec Expo Go
```

### Tests & qualité

```bash
npm test           # 47 tests (macros, calcul calorique, bilan hebdo, parsing, validation)
npm run typecheck  # tsc --noEmit, 0 erreur
npm run lint       # eslint (config Expo), 0 problème
```

### Build (EAS) — Android & iOS

L'app est cross-platform (Expo). Le même code tourne sur les deux OS.

```bash
npm i -g eas-cli
eas login

# Android — APK installable directement
eas build -p android --profile preview

# iOS — build pour SIMULATEUR (aucun compte Apple Developer requis)
eas build -p ios --profile preview
#   → télécharge le .app, glisse-le sur un simulateur iOS (macOS)

# iOS — build pour un vrai iPhone / TestFlight (compte Apple Developer requis)
eas build -p ios --profile preview-device   # ou --profile production
```

**Développement rapide sur iPhone sans builder** : `npm start` puis scanne le QR
avec l'app **Expo Go** (iOS). Toutes les fonctionnalités marchent sauf celles qui
exigent un dev build ; ici tout (SQLite, notifications locales, image-picker,
charts) fonctionne dans Expo Go.

> ✅ **Icônes prêtes pour les stores** : `assets/icon.png` est en **1024×1024 sans
> canal alpha** (exigence Apple), `adaptive-icon.png` est le calque avant Android
> (marque dans la zone sûre, fond `#5B6EF5` défini dans `app.json`), `splash.png`
> se compose sur le fond blanc. Marque « haltère » aux couleurs du thème, générée
> par `scripts/gen-icons.py` (relançable si la charte évolue).

---

## Comptes & synchronisation

À l'installation, l'utilisateur **crée un compte en 2 étapes** :

1. **Identifiants** : prénom + e-mail + mot de passe.
2. **Profil** : sexe, âge, taille, poids actuel, poids cible, objectif (perdre / maintenir /
   prendre du muscle) et **nombre de séances/semaine**. Les **besoins caloriques sont
   calculés en direct** (aperçu affiché avant validation).

Il peut ensuite se **connecter / se déconnecter**, **modifier son profil** (Réglages →
les cibles se recalculent) et **supprimer son compte** (exigence App Store).
La session est persistée (`expo-secure-store`) — l'app rouvre directement connectée.

### Cibles caloriques personnalisées (`src/lib/nutritionCalc.ts`, testé)

Le calcul est **pur et couvert par des tests** :

- **BMR** — équation de Mifflin-St Jeor (selon sexe, poids, taille, âge).
- **TDEE** — BMR × facteur d'activité **déduit du nombre de séances/semaine**
  (0 ≈ 1,2 sédentaire → 7+ ≈ 1,9).
- **Objectif** — ajustement kcal : déficit (−450), maintien (0) ou surplus (+350).
- **Macros** — protéines & lipides indexés sur le poids (2,0 g/kg protéines en sèche,
  sinon 1,8) ; glucides = reste de l'énergie ; eau ≈ 35 ml/kg. Plancher de sécurité.

Chaque compte stocke **son profil et ses cibles** (colonnes de la table `users`,
migration auto pour les bases existantes). Tout l'app (Home, Nutrition, bilan hebdo,
Coach Léo) utilise les cibles du compte connecté — repli sur des valeurs par défaut
pour les comptes créés avant l'onboarding.

- Toutes les données (repas, séances, séries, mensurations, logs, bilans) sont
  **rattachées au compte** (`user_id`) : chaque utilisateur a son propre suivi.
- **Mode par défaut : comptes locaux** (mots de passe hachés SHA-256 + sel sur
  l'appareil). Fonctionne hors-ligne, sans backend.
- **Écrans** : `app/(auth)/login.tsx`, `app/(auth)/signup.tsx` (2 étapes, formulaire
  profil réutilisable `components/ProfileForm.tsx`), `app/profile-edit.tsx` (édition du
  profil), gate dans `app/_layout.tsx` (redirige vers login si non connecté),
  `app/settings.tsx` (profil + cibles, déconnexion + suppression de compte).

### Activer la sync cloud (Supabase) — pour la publication stores

Pour que le compte et les données suivent l'utilisateur d'un téléphone à l'autre :

1. Crée un projet sur [supabase.com](https://supabase.com) (tier gratuit).
2. Colle `backend/supabase/schema.sql` dans l'éditeur SQL (tables + RLS par
   utilisateur via `auth.uid()`).
3. Renseigne `expo.extra.supabaseUrl` et `expo.extra.supabaseAnonKey` dans
   `app.json` (la clé *anon* est publique, elle peut être embarquée).
4. `npm i @supabase/supabase-js` puis branche le provider cloud sur le store
   d'auth (le point d'extension est prêt : `src/lib/cloudConfig.ts` détecte la
   config, `users.remote_id` relie le compte local au compte Supabase).

Tant que ces valeurs sont vides, l'app reste en comptes locaux — aucune régression.

---

## Coach virtuel (Coach Léo) 🧑‍🏫

Un onglet dédié : un vrai coach conversationnel propulsé par Claude. Il t'accueille
par ton prénom (« Bonjour {prénom} 👋 »), **pose et répond à toutes les questions**
nutrition & musculation, et calcule concrètement (kcal + macros).

- **Ses « skills » sont gravés** dans le system prompt du Worker (`backend/cloudflare-worker`) :
  méthodo nutrition + références CIQUAL, le programme d'entraînement exact (les 4 séances
  avec séries/reps/repos), les repères techniques des 4 mouvements clés, et les règles
  d'ajustement calorique. Connaissances stables, côté serveur, jamais exposées.
- **Contexte perso en direct** : l'app lui envoie tes cibles, tes macros du jour (+ le
  restant), ton poids et ta prochaine séance (`src/lib/coach.ts` → `buildCoachContext`),
  pour des réponses personnalisées.
- **Il agit, il ne fait pas que parler** 🎯 : quand tu confirmes « oui j'ai mangé tel plat »
  et que tu lui demandes de l'ajouter, le coach **l'inscrit dans ton journal du jour** et
  décompte tes quotas. Techniquement, Claude appelle l'outil `log_meal` ; l'app résout
  chaque aliment (cache → OpenFoodFacts → estimation Claude), calcule les macros, écrit
  l'entrée, puis renvoie au coach le récap + le restant (`src/lib/coach.ts` →
  `executeLogMeal`, boucle d'outil dans `askCoach`). Home et Nutrition se rafraîchissent
  automatiquement.
- **Conversation par compte**, persistée en SQLite (`coach_messages`), effaçable.
- Modèle : `claude-opus-4-8` (endpoint `/chat` du Worker). Tant que le proxy n'est pas
  configuré, le coach répond un message d'aide (pas de crash).

Écran : `app/(tabs)/coach.tsx`. Sécurité : le coach n'est pas médecin (renvoie vers un
professionnel de santé), et ne propose ni régime extrême ni dopage.

---

## Calcul des macros (3 niveaux, §4)

1. **Cache local** SQLite + fuzzy (`fuse.js`) → instantané.
2. **OpenFoodFacts** (base FR) → 3 meilleurs matchs pour 100 g, sauvegardés au cache.
3. **Fallback Claude** via le Worker proxy → plats maison / aliments introuvables.

### Backend proxy (obligatoire pour le niveau 3)

La clé API Claude ne doit **jamais** être embarquée dans l'app.

```bash
cd backend/cloudflare-worker
npm install
npx wrangler login                          # autorise ton compte Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # colle ta clé (côté serveur, jamais commitée)
npx wrangler deploy
```

Puis copie l'URL générée dans `app.json` → `expo.extra.claudeProxyUrl`.
Tant que ce n'est pas configuré, l'app fonctionne avec les niveaux 1 et 2.

> 📖 **Guide pas-à-pas clé en main** (prérequis, vérification `curl`, dev local,
> rotation de clé, sécurité) : [`backend/cloudflare-worker/DEPLOY.md`](backend/cloudflare-worker/DEPLOY.md).
> Le même Worker alimente aussi le Coach Léo (endpoint `/chat`).

---

## Bilan hebdomadaire (§8)

- Notification automatique **dimanche 20h** (+ rappels pesée lundi/jeudi 7h30).
- Moyennes kcal/macros, séances effectuées/prévues, Δ poids, records sur les 4 exos clés.
- **Recommandation d'ajustement calorique** automatique (règles dans
  `src/lib/weeklyReport.ts`, couvertes par les tests).
- Export PDF partageable par mail.

---

## Données pré-chargées

- Profil & cibles : `src/constants/profile.ts` (2450 kcal, 160 P / 290 G / 70 L, 3 L d'eau).
- Programme Upper/Lower 4 jours : `src/constants/program.ts`.
- Aliments de base (réf. CIQUAL arrondies) seedés au 1er lancement : `src/db/seedFoods.ts`.

---

## Publication sur les stores

- **[`docs/PRIVACY.md`](docs/PRIVACY.md)** — politique de confidentialité, rédigée
  d'après le traitement réel des données (local par défaut ; OpenFoodFacts et
  Anthropic pour le coach). ⚠️ Trois champs `[À COMPLÉTER]` (éditeur, contact, date)
  et **elle doit être hébergée sur une URL publique** : les deux stores l'exigent.
- **[`docs/STORE.md`](docs/STORE.md)** — textes de fiche prêts à coller (descriptions,
  mots-clés, nouveautés), formats de captures, **déclarations de confidentialité**
  App Store / Google Play et checklist de soumission.

## Notes / TODO v2

- La détection « semaine 1-3 de créatine » est simplifiée (retourne toujours S1) ;
  stocker la date de début du programme dans la table `meta` pour l'affiner.
- Bonus spec non implémentés : scan code-barres, watch companion, mode « cuisine ».
