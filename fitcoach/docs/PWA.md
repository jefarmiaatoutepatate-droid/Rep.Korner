# 📲 Installer FitCoach sur ton iPhone — sans PC, sans compte Apple

Cette version fait vivre l'app sur ton écran d'accueil, en plein écran et hors
ligne, **gratuitement**. Deux étapes : tu la mets en ligne une fois depuis ton
ordinateur, puis tu l'installes depuis ton iPhone — et tu n'as plus jamais besoin
du PC.

---

## Étape 1 — Mettre l'app en ligne (une seule fois, ~3 min)

Tu utilises déjà Cloudflare pour le proxy du coach : le même compte suffit, tout
reste gratuit.

```bash
cd fitcoach
npm install
npm run deploy:web
```

Wrangler te demandera de te connecter la première fois, puis affichera l'adresse
de ton app :

```
https://fitcoach.pages.dev
```

> C'est **ton** adresse, privée tant que tu ne la partages pas. Personne ne peut
> tomber dessus par hasard : elle n'est pas référencée et il faut la connaître.

Pour publier une mise à jour plus tard, la même commande suffit.

---

## Étape 2 — Installer sur l'iPhone (~10 secondes, depuis le téléphone)

1. Ouvre l'adresse dans **Safari** (obligatoirement Safari — Chrome sur iOS ne
   propose pas l'installation).
2. Appuie sur le bouton **Partager** (le carré avec la flèche vers le haut).
3. Fais défiler et choisis **« Sur l'écran d'accueil »**.
4. Valide avec **Ajouter**.

L'icône FitCoach apparaît sur ton écran d'accueil. **Lance-la depuis cette icône,
plus jamais depuis Safari** — c'est ce qui déclenche le mode plein écran.

À partir de là : plus besoin de PC, jamais.

---

## Ce que tu obtiens

| | |
|---|---|
| Icône sur l'écran d'accueil | ✅ |
| Plein écran, sans interface Safari | ✅ |
| Fonctionne hors ligne (avion, métro) | ✅ |
| Dans le sélecteur d'apps | ✅ |
| Coût | **0 €** |

**Vérifié en conditions réelles** (Chromium automatisé) : création de compte,
calcul des cibles, persistance après rechargement, et fonctionnement complet
**réseau coupé**.

---

## Les limites, honnêtement

**🔔 Notifications** — iOS les bride fortement pour les apps installées ainsi. Les
rappels de pesée (lundi/jeudi) et la notification du bilan dominical ne seront pas
fiables. Ouvre l'app pour consulter ton bilan.

**💾 Tes données** — elles vivent dans le stockage du navigateur, sur ton iPhone.
C'est durable, mais **iOS peut purger ce stockage** si l'espace disque devient
critique ou si l'app reste inutilisée très longtemps.
→ Pour supprimer ce risque, active la synchronisation Supabase (voir le README,
section « Activer la sync cloud ») : tes données sont alors aussi dans le cloud,
et l'app reste installée pareil.

**🏪 Pas dans l'App Store** — l'app s'installe par le lien. Sans importance pour un
usage personnel ; s'il te faut une présence sur l'App Store, c'est le programme
Apple Developer (99 €/an) et `eas build`.

---

## Le coach

Le coach a besoin du proxy Cloudflare, comme en natif. S'il n'est pas encore
déployé, suis [`backend/cloudflare-worker/DEPLOY.md`](../backend/cloudflare-worker/DEPLOY.md)
et renseigne l'URL dans `app.json` → `expo.extra.claudeProxyUrl`, **avant** de
lancer `npm run deploy:web` (la valeur est intégrée au build).

Le Worker autorise déjà les appels depuis un navigateur (CORS). Pour restreindre
l'accès à ta seule app, décommente `ALLOWED_ORIGIN` dans `wrangler.toml` et mets-y
l'adresse de ta page.

---

## Comment ça marche techniquement

La difficulté était la base de données : `expo-sqlite` n'existe pas dans un
navigateur. La couche base est donc scindée par plateforme —
`src/db/driver.ts` (natif, expo-sqlite) et `src/db/driver.web.ts` (web,
**sql.js** : SQLite compilé en WebAssembly). Le SQL des repositories tourne à
l'identique des deux côtés, sans réécriture, et la base est persistée dans
IndexedDB.

Même principe pour la session : `expo-secure-store` en natif,
`localStorage` en web (`src/lib/sessionStorage*.ts`).

**Le code natif est intact** : les builds iOS et Android continuent de fonctionner
exactement comme avant. Tu peux passer à une vraie app native plus tard sans rien
perdre.
