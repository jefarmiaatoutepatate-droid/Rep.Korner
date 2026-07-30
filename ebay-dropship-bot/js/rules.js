/* ==========================================================================
   RULES.JS — Base de connaissances eBay.fr / dropshipping
   Règles, seuils et contenus utilisés par les modules audit / generator /
   sourcing. Basé sur les politiques eBay, AliExpress, Amazon et la
   réglementation UE (GPSR, TVA/IOSS) en vigueur. À vérifier périodiquement
   sur les pages officielles, ces règles évoluent régulièrement.
   ========================================================================== */

const RULES = {

  meta: {
    lastReviewed: "2026-07",
    disclaimer: "Ces informations sont fournies à titre d'aide à la décision et reflètent les politiques eBay/AliExpress/Amazon et la réglementation UE au moment de la rédaction. Elles ne remplacent pas un conseil juridique. Vérifiez toujours les pages officielles eBay avant publication."
  },

  fees: {
    particulier: {
      label: "Vendeur particulier",
      commissionLowRate: 0.10,
      commissionThreshold: 2000,
      commissionHighRate: 0.02,
      perOrderFee: 0.35,
      regOpsRate: 0.0042,
      freeListingsPerMonth: 100,
      extraListingFee: 0.35
    },
    professionnel: {
      label: "Vendeur professionnel",
      commissionRateMin: 0.05,
      commissionRateMax: 0.12,
      commissionRateDefault: 0.10,
      perOrderFee: 0.35,
      regOpsRate: 0.0035
    },
    note: "Barème eBay.fr 2026 à titre indicatif (commission calculée sur le montant total payé par l'acheteur : prix + livraison + taxes). La commission professionnelle varie de 5% à 12% selon la catégorie. Vérifiez le barème exact et à jour sur ebay.fr/help avant de figer vos prix."
  },

  title: {
    maxLength: 80,
    idealMin: 55,
    idealMax: 80,
    forbiddenSymbols: ["★", "☆", "♥", "❤", "✔", "✅", "🔥", "👉", "⭐", "@@", "~~", "$$", "^^", "°°", "{", "}", "[", "]", "|", "•"],
    fillerWords: ["l@@k", "look!", "wow", "beau", "beautiful", "superbe affaire", "meilleur prix du web", "n°1", "top vente", "promo folle", "a saisir", "à saisir", "urgent", "rare occasion"],
    circumventionPatterns: [
      { re: /\b0[0-9](?:[\s.\-]?[0-9]{2}){4}\b/, label: "numéro de téléphone" },
      { re: /[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/i, label: "adresse email" },
      { re: /\b(https?:\/\/|www\.)\S+/i, label: "lien externe" },
      { re: /\b(whatsapp|telegram|instagram|snapchat|aliexpress|amazon\.fr|amazon\.com|vinted|leboncoin)\b/i, label: "mention d'une autre plateforme / réseau" }
    ]
  },

  description: {
    minWords: 60,
    activeContentPatterns: [
      { re: /<script/i, label: "balise <script>" },
      { re: /<iframe/i, label: "balise <iframe>" },
      { re: /<form/i, label: "balise <form>" },
      { re: /on(click|load|mouseover|error)\s*=/i, label: "gestionnaire d'événement JS (onclick, onload...)" },
      { re: /javascript:/i, label: "lien javascript:" }
    ],
    circumventionPatterns: [
      { re: /\b0[0-9](?:[\s.\-]?[0-9]{2}){4}\b/, label: "numéro de téléphone" },
      { re: /[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/i, label: "adresse email" },
      { re: /\b(https?:\/\/|www\.)\S+/i, label: "lien externe (hors zone image hébergée eBay)" },
      { re: /\b(whatsapp|telegram|instagram|snapchat|aliexpress\.com|amazon\.fr|achetez sur mon site|notre site web)\b/i, label: "renvoi vers une autre plateforme de vente" }
    ]
  },

  gpsrCategories: [
    "Jouets & jeux", "Électronique & électroménager", "Puériculture & bébé",
    "Cosmétiques & beauté", "Sport & plein air", "Bricolage & outillage",
    "Vêtements & mode enfant", "Bijoux & accessoires"
  ],

  veroSensitiveBrands: [
    "nike", "adidas", "lego", "disney", "chanel", "louis vuitton", "gucci", "rolex",
    "apple", "iphone", "samsung", "sony", "playstation", "nintendo", "hermès", "hermes",
    "dior", "supreme", "the north face", "new balance", "converse", "ray-ban", "rayban",
    "pandora", "swarovski", "michael kors", "yeezy", "off-white", "moncler", "burberry"
  ],

  legalRestrictedNiches: [
    "batteries au lithium vendues seules", "cosmétiques sans liste INCI / non conformes",
    "jouets sans marquage CE ni tranche d'âge", "appareils électriques sans certification CE",
    "produits médicaux ou prétention thérapeutique", "articles pour très jeunes enfants sans conformité sécurité",
    "produits contenant un logo/marque protégée sans autorisation"
  ],

  performance: {
    lateShipmentRateMax: 0.05,
    unresolvedCasesMax: 0.003,
    trackingUploadedMin: 0.95
  },

  knowledgeBase: [
    {
      id: "policy-dropshipping",
      title: "Politique dropshipping eBay",
      body: `Le dropshipping reste autorisé sur eBay en 2026, à condition d'être vous-même le "seller of record" (vendeur responsable) : c'est vous qui gérez la relation client, le SAV, les retours et qui répondez de la livraison dans le délai annoncé — même si un tiers expédie le colis.

Ce qui est INTERDIT : sourcer un produit chez un autre détaillant ou marketplace (Amazon, Walmart...) qui l'expédie directement au client. C'est ce qu'on appelle le "retail arbitrage". eBay dispose désormais de systèmes automatisés pour le détecter et sanctionner les comptes concernés (limitation, suspension).

Ce qui est TOLÉRÉ : s'approvisionner chez un grossiste/fabricant (AliExpress, agents dropshipping, CJ, Zendrop, Spocket, Eprolo...) qui expédie en votre nom, sans que la facture ou l'emballage ne révèle un autre vendeur ou un prix différent.

eBay peut désormais demander des preuves de votre relation fournisseur (factures, accords de fulfillment) en cas de contrôle. Gardez une trace de vos achats fournisseurs.`
    },
    {
      id: "aliexpress",
      title: "AliExpress comme fournisseur",
      body: `AliExpress est une source acceptée pour le dropshipping (la plateforme propose même un "Dropshipping Center" dédié). Les points de vigilance :

• Délais longs si expédition directe depuis la Chine (souvent 15 à 30 jours) : à annoncer honnêtement dans vos annonces, sous peine de dégrader votre "Late Shipment Rate" et de subir des litiges.
• Emballage/facture : si le colis affiche la marque ou le prix AliExpress, cela peut être vu comme une violation de la règle "seller of record" d'eBay.
• Douane/TVA : depuis juillet 2021, il n'y a plus de franchise de TVA sur les importations UE — la TVA est due dès le premier euro. Utilisez l'IOSS pour les envois de moins de 150 € afin de simplifier la collecte de TVA côté acheteur.

Pour réduire ces risques, de nombreux dropshippers utilisent des agents avec entrepôts en UE (CJdropshipping, Zendrop, Eprolo, Spocket...) : délais ramenés à 3-7 jours, emballage neutre, retours facilités, conformité GPSR plus simple à obtenir.`
    },
    {
      id: "amazon",
      title: "Amazon comme fournisseur : à éviter",
      body: `Sourcer depuis Amazon pour revendre sur eBay ("retail arbitrage") est désormais explicitement banni par la politique eBay et activement détecté. Le colis livré au client porte la marque et souvent la facture Amazon, ce qui viole la règle du "seller of record".

Par ailleurs, Amazon peut lui-même suspendre le compte utilisé pour ce type d'achats répétés (schémas de revente suspects) et annuler des commandes.

Ce canal est donc à réserver à d'autres modèles (achat-revente avec réception, contrôle qualité et ré-emballage par vos soins), pas à un dropshipping automatisé vers eBay.`
    },
    {
      id: "gpsr",
      title: "GPSR — obligations de sécurité produit UE",
      body: `Le règlement européen sur la sécurité générale des produits (GPSR) est en vigueur depuis le 13 décembre 2024 et s'applique à la quasi-totalité des produits de consommation neufs vendus à des acheteurs UE, y compris via eBay.fr.

Informations obligatoires sur chaque annonce :
• Nom, adresse postale et email du fabricant (ou de l'importateur si le fabricant est hors UE).
• Coordonnées d'une "personne responsable UE" si le fabricant n'est pas basé dans l'UE (cas fréquent en dropshipping depuis l'Asie).
• Avertissements de sécurité pertinents (tranche d'âge, risques d'étouffement pour les jouets, etc.) et informations de traçabilité (référence produit, lot).

eBay a déployé des champs dédiés dans le formulaire de mise en vente et durcit les contrôles en 2025-2026 : les annonces non conformes sont supprimées et les comptes récidivistes peuvent voir leur accès au marché UE restreint. Beaucoup d'agents dropshipping EU (CJdropshipping, Zendrop...) proposent un service de "personne responsable" pour faciliter la conformité.`
    },
    {
      id: "vero",
      title: "VeRO & contrefaçon",
      body: `Le programme VeRO (Verified Rights Owner) permet aux titulaires de droits (marques, designs) de signaler les annonces qui portent atteinte à leurs droits. Il compte plus de 40 000 membres.

Règles à respecter :
• N'utilisez pas le nom d'une marque dans votre titre/description sauf si vous êtes revendeur autorisé, ou si le produit est un accessoire réellement compatible (formulez alors "compatible avec..." plutôt que d'apposer le logo).
• Évitez les visuels, logos ou packagings copiant une marque protégée.
• En cas de signalement, l'annonce est retirée ; les sanctions (3 à 10 jours de restriction) s'aggravent avec la récidive, jusqu'à la suspension définitive après plusieurs avertissements.

Les marques les plus surveillées (Nike, Adidas, LEGO, Disney, Apple, marques de luxe...) méritent une vigilance particulière, surtout en dropshipping où l'authenticité du produit ne peut pas toujours être garantie.`
    },
    {
      id: "tva",
      title: "TVA, IOSS & statut légal",
      body: `• TVA : depuis le 1er juillet 2021, la franchise de TVA de 22 € sur les importations a disparu — la TVA française est due dès le premier euro d'achat par un particulier UE.
• IOSS (Import One-Stop Shop) : pour les envois de moins de 150 €, ce guichet permet de collecter la TVA au moment de la vente et simplifie le passage en douane (moins de mauvaises surprises pour le client, donc moins de litiges).
• Statut : au-delà de la vente occasionnelle d'objets personnels, une activité de revente/dropshipping régulière doit être déclarée (auto-entrepreneur au minimum), avec déclaration de charges à l'URSSAF et facturation de la TVA si vous dépassez les seuils de franchise en base.

Un contrôle fiscal ou une clôture de compte eBay pour activité non déclarée sont les deux risques principaux à anticiper.`
    },
    {
      id: "performance",
      title: "Indicateurs de performance eBay à surveiller",
      body: `eBay évalue chaque vendeur sur des indicateurs qui conditionnent la visibilité (Cassini) et le statut du compte :

• Taux d'expédition tardive (Late Shipment Rate) : doit rester sous 5%. C'est le point noir n°1 du dropshipping (délai fournisseur mal maîtrisé).
• Litiges non résolus par le vendeur : sous 0,3%.
• Suivi (tracking) valide déposé à temps : au-dessus de 95%.
• Taux de retour / "objet non conforme à la description" (INAD) élevé : dégrade le classement et peut déclencher le statut "en dessous des standards" (below standard), avec restrictions de vente et frais accrus.

Astuce dropshipping : affichez toujours un délai de livraison légèrement supérieur au délai réel fournisseur (marge de sécurité), pour ne jamais être pris en défaut.`
    },
    {
      id: "sourcing-method",
      title: "Méthodologie de recherche de produits niche",
      body: `Où chercher des idées :
• Google Trends (tendances de recherche sur 12-24 mois, saisonnalité).
• TikTok/Instagram (hashtags produits, "TikTok made me buy it").
• eBay Terapeak / recherche avancée eBay (volumes de vente réels, prix moyens constatés).
• AliExpress "Dropshipping Center" / onglet Tendances.
• Amazon Movers & Shakers, Best Sellers (par catégorie).
• Communautés niche (Reddit, forums spécialisés, salons professionnels).

Critères d'un produit "gagnant" :
• Résout un problème concret ou déclenche un effet "wow"/achat impulsif.
• Prix de vente idéal entre 15 € et 50 € (facilite la décision d'achat sans réflexion excessive).
• Léger et peu encombrant (< 2 kg) pour limiter les frais et délais de port.
• Peu ou pas disponible en magasin physique local (différenciation).
• Marge nette visée ≥ 30% après tous frais (voir calculateur de marge).
• Pas de restriction eBay/légale (batteries seules, certification CE obligatoire, cosmétiques réglementés, jouets sans conformité sécurité...).

Critères d'un fournisseur fiable (AliExpress et assimilés) :
• Note ≥ 4.7/5 avec un volume d'avis significatif.
• ≥ 1000 commandes traitées sur la fiche produit.
• Taux de litige faible, délai d'expédition affiché et respecté.
• Réactivité aux messages (< 24h).
• Se méfier des tout nouveaux vendeurs sans historique ni avis.`
    }
  ]
};
