# 🖱️ Installer FitCoach sans terminal — tout depuis le navigateur

Si les commandes te bloquent (PowerShell, npm, droits Windows…), **tu peux tout
faire depuis un navigateur**. Cloudflare compile l'app sur ses serveurs à ta
place. Zéro ligne de commande.

Deux parties, indépendantes :

- **Partie A** — l'app sur ton iPhone *(~10 min)*
- **Partie B** — Coach Léo *(~5 min, à faire quand tu veux)*

L'app fonctionne sans la partie B : seul le coach affichera un message d'aide.

---

# Partie A — Mettre l'app en ligne

### 1. Crée un compte Cloudflare

[dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) — gratuit.

### 2. Crée le projet

Dans le tableau de bord :

1. Menu de gauche → **Workers & Pages**
2. Bouton **Create** → onglet **Pages** → **Connect to Git**
3. Autorise Cloudflare à accéder à ton GitHub, puis choisis le dépôt **`Rep.Korner`**

### 3. Renseigne ces réglages — exactement

| Champ | Valeur |
|---|---|
| **Production branch** | `claude/fitcoach-mobile-app-69170k` |
| **Framework preset** | `None` |
| **Build command** | `npm install && npx expo export --platform web` |
| **Build output directory** | `dist` |
| **Root directory** *(section « Advanced »)* | `fitcoach` |

> ⚠️ **`Root directory` = `fitcoach`** est le réglage le plus important : le dépôt
> contient aussi ton site e-commerce, il faut pointer sur le bon sous-dossier.

### 4. Lance

**Save and Deploy**. La compilation prend 3 à 5 minutes (c'est normal, elle
installe tout). À la fin, tu obtiens une adresse du type :

```
https://fitcoach-xyz.pages.dev
```

### 5. Installe sur ton iPhone

1. Ouvre cette adresse dans **Safari** ⚠️ *(pas Chrome — iOS ne propose
   l'installation que depuis Safari)*
2. Bouton **Partager** — le carré avec une flèche vers le haut
3. Fais défiler → **« Sur l'écran d'accueil »** → **Ajouter**

L'icône apparaît sur ton écran d'accueil. **Lance-la toujours depuis cette
icône** : c'est ce qui déclenche le plein écran.

✅ À partir de là, plus besoin de PC. Jamais.

---

# Partie B — Activer Coach Léo

Le coach a besoin d'un petit relais qui garde ta clé API côté serveur.

### 1. Récupère ta clé Anthropic

[console.anthropic.com](https://console.anthropic.com) → **API Keys** → *Create Key*.
Copie-la (elle commence par `sk-ant-`).

### 2. Crée le Worker

1. Tableau de bord Cloudflare → **Workers & Pages** → **Create** → onglet
   **Workers** → **Create Worker**
2. Nomme-le `fitcoach-proxy` → **Deploy** *(on remplacera le code juste après)*
3. Clique **Edit code**
4. **Efface tout** le contenu de l'éditeur
5. Ouvre [`backend/cloudflare-worker/dist-paste/worker.js`](../backend/cloudflare-worker/dist-paste/worker.js)
   sur GitHub, copie **tout** le fichier, colle-le dans l'éditeur
6. **Deploy**

> Ce fichier est la version JavaScript du Worker, générée exprès pour être collée
> ici. Le fichier source (`src/index.ts`) est en TypeScript et ne fonctionnerait
> pas tel quel dans cet éditeur.

### 3. Ajoute ta clé en secret

Dans le Worker → **Settings** → **Variables and Secrets** → **Add** :

| Champ | Valeur |
|---|---|
| Type | **Secret** ⚠️ (pas « Text ») |
| Nom | `ANTHROPIC_API_KEY` |
| Valeur | ta clé `sk-ant-…` |

**Save and deploy.**

> En choisissant **Secret**, la clé est chiffrée et ne sera plus jamais affichée.
> C'est ce qui garantit qu'elle ne se retrouve ni dans l'app, ni sur GitHub.

### 4. Note l'adresse du Worker

Elle est affichée en haut de la page, du type :
```
https://fitcoach-proxy.ton-compte.workers.dev
```

### 5. Branche l'app dessus

Toujours dans le navigateur, sur GitHub :

1. Va sur le fichier `fitcoach/app.json` de la branche
   `claude/fitcoach-mobile-app-69170k`
2. Clique l'icône **crayon** (Edit this file)
3. Trouve la ligne :
   ```json
   "claudeProxyUrl": "https://YOUR-WORKER.workers.dev",
   ```
4. Remplace l'adresse par celle de ton Worker
5. **Commit changes**

Cloudflare Pages détecte le changement et **recompile automatiquement**. Deux ou
trois minutes plus tard, recharge l'app sur ton iPhone : Coach Léo répond.

---

## Mettre à jour l'app plus tard

Tout changement poussé sur la branche déclenche une recompilation automatique.
Sur ton iPhone, ferme puis rouvre l'app pour récupérer la nouvelle version.

## En cas de souci

**La compilation échoue sur Cloudflare** → vérifie `Root directory` = `fitcoach`
et `Build output directory` = `dist`. Les journaux de build indiquent l'erreur
exacte.

**« Sur l'écran d'accueil » n'apparaît pas** → tu n'es pas dans Safari. Chrome et
Firefox sur iOS ne proposent pas l'installation.

**Le coach répond qu'il n'est pas branché** → l'adresse du Worker dans `app.json`
est absente ou incorrecte, ou la recompilation n'est pas terminée.
