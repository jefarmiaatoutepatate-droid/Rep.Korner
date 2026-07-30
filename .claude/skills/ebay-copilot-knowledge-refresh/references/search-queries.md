# Requêtes de recherche de référence

Point de départ pour relire chaque sujet de `RULES.knowledgeBase` dans
`ebay-dropship-bot/js/rules.js`. Adaptez l'année dans chaque requête à
l'année en cours (`currentDate` du contexte système) — ces politiques
évoluent chaque année, une recherche sans année récente renvoie souvent des
articles obsolètes.

| Sujet (`id` dans `RULES.knowledgeBase`) | Requêtes utilisées à la dernière relecture |
|---|---|
| `policy-dropshipping` | `eBay dropshipping policy official <année> seller of record` |
| `aliexpress` | `AliExpress dropshipping policy eBay délais douane <année>` |
| `amazon` | `Amazon dropshipping eBay retail arbitrage policy banned <année>` |
| `gpsr` | `GPSR eBay France annonce personne responsable UE obligatoire <année>` |
| `vero` | `eBay VeRO programme contrefaçon marques protégées vendeur` |
| `tva` | `TVA IOSS import UE franchise vendeur eBay dropshipping <année>` |
| `performance` | `eBay seller performance late shipment rate standards <année>` |
| `sourcing-method` | (pas de politique à vérifier — méthodologie générale, stable) |
| Barème `RULES.fees` | `eBay France frais de vente barème <année> commission vendeur particulier professionnel` |
| Règles de titre `RULES.title` | `eBay title requirements character limit prohibited words <année>` |

## Pages officielles à recouper directement (pas seulement via recherche)

Ces pages changent parfois sans que les résumés tiers (blogs SEO,
comparateurs) ne soient encore à jour — si un chiffre semble suspect ou trop
rond, ouvrez la page officielle directement plutôt que de vous fier au
résumé d'un tiers :

- `ebay.fr/help/selling/fees-credits-invoices/...` (barème de frais particulier et professionnel)
- `ebay.fr/help/policies/listing-policies/selling-policies/intellectual-property-vero-program` (VeRO)
- `ebay.fr/help/policies/prohibited-restricted-items/fake-items-policy` (contrefaçon)
- Page eBay dédiée à la politique dropshipping (chercher "eBay dropshipping policy" sur `ebay.com/help/policies`, la page exacte bouge parfois)
- Réglementation GPSR : texte officiel UE (règlement 2023/988) + centre d'aide eBay dédié GPSR

## Ce qu'il faut mettre à jour dans le code après une relecture

1. `RULES.meta.lastReviewed` → mois/année de la relecture (format `"AAAA-MM"`).
2. Le texte du ou des `RULES.knowledgeBase[].body` concernés — reformulez,
   ne collez pas de citation brute d'un blog tiers.
3. Si applicable : `RULES.fees`, `RULES.title`, `RULES.description`,
   `RULES.gpsrCategories`, `RULES.veroSensitiveBrands`,
   `RULES.performance`.
4. Après modification, relancez le smoke test web ET bot (skill
   `ebay-copilot-run`) — les deux consomment `rules.js`, un changement de
   structure (renommer une clé, changer un type) casse silencieusement
   l'autre surface sans un test explicite.
