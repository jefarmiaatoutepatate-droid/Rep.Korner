/* ==========================================================================
   AUDIT.JS — Moteur d'audit d'annonce avant publication
   ========================================================================== */

const Audit = (() => {

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function countUpperRatio(text) {
    const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, "");
    if (!letters.length) return 0;
    const upper = letters.replace(/[^A-ZÀ-Ý]/g, "");
    return upper.length / letters.length;
  }

  function addFinding(list, severity, title, detail) {
    list.push({ severity, title, detail });
  }

  function run(data) {
    const findings = [];
    let score = 100;

    const penalties = { bloquant: 15, avertissement: 6, info: 0 };
    const penalize = (sev) => { score -= penalties[sev] || 0; };

    // ---------- TITRE ----------
    const title = (data.title || "").trim();
    if (!title) {
      addFinding(findings, "bloquant", "Titre manquant", "Un titre est obligatoire.");
      penalize("bloquant");
    } else {
      if (title.length > RULES.title.maxLength) {
        addFinding(findings, "bloquant", "Titre trop long",
          `${title.length}/${RULES.title.maxLength} caractères. eBay refusera ou tronquera le titre. Raccourcissez-le.`);
        penalize("bloquant");
      } else if (title.length < RULES.title.idealMin) {
        addFinding(findings, "avertissement", "Titre trop court pour le SEO",
          `${title.length} caractères seulement (idéal ${RULES.title.idealMin}-${RULES.title.idealMax}). Ajoutez marque, modèle, couleur, taille, mots-clés recherchés pour maximiser la visibilité Cassini.`);
        penalize("avertissement");
      } else {
        addFinding(findings, "info", "Longueur du titre correcte", `${title.length}/${RULES.title.maxLength} caractères.`);
      }

      const lowerTitle = title.toLowerCase();
      const foundSymbols = RULES.title.forbiddenSymbols.filter(s => title.includes(s));
      if (foundSymbols.length) {
        addFinding(findings, "avertissement", "Symboles déconseillés dans le titre",
          `Trouvés : ${foundSymbols.join(" ")}. Ces symboles gaspillent des caractères utiles et sont pénalisés par l'algorithme de recherche (Cassini).`);
        penalize("avertissement");
      }
      const foundFillers = RULES.title.fillerWords.filter(w => lowerTitle.includes(w));
      if (foundFillers.length) {
        addFinding(findings, "avertissement", "Mots de remplissage inutiles",
          `"${foundFillers.join('", "')}" — personne ne recherche ces termes. Remplacez-les par des attributs produits (marque, modèle, taille, couleur).`);
        penalize("avertissement");
      }
      if (countUpperRatio(title) > 0.6 && title.length > 15) {
        addFinding(findings, "avertissement", "Titre en majuscules excessives",
          "Un titre tout en majuscules est perçu comme du spam et peut être sanctionné. Utilisez une casse normale.");
        penalize("avertissement");
      }
      RULES.title.circumventionPatterns.forEach(p => {
        if (p.re.test(title)) {
          addFinding(findings, "bloquant", `Contournement détecté dans le titre (${p.label})`,
            "Interdit par la politique eBay (contournement des frais / renvoi hors plateforme). Retirez cette information du titre.");
          penalize("bloquant");
        }
      });
    }

    // ---------- DESCRIPTION ----------
    const rawDesc = data.description || "";
    const plainDesc = stripHtml(rawDesc);
    const wordCount = plainDesc.trim().split(/\s+/).filter(Boolean).length;

    if (!plainDesc.trim()) {
      addFinding(findings, "bloquant", "Description manquante", "Une description est indispensable pour convertir et être bien référencé.");
      penalize("bloquant");
    } else {
      if (wordCount < RULES.description.minWords) {
        addFinding(findings, "avertissement", "Description trop courte",
          `${wordCount} mots (minimum recommandé : ${RULES.description.minWords}). Détaillez caractéristiques, contenu du colis, état, livraison, garantie.`);
        penalize("avertissement");
      } else {
        addFinding(findings, "info", "Longueur de description suffisante", `${wordCount} mots.`);
      }

      RULES.description.activeContentPatterns.forEach(p => {
        if (p.re.test(rawDesc)) {
          addFinding(findings, "bloquant", `Contenu actif interdit détecté (${p.label})`,
            "eBay bloque tout HTML actif (scripts, iframes, formulaires) dans les descriptions depuis 2023-2024. L'annonce sera rejetée ou l'affichage cassé sur mobile/app.");
          penalize("bloquant");
        }
      });
      RULES.description.circumventionPatterns.forEach(p => {
        if (p.re.test(plainDesc)) {
          addFinding(findings, "bloquant", `Contournement détecté dans la description (${p.label})`,
            "Interdit par la politique eBay. Toute mise en relation directe (téléphone, email, autre site) hors messagerie eBay est sanctionnée.");
          penalize("bloquant");
        }
      });
      if (countUpperRatio(plainDesc) > 0.5 && plainDesc.length > 40) {
        addFinding(findings, "avertissement", "Description en majuscules excessives",
          "Un texte majoritairement en majuscules nuit à la lisibilité et est perçu comme agressif/spam.");
        penalize("avertissement");
      }
    }

    // ---------- MARQUE / VeRO ----------
    const brand = (data.brand || "").trim().toLowerCase();
    if (brand) {
      const hit = RULES.veroSensitiveBrands.find(b => brand.includes(b) || (title || "").toLowerCase().includes(b));
      if (hit) {
        addFinding(findings, "avertissement", `Marque sensible VeRO détectée ("${hit}")`,
          "Cette marque est activement surveillée par le programme VeRO. Ne l'utilisez que si le produit est authentique et que vous pouvez prouver la source (facture), ou si vous êtes revendeur autorisé. Sinon, préférez « compatible avec » sans logo.");
        penalize("avertissement");
      }
    }

    // ---------- ÉTAT / PRIX / PHOTOS ----------
    const photos = parseInt(data.photoCount, 10) || 0;
    if (photos === 0) {
      addFinding(findings, "bloquant", "Aucune photo", "Une annonce sans photo n'est pas crédible et convertit très mal.");
      penalize("bloquant");
    } else if (photos < 4) {
      addFinding(findings, "avertissement", "Trop peu de photos",
        `${photos} photo(s). eBay autorise jusqu'à 24 photos gratuites : visez 6 à 12 angles (packaging, détails, étiquette, défauts éventuels).`);
      penalize("avertissement");
    } else {
      addFinding(findings, "info", "Nombre de photos correct", `${photos} photos.`);
    }
    if (!data.photoHighRes) {
      addFinding(findings, "avertissement", "Résolution photo non confirmée",
        "Utilisez des photos d'au moins 1600px de large pour activer le zoom eBay et paraître professionnel.");
      penalize("avertissement");
    }

    // ---------- LIVRAISON / DROPSHIPPING ----------
    const declaredDelay = parseFloat(data.declaredDelay);
    const supplierDelay = parseFloat(data.supplierDelay);
    if (!isNaN(declaredDelay) && !isNaN(supplierDelay)) {
      if (supplierDelay > declaredDelay) {
        addFinding(findings, "bloquant", "Délai fournisseur supérieur au délai annoncé",
          `Fournisseur : ${supplierDelay}j, annoncé au client : ${declaredDelay}j. Risque direct de dégrader votre Late Shipment Rate et de générer des litiges. Ajoutez une marge de sécurité (le délai affiché doit toujours être ≥ délai fournisseur réel + quelques jours).`);
        penalize("bloquant");
      } else if (declaredDelay - supplierDelay < 2) {
        addFinding(findings, "avertissement", "Marge de sécurité de livraison trop faible",
          "Ajoutez au moins 2-3 jours de marge entre le délai fournisseur réel et le délai affiché au client, pour absorber les aléas logistiques.");
        penalize("avertissement");
      } else {
        addFinding(findings, "info", "Délai de livraison cohérent", `Annoncé ${declaredDelay}j vs fournisseur ${supplierDelay}j.`);
      }
    }
    if (data.shipFrom === "asie" && !isNaN(declaredDelay) && declaredDelay < 12) {
      addFinding(findings, "avertissement", "Délai optimiste pour une expédition directe depuis l'Asie",
        "Une expédition directe Chine → France dépasse souvent 15 à 30 jours. Si votre fournisseur ne dispose pas d'un entrepôt UE, augmentez le délai affiché ou changez de fournisseur/agent.");
      penalize("avertissement");
    }

    // ---------- RETOURS ----------
    if (data.returns === "non") {
      addFinding(findings, "avertissement", "Retours non acceptés",
        "Nuit à la conversion et au classement. Rappel légal : pour une vente à distance à un particulier UE, le droit de rétractation de 14 jours s'applique en principe même si l'annonce indique « pas de retour ».");
      penalize("avertissement");
    } else {
      addFinding(findings, "info", "Politique de retour définie", `Retours : ${data.returns || "non renseigné"}.`);
    }

    // ---------- GPSR ----------
    if (RULES.gpsrCategories.includes(data.category)) {
      if (!data.gpsrManufacturer || !data.gpsrResponsible || !data.gpsrWarnings) {
        const missing = [];
        if (!data.gpsrManufacturer) missing.push("coordonnées fabricant");
        if (!data.gpsrResponsible) missing.push("personne responsable UE");
        if (!data.gpsrWarnings) missing.push("avertissements de sécurité");
        addFinding(findings, "bloquant", "Informations GPSR incomplètes",
          `Catégorie « ${data.category} » soumise au règlement GPSR (obligatoire depuis le 13/12/2024). Manque : ${missing.join(", ")}. eBay supprime les annonces non conformes et peut restreindre le compte.`);
        penalize("bloquant");
      } else {
        addFinding(findings, "info", "Conformité GPSR renseignée", "Fabricant, personne responsable UE et avertissements sécurité indiqués.");
      }
    }

    // ---------- ITEM SPECIFICS ----------
    const specifics = parseInt(data.specificsFilled, 10) || 0;
    const specificsTotal = parseInt(data.specificsTotal, 10) || 0;
    if (specificsTotal > 0) {
      const ratio = specifics / specificsTotal;
      if (ratio < 0.7) {
        addFinding(findings, "avertissement", "Caractéristiques (Item Specifics) incomplètes",
          `${specifics}/${specificsTotal} champs remplis. Ce sont des facteurs de classement Cassini importants : complétez-en un maximum (marque, couleur, matière, EAN/GTIN...).`);
        penalize("avertissement");
      } else {
        addFinding(findings, "info", "Caractéristiques bien renseignées", `${specifics}/${specificsTotal} champs remplis.`);
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let verdict;
    if (score >= 90) verdict = { label: "Excellent — prête à publier", cls: "ok" };
    else if (score >= 70) verdict = { label: "Bon niveau — quelques réglages à faire", cls: "warn" };
    else if (score >= 50) verdict = { label: "Risques significatifs — corrigez avant publication", cls: "warn" };
    else verdict = { label: "Ne publiez pas en l'état", cls: "bad" };

    const order = { bloquant: 0, avertissement: 1, info: 2 };
    findings.sort((a, b) => order[a.severity] - order[b.severity]);

    return { score, verdict, findings };
  }

  return { run };
})();
