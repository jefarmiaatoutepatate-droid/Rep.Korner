# Fiches stores — FitCoach

Textes prêts à coller dans App Store Connect et Google Play Console, plus les
**déclarations de confidentialité** à remplir (c'est le point qui bloque le plus
souvent une première soumission).

---

## 1. Identité

| Champ | Valeur |
|---|---|
| Nom | **FitCoach** |
| Sous-titre (iOS, 30 car. max) | `Nutrition, muscu & coach IA` (28) |
| Titre court (Play, 30 car. max) | `FitCoach — Nutrition & Muscu` (28) |
| Catégorie principale | Forme et santé |
| Catégorie secondaire | Mode de vie |
| Classification d'âge | 12+ / PEGI 3 — *conseils de santé et de remise en forme* |
| Bundle ID / Package | `com.fitcoach.app` |

> ⚠️ **Vérifie que le nom « FitCoach » est disponible** sur les deux stores avant de
> lancer la production des visuels : plusieurs applications portent des noms proches.
> Si c'est pris, un nom distinctif (ex. « FitCoach Léo ») évite un refus pour
> similarité de marque.

---

## 2. Description courte (Google Play — 80 caractères max)

```
Suivi nutrition et musculation, calcul des calories et coach sportif IA.
```
(71 caractères)

---

## 3. Description longue

```
FitCoach réunit dans une seule application ton suivi nutritionnel, ton programme de
musculation et l'évolution de ta composition corporelle — avec un coach virtuel qui
répond à tes questions et enregistre tes repas pour toi.

━━━━━━━━━━━━━━━━━━━━━━

🎯 DES CALORIES CALCULÉES POUR TOI
À l'inscription, tu renseignes ton sexe, ton âge, ta taille, ton poids, ton objectif
et ton nombre de séances par semaine. FitCoach en déduit tes besoins réels
(métabolisme de base Mifflin-St Jeor, dépense totale, ajustement selon ton objectif)
et te donne des cibles précises en calories, protéines, glucides, lipides et eau.
Ton profil évolue ? Les cibles se recalculent.

🧑‍🏫 UN VRAI COACH, PAS UN SIMPLE CHATBOT
Coach Léo t'accueille par ton prénom et connaît ton suivi : tes cibles, ce que tu as
déjà mangé aujourd'hui, ton poids, ta prochaine séance. Pose-lui n'importe quelle
question sur la nutrition ou l'entraînement, demande-lui un repas riche en protéines
ou des conseils techniques sur le squat.
Et surtout : il AGIT. Dis-lui « j'ai mangé un poulet basquaise, 300 g » et il calcule
les macros, l'ajoute à ton journal et te dit ce qu'il te reste pour la journée.

🍽️ UN JOURNAL ALIMENTAIRE QUI VA VITE
• Recherche instantanée dans un cache local d'aliments
• Base OpenFoodFacts pour les produits du commerce
• Estimation intelligente pour les plats maison introuvables
• Ajout rapide en langage naturel : « 180g poulet + 100g riz + brocolis »
• Suivi par repas : petit-déjeuner, déjeuner, collation, dîner, post-training

🏋️ TON PROGRAMME, SÉRIE PAR SÉRIE
Un programme Upper/Lower sur 4 jours est intégré. Pendant la séance, note tes charges
et tes répétitions, vois ta performance précédente pour te dépasser, et laisse le
minuteur de repos gérer les temps entre les séries.

📈 TA PROGRESSION, SANS TRICHER
Courbes de poids et de charges sur tes exercices clés, mensurations, photos avant/après.

📊 UN BILAN HEBDOMADAIRE AUTOMATIQUE
Chaque dimanche, FitCoach analyse ta semaine : moyennes caloriques, régularité des
protéines, séances effectuées, volume total, records battus et variation de poids.
Il en tire une recommandation concrète d'ajustement calorique. Exportable en PDF.

━━━━━━━━━━━━━━━━━━━━━━

🔒 TES DONNÉES T'APPARTIENNENT
Ton suivi est stocké sur ton téléphone. Pas de publicité, pas de traqueur, aucune
revente de données. Tu peux supprimer ton compte et l'intégralité de tes données en
deux touches.

Interface entièrement en français.

━━━━━━━━━━━━━━━━━━━━━━

FitCoach est un outil de suivi personnel et ne fournit pas d'avis médical. Consulte un
professionnel de santé avant tout changement significatif d'alimentation ou
d'entraînement.
```

---

## 4. Mots-clés (App Store — 100 caractères max, séparés par des virgules)

```
nutrition,musculation,calories,macros,proteine,muscu,fitness,poids,coach,seche,prise de masse
```
(92 caractères)

