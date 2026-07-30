---
name: ebay-copilot-knowledge-refresh
description: >
  Refresh the eBay/AliExpress/Amazon/GPSR policy content baked into eBay
  Dropship Copilot (ebay-dropship-bot/js/rules.js — RULES.knowledgeBase,
  RULES.fees, RULES.title, RULES.gpsrCategories, RULES.veroSensitiveBrands...)
  against current official policy. Use this whenever asked to update, verify,
  double-check, or refresh the eBay Dropship Copilot's rules/knowledge base,
  when the user reports that a policy, fee, or threshold in the audit/margin
  tool looks outdated or wrong, when significant time has passed since the
  `RULES.meta.lastReviewed` date in rules.js, or periodically as routine
  maintenance for this sub-project — since eBay/AliExpress/Amazon policy and
  EU regulation (GPSR, VAT/IOSS) change over time and this tool's accuracy
  depends entirely on that content staying current.
---

# Mettre à jour la base de connaissances eBay Dropship Copilot

`ebay-dropship-bot/js/rules.js` est la source de vérité unique consommée à
la fois par l'app web et le bot Discord (voir skill `ebay-copilot-run`). Sa
fiabilité — et donc celle de tout l'outil — dépend entièrement de l'exactitude
de son contenu à un instant T. Ce n'est pas un fichier "one-shot" : les
politiques eBay/AliExpress/Amazon et la réglementation UE évoluent, ce skill
sert à le vérifier et le remettre à jour périodiquement, pas seulement à sa
création.

## Étapes

1. **Regarder l'état actuel** : ouvrez `ebay-dropship-bot/js/rules.js`, notez
   `RULES.meta.lastReviewed`. Si la dernière relecture date de plusieurs
   mois, ou si l'utilisateur signale un point précis (frais, délai GPSR,
   politique dropshipping...), c'est le signal pour agir.

2. **Rechercher l'état actuel des politiques** via `WebSearch`/`WebFetch`
   (charger ces outils via `ToolSearch` s'ils sont différés). Voir
   `references/search-queries.md` pour les requêtes de départ par sujet —
   adaptez toujours l'année à l'année en cours. Ne vous fiez pas à un seul
   article de blog : croisez au moins deux sources, et pour les chiffres
   précis (barème de frais, seuils), recoupez avec les pages officielles
   listées dans la même référence.

3. **Comparer avec le contenu existant** dans `RULES.knowledgeBase` (tableau
   d'objets `{ id, title, body }`), `RULES.fees`, `RULES.title`,
   `RULES.description`, `RULES.gpsrCategories`, `RULES.veroSensitiveBrands`,
   `RULES.performance`. Identifiez précisément ce qui a changé — ne réécrivez
   pas un sujet entier si un seul chiffre a bougé.

4. **Éditer `rules.js`** :
   - Modifiez uniquement les `body` concernés, en reformulant (pas de
     copier-coller d'un article tiers).
   - Mettez à jour les seuils numériques correspondants s'ils existent
     ailleurs dans le fichier (ex. un changement de barème de frais doit se
     refléter dans `RULES.fees`, pas seulement dans le texte du
     `knowledgeBase`).
   - Mettez à jour `RULES.meta.lastReviewed` au format `"AAAA-MM"`.
   - Gardez `RULES.meta.disclaimer` tel quel (il reste vrai par construction :
     l'outil reflète l'état compris à la dernière relecture, pas un flux
     temps réel).

5. **Valider que rien n'est cassé** — un changement de structure (renommer
   une clé, changer un type de valeur) casse silencieusement l'app web ou le
   bot sans erreur visible immédiatement. Lancez systématiquement :
   ```bash
   NODE_PATH=/opt/node22/lib/node_modules node .claude/skills/ebay-copilot-run/scripts/smoke-test-web.js
   node .claude/skills/ebay-copilot-run/scripts/smoke-test-bot.js
   ```
   (voir la skill `ebay-copilot-run` pour le détail de ce qu'ils vérifient).

6. **Résumer les changements à l'utilisateur** : quoi a changé, pourquoi
   (avec les sources), et l'impact concret (ex. "le seuil de commission
   professionnelle est passé de X% à Y%, le calculateur de marge du bot et
   du site en tiennent maintenant compte").

## Ce que ce skill ne fait pas

Il ne connecte l'outil à aucune API eBay/AliExpress/Amazon en temps réel —
l'app reste volontairement un outil de règles statiques, pas un flux live
(voir `ebay-dropship-bot/README.md`, section Limites). Ce skill sert
uniquement à maintenir ces règles statiques aussi proches que possible de la
réalité au moment de la relecture.
