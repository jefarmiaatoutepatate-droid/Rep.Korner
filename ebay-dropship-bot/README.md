# eBay Dropship Copilot

Assistant **100% hors-ligne** pour vendeurs eBay.fr en dropshipping (AliExpress, agents EU type CJdropshipping/Zendrop, etc.). Aucune clé API, aucun compte, aucune connexion internet requise — tout tourne dans le navigateur.

## Ce que fait l'outil

- **Audit d'annonce** — vérifie titre, description, photos, livraison, retours, conformité GPSR et risques VeRO avant publication, avec un score /100 et des corrections concrètes.
- **Générateur** — produit 3 titres optimisés (≤80 caractères) et une description HTML structurée (sans script/iframe, compatible eBay) prête à copier-coller.
- **Sourcing & Marge** — calculateur de marge nette réelle après frais eBay (barème particulier/professionnel) et score de viabilité d'une niche produit.
- **Base de connaissances** — résumés pratiques : politique dropshipping eBay, AliExpress, Amazon (déconseillé comme fournisseur), GPSR, VeRO, TVA/IOSS, indicateurs de performance à surveiller.

## Utilisation

Ouvrez simplement `index.html` dans un navigateur (double-clic, ou servez le dossier avec n'importe quel serveur statique). Vos audits, descriptions générées et niches évaluées sont sauvegardés localement (`localStorage`) — rien n'est envoyé sur internet.

## Limites volontaires (à lire avant de se fier aveuglément à l'outil)

- **Pas de connexion réelle à l'API eBay/AliExpress/Amazon.** L'outil ne publie rien automatiquement et ne récupère aucune donnée live (prix concurrents, tendances réelles, stock fournisseur). C'est un outil d'aide à la décision basé sur des règles.
- **Les politiques citées évoluent.** Le contenu de la Base de connaissances et les seuils de l'audit reflètent les politiques eBay/AliExpress/Amazon et la réglementation UE (GPSR, TVA/IOSS) telles que comprises à la dernière relecture (voir date affichée dans l'onglet Base de connaissances). Vérifiez toujours les pages officielles avant de publier une annonce sensible.
- **Le barème de frais eBay** utilisé dans le calculateur de marge (`js/rules.js`) est indicatif — la commission professionnelle varie réellement de 5% à 12% selon la catégorie exacte. Ajustez le champ « Taux commission pro » si besoin.

## Pour aller plus loin (connexion réelle à l'API eBay)

Si vous voulez plus tard publier réellement des annonces ou auditer votre inventaire live :
1. Créez un compte sur [developer.ebay.com](https://developer.ebay.com) et générez des clés API (Sell API / Inventory API).
2. Un backend (Node/Python) serait nécessaire pour gérer l'authentification OAuth eBay en toute sécurité (les clés ne doivent jamais être exposées côté navigateur).
3. Cet outil peut servir de moteur de règles réutilisable pour un futur module d'audit connecté.

## Structure

```
ebay-dropship-bot/
  index.html          Interface (tableau de bord, audit, générateur, sourcing, base de connaissances)
  css/style.css        Styles (clair/sombre automatique)
  js/rules.js           Base de connaissances + seuils/règles
  js/audit.js            Moteur d'audit d'annonce
  js/generator.js         Générateur de titres/description
  js/sourcing.js            Calculateur de marge + score de niche
  js/main.js                 Navigation, formulaires, persistance locale
```