> Ne répète pas le nom de l'app ni la catégorie : Apple les indexe déjà.

---

## 5. Nouveautés (première version)

```
Première version de FitCoach 🎉

• Calcul de tes besoins caloriques personnalisés
• Coach virtuel qui répond et enregistre tes repas
• Journal alimentaire avec recherche et ajout rapide
• Programme Upper/Lower avec suivi des séries et minuteur de repos
• Courbes de progression et mensurations
• Bilan hebdomadaire automatique avec recommandation
```

---

## 6. Captures d'écran — à produire

Formats requis (au minimum) :

| Store | Format | Nombre |
|---|---|---|
| App Store | iPhone 6,7" — **1290 × 2796 px** | 3 à 10 |
| App Store | iPhone 6,5" — **1242 × 2688 px** | 3 à 10 |
| Google Play | Téléphone — min. 1080 px de large | 2 à 8 |
| Google Play | **Bandeau** — 1024 × 500 px | 1 (obligatoire) |
| Google Play | Icône — 512 × 512 px | 1 |

Ordre recommandé (les 3 premières comptent le plus, elles sont visibles sans scroll) :
1. **Coach Léo** en train d'ajouter un repas → c'est le vrai différenciateur
2. **Home** — anneau calorique et macros du jour
3. **Étape profil de l'inscription** — « tes cibles calculées »
4. Séance en cours avec le minuteur de repos
5. Progression — courbes
6. Bilan hebdomadaire

Pour les produire : lance l'app (`npm start`), ouvre-la sur un simulateur iPhone
6,7" et fais les captures depuis le simulateur (elles sont automatiquement à la
bonne résolution).

---

## 7. Déclarations de confidentialité (le point qui fait recaler)

### 7.1 App Store — « App Privacy »

Déclare les types de données suivants. Pour **chacun**, coche :
« Utilisée pour la fonctionnalité de l'app » · **liée à l'identité de l'utilisateur** ·
**PAS utilisée pour le suivi publicitaire** (*tracking*).

| Type de données | Détail |
|---|---|
| Coordonnées | Nom, adresse e-mail |
| Santé et forme | Données de forme (poids, mensurations, activité) |
| Contenu utilisateur | Photos, autres contenus (messages au coach) |
| Identifiants | Identifiant de compte |

- **« Suivi » (App Tracking Transparency)** : réponds **NON**. L'app ne fait aucun
  suivi publicitaire → pas besoin du framework ATT.
- **Chiffrement** : déjà déclaré dans `app.json`
  (`ITSAppUsesNonExemptEncryption: false`) — rien à faire.

### 7.2 Google Play — « Sécurité des données »

| Question | Réponse |
|---|---|
| Les données sont-elles chiffrées en transit ? | **Oui** (HTTPS) |
| L'utilisateur peut-il demander la suppression ? | **Oui** — Réglages → Supprimer mon compte |
| Données partagées avec des tiers ? | **Oui**, limité : nom du plat envoyé à OpenFoodFacts ; message et contexte de suivi envoyés à Anthropic pour le coach |
| Collecte pour la publicité ? | **Non** |

Catégories à déclarer : *Informations personnelles* (nom, e-mail), *Santé et forme*,
*Photos*, *Messages*.

> ⚠️ Google Play exige en plus un **formulaire de suppression de compte accessible
> depuis le web** (pas seulement dans l'app) pour toute app avec création de compte.
> Prévois une page simple avec ton e-mail de contact et la procédure.

---

## 8. Checklist avant soumission

- [ ] Proxy Claude déployé et URL renseignée dans `app.json` (`expo.extra.claudeProxyUrl`)
- [ ] Politique de confidentialité **hébergée sur une URL publique** (voir `docs/PRIVACY.md`)
- [ ] Champs `[À COMPLÉTER]` de la politique remplis (éditeur, contact, date)
- [ ] Nom « FitCoach » vérifié comme disponible sur les deux stores
- [ ] Captures d'écran produites aux bons formats
- [ ] Bandeau 1024 × 500 px (Google Play)
- [ ] Compte Apple Developer actif (99 $/an)
- [ ] Compte Google Play Developer actif (25 $, paiement unique)
- [ ] `eas build -p ios --profile production` puis `eas submit -p ios`
- [ ] `eas build -p android --profile production` puis `eas submit -p android`
- [ ] Application testée sur un appareil réel

> 💡 **Héberger la politique de confidentialité gratuitement** : crée un dépôt public
> sur GitHub, active GitHub Pages, et dépose `PRIVACY.md`. L'URL obtenue est
> acceptée par les deux stores.
