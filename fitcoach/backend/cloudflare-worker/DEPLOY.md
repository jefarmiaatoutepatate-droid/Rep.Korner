# 🚀 Déployer le proxy Claude (Coach Léo + estimation macros)

Ce Worker Cloudflare garde ta **clé API Anthropic côté serveur** : elle n'est
**jamais** embarquée dans l'app. C'est lui qui donne son « cerveau » au Coach Léo
(endpoint `/chat`) et qui fait l'estimation des plats maison (endpoint `/estimate`).

> ⏱️ ~5 minutes, gratuit (plan Cloudflare Workers Free : 100 000 requêtes/jour).

---

## Prérequis (une seule fois)

1. Un compte Cloudflare — [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) (gratuit).
2. Une clé API Anthropic — [console.anthropic.com](https://console.anthropic.com) → **API Keys** → *Create Key*.
3. Node.js 18+ installé.

---

## Déploiement — 4 commandes

```bash
cd fitcoach/backend/cloudflare-worker

npm install                          # 1. dépendances (wrangler)
npx wrangler login                   # 2. ouvre le navigateur → autorise ton compte
npx wrangler secret put ANTHROPIC_API_KEY   # 3. colle ta clé (masquée, jamais commitée)
npx wrangler deploy                  # 4. déploie
```

À la fin, wrangler affiche l'URL publique, par ex. :

```
https://fitcoach-claude-proxy.TON-SOUS-DOMAINE.workers.dev
```

---

## Brancher l'app

Copie cette URL dans **`fitcoach/app.json`** :

```jsonc
{
  "expo": {
    "extra": {
      "claudeProxyUrl": "https://fitcoach-claude-proxy.TON-SOUS-DOMAINE.workers.dev"
    }
  }
}
```

Relance `npm start`. Le Coach Léo est maintenant en ligne et peut **ajouter tes
repas au journal**. Tant que l'URL contient `YOUR-WORKER` (placeholder) ou reste
vide, l'app tourne quand même : le coach répond un message d'aide et les macros
utilisent les niveaux 1–2 (cache local + OpenFoodFacts).

---

## Vérifier que ça marche

```bash
# Doit répondre avec des macros estimées
curl -X POST https://fitcoach-claude-proxy.TON-SOUS-DOMAINE.workers.dev/estimate \
  -H "Content-Type: application/json" \
  -d '{"name":"poulet basquaise maison","quantity_g":300}'
```

Réponse attendue : un JSON avec `kcal`, `protein_g`, `carbs_g`, `fat_g`.

---

## Développement local (optionnel)

Pour tester le Worker sans déployer :

```bash
cp .dev.vars.example .dev.vars     # puis mets ta clé dans .dev.vars (git-ignoré)
npx wrangler dev                   # sert le Worker sur http://localhost:8787
```

Pointe temporairement `claudeProxyUrl` sur `http://localhost:8787` (émulateur
Android : `http://10.0.2.2:8787`).

---

## Mettre à jour / faire tourner la clé

- **Nouveau code du Worker** : `npx wrangler deploy` à nouveau.
- **Changer la clé** : `npx wrangler secret put ANTHROPIC_API_KEY` (écrase l'ancienne).
- **Restreindre l'origine** (optionnel) : décommente `ALLOWED_ORIGIN` dans `wrangler.toml`.

---

## Sécurité — à retenir

- ✅ La clé vit **uniquement** dans le secret Cloudflare (`wrangler secret`), côté serveur.
- ❌ Elle n'est **jamais** dans `app.json`, le code de l'app, ni un commit git.
- ✅ `.dev.vars` est git-ignoré (voir `.gitignore`) — ne le commite pas.
- Le Worker ne renvoie que le résultat (macros / réponse du coach), jamais la clé.
