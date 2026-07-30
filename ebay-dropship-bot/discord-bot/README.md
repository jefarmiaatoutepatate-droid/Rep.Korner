# eBay Dropship Copilot — Bot Discord

Bot Discord qui expose les mêmes outils que la web app (`ebay-dropship-bot/`) directement dans un serveur Discord, via des commandes slash (`/audit`, `/titre`, `/description`, `/marge`, `/niche`, `/guide`, `/aide`). Il réutilise **exactement** le même moteur de règles que la web app (`../js/rules.js`, `audit.js`, `generator.js`, `sourcing.js`) — aucune logique dupliquée, aucune connexion à l'API eBay/AliExpress/Amazon.

## 1. Créer l'application Discord (une seule fois)

1. Allez sur [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**, donnez-lui un nom (ex. "eBay Dropship Copilot").
2. Onglet **Bot** → **Reset Token** → copiez le token (gardez-le secret, ne le partagez jamais, ne le collez jamais dans un message).
3. Toujours dans **Bot**, désactivez les intents privilégiés dont vous n'avez pas besoin (ce bot n'en nécessite aucun : il ne lit pas les messages, il répond uniquement aux commandes slash).
4. Onglet **General Information** → copiez l'**Application ID**.
5. Onglet **OAuth2 → URL Generator** :
   - Scopes : `bot` + `applications.commands`
   - Permissions bot : `Send Messages`, `Embed Links`, `Attach Files`, `Use Slash Commands`
   - Ouvrez l'URL générée et invitez le bot sur votre serveur.

## 2. Configuration locale

```bash
cd ebay-dropship-bot/discord-bot
cp .env.example .env
# éditez .env : DISCORD_TOKEN, DISCORD_CLIENT_ID, et DISCORD_GUILD_ID (ID de votre serveur, clic droit dessus en mode développeur Discord activé) pour un déploiement instantané en dev
npm install
```

## 3. Déployer les commandes slash

```bash
npm run deploy
```
À relancer à chaque fois que vous ajoutez/modifiez une commande. Avec `DISCORD_GUILD_ID` renseigné, les commandes apparaissent instantanément sur ce serveur (recommandé en dev). Sans `DISCORD_GUILD_ID`, elles sont déployées globalement (propagation jusqu'à ~1h, sur tous les serveurs où le bot est invité).

## 4. Lancer le bot

```bash
npm start
```

Le bot doit rester **en cours d'exécution en continu** pour répondre aux commandes. Cette session Claude Code (conteneur cloud éphémère) n'est pas faite pour héberger un process permanent — choisissez un hébergement qui tourne 24/7 :
- Votre propre machine / mini-PC / Raspberry Pi allumé en continu (`pm2 start index.js` pour le garder actif).
- Un petit VPS (OVH, Hetzner...).
- Une plateforme d'hébergement Node (Railway, Render, Fly.io...) : renseignez `DISCORD_TOKEN`/`DISCORD_CLIENT_ID` comme variables d'environnement secrètes sur la plateforme, jamais dans le code.

## Commandes disponibles

| Commande | Description |
|---|---|
| `/audit` | Audite une annonce (titre, description, photos, livraison, retours, GPSR, VeRO) → score /100 + corrections |
| `/titre` | Génère 3 titres optimisés (≤80 caractères) |
| `/description` | Génère titres + description HTML pro, renvoyée en pièce jointe `.html` prête à coller dans eBay |
| `/marge` | Calcule la marge nette réelle après frais eBay |
| `/niche` | Score de viabilité d'une niche produit |
| `/guide` | Résumé d'un sujet de la base de connaissances (politique dropshipping, GPSR, VeRO, TVA/IOSS...) |
| `/aide` | Liste toutes les commandes (réponse visible seulement par vous) |

## Sécurité du token

- Ne commitez jamais `.env` (déjà exclu par `.gitignore`).
- Si le token a été exposé (collé dans un message, un commit, une capture d'écran), régénérez-le immédiatement via **Reset Token** dans le Developer Portal.
- Sur un hébergeur cloud, utilisez toujours son système de variables d'environnement/secrets — jamais un fichier committé.

## Limites (identiques à la web app)

Ce bot ne se connecte à aucune API eBay/AliExpress/Amazon : il n'auto-publie rien, ne récupère aucune donnée en direct (prix concurrents, stock fournisseur réel...). C'est un outil de règles/méthodologie, pas un robot de publication automatique. Voir `../README.md` pour les limites détaillées et la piste d'évolution vers une vraie intégration API eBay.
