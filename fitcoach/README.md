# 📱 FitCoach

Application mobile personnelle de suivi **nutrition + musculation + composition corporelle**, avec calcul automatique des macros et bilan hebdomadaire. Interface en français, dark mode, accent orange (#E85D04) / navy (#0B2545).

Construite selon la spec produit fournie (FitCoach — §1 à §8).

---

## Stack

| Domaine | Choix |
|---|---|
| Framework | Expo (React Native) + TypeScript + `expo-router` (5 tabs) |
| Storage | SQLite (`expo-sqlite`, API async) |
| State | Zustand |
| Charts | `react-native-gifted-charts` |
| Notifications | `expo-notifications` |
| Fuzzy search | `fuse.js` |
| Backend proxy | Cloudflare Worker (clé API Claude côté serveur) |
| Build | EAS Build (APK Android + IPA / build simulateur iOS) |

> Le styling utilise des styles inline centralisés autour d'une palette unique
> (`src/constants/theme.ts`). NativeWind était recommandé dans la spec mais
> introduit une incompatibilité babel avec le SDK 51 ; la palette centralisée
> donne le même résultat sans fragiliser le build.

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
npm test           # 31 tests (macros, bilan hebdo, parsing quick-add)
npm run typecheck  # tsc --noEmit, 0 erreur
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

> ⚠️ **Icône App Store** : les `assets/*.png` sont des placeholders 1×1. Pour un
> build iOS de production, remplace `assets/icon.png` par une image **1024×1024
> sans canal alpha** (exigence Apple), sinon la soumission App Store est refusée.

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
npx wrangler secret put ANTHROPIC_API_KEY   # colle ta clé
npx wrangler deploy
```

Puis copie l'URL générée dans `app.json` → `expo.extra.claudeProxyUrl`.
Tant que ce n'est pas configuré, l'app fonctionne avec les niveaux 1 et 2.

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

## Notes / TODO v2

- Les icônes/splash (`assets/*.png`) sont des placeholders 1×1 à remplacer
  (iOS App Store exige une icône 1024×1024 sans alpha).
- La détection « semaine 1-3 de créatine » est simplifiée (retourne toujours S1) ;
  stocker la date de début du programme dans la table `meta` pour l'affiner.
- Bonus spec non implémentés : scan code-barres, watch companion, mode « cuisine ».
