/* ==========================================================================
   GENERATOR.JS — Générateur de titres & descriptions pro (HTML compatible eBay)
   ========================================================================== */

const Generator = (() => {

  function truncateToLength(str, maxLen) {
    if (str.length <= maxLen) return str;
    const cut = str.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
  }

  function buildTitles(d) {
    const parts = {
      brand: d.brand ? d.brand.trim() : "",
      name: d.name ? d.name.trim() : "",
      model: d.model ? d.model.trim() : "",
      color: d.color ? d.color.trim() : "",
      material: d.material ? d.material.trim() : "",
      condition: d.conditionLabel || ""
    };

    const variantA = [parts.brand, parts.name, parts.model, parts.color, parts.condition]
      .filter(Boolean).join(" ");
    const variantB = [parts.name, parts.brand, parts.model, parts.material, parts.color]
      .filter(Boolean).join(" ");
    const variantC = [parts.brand, parts.model, parts.name, parts.condition, parts.color, "Livraison rapide"]
      .filter(Boolean).join(" ");

    return [variantA, variantB, variantC]
      .map(t => truncateToLength(t.replace(/\s+/g, " ").trim(), RULES.title.maxLength))
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
  }

  function escapeHtml(str) {
    return (str || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function linesToList(text) {
    return (text || "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `<li style="margin:0 0 8px 0;">${escapeHtml(l)}</li>`)
      .join("");
  }

  function buildDescriptionHtml(d) {
    const highlights = linesToList(d.highlights);
    const contents = linesToList(d.boxContents);
    const isGpsr = RULES.gpsrCategories.includes(d.category);

    const specsRows = [
      ["Marque", d.brand],
      ["Modèle / Compatibilité", d.model],
      ["Couleur", d.color],
      ["Matière", d.material],
      ["État", d.conditionLabel]
    ].filter(([, v]) => v).map(([k, v]) =>
      `<tr><td style="padding:6px 10px;border:1px solid #e2e2e2;background:#fafafa;font-weight:600;">${escapeHtml(k)}</td><td style="padding:6px 10px;border:1px solid #e2e2e2;">${escapeHtml(v)}</td></tr>`
    ).join("");

    const gpsrBlock = isGpsr ? `
  <div style="border:1px solid #e2b93b;background:#fff8e1;padding:14px 16px;border-radius:6px;margin:18px 0;">
    <p style="margin:0 0 6px 0;font-weight:700;">Informations de sécurité (GPSR)</p>
    <p style="margin:0;font-size:14px;line-height:1.5;">
      Fabricant : [nom et adresse à compléter]<br>
      Personne responsable UE : [nom, adresse et email à compléter si fabricant hors UE]<br>
      Avertissements de sécurité : [à compléter selon le produit — tranche d'âge, mise en garde, etc.]
    </p>
  </div>` : "";

    return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:0 auto;color:#222;line-height:1.6;">
  <h2 style="font-size:22px;margin:0 0 4px 0;">${escapeHtml(d.name || "Nom du produit")}</h2>
  <p style="margin:0 0 18px 0;color:#555;">${escapeHtml(d.conditionLabel || "")}</p>

  ${highlights ? `<h3 style="font-size:17px;border-bottom:2px solid #222;padding-bottom:4px;">Points forts</h3>
  <ul style="padding-left:18px;margin:10px 0 20px 0;">${highlights}</ul>` : ""}

  ${specsRows ? `<h3 style="font-size:17px;border-bottom:2px solid #222;padding-bottom:4px;">Caractéristiques</h3>
  <table style="border-collapse:collapse;width:100%;margin:10px 0 20px 0;font-size:14px;">${specsRows}</table>` : ""}

  ${contents ? `<h3 style="font-size:17px;border-bottom:2px solid #222;padding-bottom:4px;">Contenu du colis</h3>
  <ul style="padding-left:18px;margin:10px 0 20px 0;">${contents}</ul>` : ""}

  <h3 style="font-size:17px;border-bottom:2px solid #222;padding-bottom:4px;">Livraison</h3>
  <p style="margin:10px 0 20px 0;">Expédition depuis ${escapeHtml(d.shipFromLabel || "notre entrepôt")}. Délai de livraison estimé : ${escapeHtml(d.declaredDelay || "-")} jours ouvrés. Numéro de suivi fourni dès l'expédition.</p>

  <h3 style="font-size:17px;border-bottom:2px solid #222;padding-bottom:4px;">Garantie &amp; Service Client</h3>
  <p style="margin:10px 0 20px 0;">${escapeHtml(d.warranty || "Satisfait ou remboursé selon la politique de retour de l'annonce. Notre service client répond via la messagerie eBay sous 24h.")}</p>
  ${gpsrBlock}
  <p style="font-size:12px;color:#888;margin-top:24px;">Photos contractuelles. N'hésitez pas à nous contacter via la messagerie eBay pour toute question avant achat.</p>
</div>`;
  }

  function suggestedSpecifics(d) {
    const base = ["Marque", "Type", "Couleur", "Matière", "Modèle / Référence compatible", "EAN/GTIN (si disponible)", "Pays de fabrication"];
    if (RULES.gpsrCategories.includes(d.category)) base.push("Personne responsable UE (champ conformité)");
    return base;
  }

  function generate(d) {
    return {
      titles: buildTitles(d),
      descriptionHtml: buildDescriptionHtml(d),
      specifics: suggestedSpecifics(d)
    };
  }

  return { generate };
})();
