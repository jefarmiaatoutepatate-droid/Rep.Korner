---
name: ebay-copilot-add-command
description: >
  Add or modify a Discord slash command for the eBay Dropship Copilot bot in
  ebay-dropship-bot/discord-bot/commands/. Use this whenever asked to add a
  new /command to the eBay Discord bot, expose a new eBay Dropship Copilot
  feature in Discord, change what an existing /audit, /titre, /description,
  /marge, /niche, /guide, or /aide command does, or wire up new dropshipping
  logic (new audit rule, new generator field, new sourcing metric) so it's
  reachable from Discord — even when the request only mentions "the bot" or
  "the Discord command" without naming the file. Following this skill keeps
  the command consistent with the existing ones and testable without a real
  Discord token.
---

# Ajouter/modifier une commande du bot Discord eBay Dropship Copilot

## Principe : ne jamais dupliquer la logique métier

Le bot n'a **aucune règle métier à lui** : `discord-bot/commands/*.js`
ne fait que traduire des options Discord en appels à
`ebay-dropship-bot/js/{rules,audit,generator,sourcing}.js`, puis met le
résultat en forme dans un `EmbedBuilder`. Si la fonctionnalité demandée
nécessite une nouvelle règle ou un nouveau calcul, ajoutez-le dans `js/`
(pas dans `discord-bot/`) : la web app et le bot le récupèrent alors
automatiquement tous les deux, sans rien dupliquer. Ne réécrivez jamais en
JS "bot" une logique qui existe déjà côté `js/` — `require`-la.

## Squelette d'une commande

Chaque fichier de `discord-bot/commands/` suit ce pattern (voir `audit.js`,
`marge.js`, `niche.js` pour des exemples complets) :

```js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");

const RULES = require(path.join(__dirname, "..", "..", "js", "rules.js"));
// + Audit / Generator / Sourcing selon le besoin

const builder = new SlashCommandBuilder()
  .setName("nom_commande")          // minuscules, sans espace, sans accent
  .setDescription("Description courte affichée dans Discord")
  .addStringOption(o => o.setName("...").setDescription("...").setRequired(true))
  // options requises D'ABORD, puis les optionnelles ensuite (contrainte Discord)
  ;

module.exports = {
  data: builder,
  async execute(interaction) {
    const input = { /* lire interaction.options.getString/getInteger/getNumber/getBoolean */ };
    const result = /* appel à Audit.run / Generator.generate / Sourcing.margin / Sourcing.nicheScore */;
    const embed = new EmbedBuilder().setTitle(/* ... */).setColor(/* ... */);
    await interaction.reply({ embeds: [embed] });
  }
};
```

Points à respecter (contraintes réelles de l'API Discord, déjà rencontrées
en construisant ce bot) :

- **Noms d'option** : minuscules, sans espace ni accent (`delai_annonce`, pas
  `délai annoncé`).
- **Ordre des options** : toutes les `.setRequired(true)` avant les
  optionnelles — sinon `data.toJSON()` lève une erreur au déploiement.
- **Choix (`.addChoices(...)`)** : 25 maximum par option. Pour les
  catégories/états produit, réutilisez `RULES.categories` /
  `RULES.conditions` (déjà définis dans `js/rules.js` et partagés avec le
  formulaire web) plutôt que de recopier une liste en dur — sinon web et bot
  finissent par diverger.
- **Réponses éphémères** (visibles seulement par l'utilisateur, comme
  `/aide`) : utilisez `flags: MessageFlags.Ephemeral`, **pas**
  `ephemeral: true` qui est déprécié dans discord.js v14 (émet un
  avertissement à l'exécution).
- **Couleurs d'embed** : réutilisez la convention déjà en place
  (`ok`/`warn`/`bad` → `0x1a8754`/`0xb8790a`/`0xc62828`, définie en tête de
  `audit.js`, `marge.js`, `niche.js`) plutôt que d'inventer une nouvelle
  palette.
- **Texte long à coller ailleurs** (comme le HTML généré par
  `/description`) : joignez-le en pièce jointe avec `AttachmentBuilder`
  plutôt que de le mettre dans l'embed — 4096 caractères max en description
  d'embed, et le rendu Discord n'est de toute façon pas fait pour du HTML.

## Tester sans token Discord réel

Aucun token Discord n'est disponible dans cet environnement de session — le
bot ne peut donc pas se connecter au gateway ici. Testez systématiquement via
le harnais de simulation (partagé avec la skill `ebay-copilot-run`) :

1. Ajoutez un scénario réaliste pour votre nouvelle commande dans
   `.claude/skills/ebay-copilot-run/scripts/bot-scenarios.json` (clé =
   nom du fichier, valeur = objet des options simulées).
2. Lancez :
   ```bash
   node .claude/skills/ebay-copilot-run/scripts/smoke-test-bot.js
   ```
   Ça valide `data.toJSON()` (structure des options) **et** exécute
   `execute()` avec des valeurs simulées, en vérifiant les limites Discord
   (longueurs de titre/description/champs d'embed).
3. Pour itérer plus vite sur une seule commande avec des valeurs précises :
   ```bash
   node .claude/skills/ebay-copilot-run/scripts/discord-mock.js \
     ebay-dropship-bot/discord-bot/commands/<fichier>.js \
     '{"option1": "valeur", "option2": 42}'
   ```

## Une fois la commande validée

Rappelez à l'utilisateur (vous ne pouvez pas le faire à sa place depuis cette
session, faute de token réel) qu'il doit relancer `npm run deploy` dans
`ebay-dropship-bot/discord-bot/` pour enregistrer la nouvelle commande auprès
de Discord avant de pouvoir l'utiliser sur son serveur — `index.js` charge
automatiquement tout fichier posé dans `commands/`, mais Discord n'affiche
une commande slash que si elle a été explicitement déployée.

Pensez aussi à mettre à jour `discord-bot/commands/aide.js` (liste des
commandes) et `discord-bot/README.md` si la nouvelle commande est destinée
aux utilisateurs finaux du bot.
