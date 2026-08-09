# Politique de confidentialité — FitCoach

**Dernière mise à jour : [À COMPLÉTER — date de publication]**
**Éditeur : [À COMPLÉTER — ton nom ou celui de ta société]**
**Contact : [À COMPLÉTER — adresse e-mail de contact]**

> ⚠️ **À compléter avant publication.** Les trois champs ci-dessus sont obligatoires :
> l'App Store et Google Play exigent un éditeur identifiable et un moyen de contact.
> Ce document décrit fidèlement le fonctionnement actuel de l'application ; si tu
> actives la synchronisation cloud (Supabase), lis la section 6 qui s'y applique.

---

## 1. En résumé

FitCoach est une application de suivi nutrition, musculation et composition
corporelle. **Par défaut, toutes tes données restent stockées sur ton téléphone.**
Nous n'avons pas de serveur qui collecte ton suivi, nous ne vendons aucune donnée
et nous n'utilisons ni publicité ni traqueur analytique.

Deux exceptions, détaillées plus bas : les recherches d'aliments interrogent une
base publique (OpenFoodFacts), et le coach virtuel envoie ta question à un service
d'intelligence artificielle (Anthropic) pour te répondre.

---

## 2. Données que l'application traite

Toutes les données ci-dessous sont enregistrées **localement**, dans une base de
données privée à l'application, sur ton appareil.

### 2.1 Compte
- Prénom, adresse e-mail.
- Mot de passe : **jamais stocké en clair**. Seule une empreinte cryptographique
  (SHA-256 avec sel aléatoire) est conservée sur l'appareil.

### 2.2 Profil et données de santé
- Sexe, âge, taille, poids actuel, poids cible, objectif, nombre de séances par semaine.
- Ces informations servent **uniquement** à calculer tes besoins caloriques et tes
  macronutriments.

### 2.3 Suivi
- **Nutrition** : aliments et repas enregistrés, quantités, calories et macros.
- **Entraînement** : séances, exercices, séries, charges et répétitions.
- **Composition corporelle** : pesées, mensurations et, si tu en ajoutes,
  **photos de progression**.
- **Journal quotidien** : hydratation, prise de compléments.
- **Conversations** avec le coach virtuel.

> Ces données relèvent de la **santé** et sont considérées comme sensibles. Elles ne
> quittent ton appareil que dans les cas décrits à la section 3.

---

## 3. Services tiers

### 3.1 OpenFoodFacts — recherche d'aliments
Quand tu recherches un aliment, **le nom recherché** est envoyé à l'API publique
d'OpenFoodFacts pour récupérer ses valeurs nutritionnelles. Aucune donnée
personnelle (identité, profil, historique) n'est transmise.
Voir : https://world.openfoodfacts.org/

### 3.2 Anthropic (Claude) — coach virtuel et estimation de plats
Deux fonctionnalités utilisent un modèle d'intelligence artificielle, via un serveur
relais que nous opérons (afin que la clé d'accès ne soit jamais embarquée dans
l'application) :

- **Estimation de macros** d'un plat introuvable dans les bases : seul le **nom du
  plat et la quantité** sont envoyés.
- **Coach virtuel** : ton **message**, ton **prénom** et un **contexte de suivi**
  (âge, sexe, taille, poids, objectif, cibles caloriques, macros du jour, prochaine
  séance) sont envoyés afin d'obtenir une réponse personnalisée.

Ces échanges sont traités par Anthropic conformément à sa politique :
https://www.anthropic.com/legal/privacy
Le serveur relais **ne conserve aucun journal** de tes conversations : il transmet la
requête et renvoie la réponse. L'historique de conversation reste sur ton téléphone.

**Si tu ne veux pas utiliser ces fonctionnalités**, il te suffit de ne pas utiliser
l'onglet Coach et de ne pas lancer de recherche en ligne : le reste de l'application
(journal, séances, mensurations, bilan) fonctionne intégralement hors ligne.

---

## 4. Autorisations demandées

| Autorisation | Pourquoi | Obligatoire |
|---|---|---|
| **Photos / Appareil photo** | Ajouter des photos de progression avant/après | Non |
| **Notifications** | Rappels de pesée et bilan hebdomadaire | Non |

Les photos sélectionnées restent sur ton appareil : elles ne sont **jamais** envoyées
sur un serveur.

---

## 5. Ce que nous ne faisons pas

- ❌ Aucune publicité.
- ❌ Aucun traqueur analytique ou de mesure d'audience.
- ❌ Aucune vente, location ou partage de tes données à des fins commerciales.
- ❌ Aucun profilage publicitaire.
- ❌ Aucune donnée transmise à un courtier en données.

---

## 6. Synchronisation cloud (optionnelle, désactivée par défaut)

L'application peut être configurée pour synchroniser ton compte et ton suivi via
**Supabase**, afin de retrouver tes données sur plusieurs appareils. Cette option est
**inactive par défaut**. Si elle est activée dans la version que tu utilises :

- tes données de suivi sont hébergées sur l'infrastructure Supabase (Union européenne
  ou États-Unis selon la région du projet) ;
- l'accès est cloisonné par utilisateur : techniquement, seul ton compte peut lire ses
  propres données (règles de sécurité au niveau des lignes) ;
- politique de Supabase : https://supabase.com/privacy

---

## 7. Conservation et suppression

Tes données sont conservées tant que ton compte existe sur l'appareil.

**Tu peux tout supprimer à tout moment** : Réglages → « Supprimer mon compte ». Cette
action est **définitive et immédiate** — le compte et l'intégralité des données
associées (repas, séances, séries, mensurations, journal, bilans, conversations) sont
effacés. Désinstaller l'application supprime également l'ensemble des données locales.

---

## 8. Tes droits (RGPD)

Conformément au Règlement général sur la protection des données, tu disposes d'un
droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de
portabilité.

En pratique, l'application te donne un contrôle direct : tes données sont sur ton
appareil, tu peux les **consulter** et les **modifier** dans l'application, les
**exporter** (bilan hebdomadaire en PDF) et les **effacer** intégralement en
supprimant ton compte.

Pour toute question, écris à : **[À COMPLÉTER — adresse e-mail de contact]**.
Tu peux également introduire une réclamation auprès de la CNIL (www.cnil.fr).

---

## 9. Mineurs

L'application n'est pas destinée aux personnes de moins de 16 ans. Les
recommandations nutritionnelles et sportives ne sont pas adaptées aux enfants.

---

## 10. Avertissement santé

FitCoach est un outil de suivi personnel. **Il ne fournit pas d'avis médical.** Le
coach virtuel n'est pas un professionnel de santé et ses réponses sont générées
automatiquement. Consulte un médecin, un diététicien ou un nutritionniste avant tout
changement significatif d'alimentation ou d'entraînement, en particulier en cas de
pathologie, de traitement, de grossesse ou de trouble du comportement alimentaire.

---

## 11. Modifications

Toute modification de cette politique sera publiée à cette adresse avec une nouvelle
date de mise à jour. En cas de changement substantiel, tu en seras informé dans
l'application.
