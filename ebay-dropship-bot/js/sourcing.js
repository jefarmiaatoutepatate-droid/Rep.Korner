/* ==========================================================================
   SOURCING.JS — Calculateur de marge & score de viabilité niche
   ========================================================================== */

if (typeof require !== "undefined" && typeof RULES === "undefined") {
  globalThis.RULES = require("./rules.js");
}

const Sourcing = (() => {

  function computeFees(sellPrice, shippingCharged, accountType, proRate) {
    const total = sellPrice + shippingCharged;
    if (accountType === "professionnel") {
      const rate = proRate || RULES.fees.professionnel.commissionRateDefault;
      const commission = total * rate;
      const regOps = total * RULES.fees.professionnel.regOpsRate;
      return commission + regOps + RULES.fees.professionnel.perOrderFee;
    }
    const f = RULES.fees.particulier;
    let commission;
    if (total <= f.commissionThreshold) {
      commission = total * f.commissionLowRate;
    } else {
      commission = f.commissionThreshold * f.commissionLowRate + (total - f.commissionThreshold) * f.commissionHighRate;
    }
    const regOps = total * f.regOpsRate;
    return commission + regOps + f.perOrderFee;
  }

  function margin(input) {
    const sellPrice = parseFloat(input.sellPrice) || 0;
    const shippingCharged = parseFloat(input.shippingCharged) || 0;
    const productCost = parseFloat(input.productCost) || 0;
    const supplierShipping = parseFloat(input.supplierShipping) || 0;
    const adSpendPct = (parseFloat(input.adSpendPct) || 0) / 100;
    const miscPct = (parseFloat(input.miscPct) || 0) / 100;

    const totalRevenue = sellPrice + shippingCharged;
    const ebayFees = computeFees(sellPrice, shippingCharged, input.accountType, parseFloat(input.proRate) / 100);
    const adSpend = totalRevenue * adSpendPct;
    const misc = totalRevenue * miscPct;
    const totalCost = productCost + supplierShipping + ebayFees + adSpend + misc;
    const netMargin = totalRevenue - totalCost;
    const netMarginPct = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

    let verdict;
    if (netMarginPct < 0) verdict = { label: "Perte — ne vendez pas à ce prix", cls: "bad" };
    else if (netMarginPct < 15) verdict = { label: "Marge faible / risquée", cls: "bad" };
    else if (netMarginPct < 30) verdict = { label: "Marge correcte", cls: "warn" };
    else if (netMarginPct < 50) verdict = { label: "Bonne marge", cls: "ok" };
    else verdict = { label: "Excellente marge (vérifiez la cohérence du prix marché)", cls: "ok" };

    return { totalRevenue, ebayFees, adSpend, misc, totalCost, netMargin, netMarginPct, verdict };
  }

  function nicheScore(input) {
    let score = 40; // base
    const notes = [];

    const trendPoints = { baisse: -10, stable: 5, croissance: 15, virale: 20 };
    score += trendPoints[input.trend] || 0;
    notes.push(`Tendance (${input.trend}) : ${trendPoints[input.trend] >= 0 ? "+" : ""}${trendPoints[input.trend] || 0}`);

    const competitionPoints = { saturee: -15, moderee: 5, faible: 15 };
    score += competitionPoints[input.competition] || 0;
    notes.push(`Concurrence (${input.competition}) : ${competitionPoints[input.competition] >= 0 ? "+" : ""}${competitionPoints[input.competition] || 0}`);

    const price = parseFloat(input.sellPrice) || 0;
    if (price >= 15 && price <= 50) { score += 10; notes.push("Prix dans la zone d'achat impulsif (15-50€) : +10"); }

    const weightPoints = { leger: 10, moyen: 0, lourd: -15 };
    score += weightPoints[input.weight] || 0;
    notes.push(`Poids (${input.weight}) : ${weightPoints[input.weight] >= 0 ? "+" : ""}${weightPoints[input.weight] || 0}`);

    if (input.solvesProblem === "oui") { score += 15; notes.push("Résout un problème / effet wow : +15"); }
    if (input.easilyFoundLocally === "oui") { score -= 10; notes.push("Facilement trouvable en magasin local : -10"); }
    else if (input.easilyFoundLocally === "non") { score += 10; notes.push("Peu disponible localement (différenciation) : +10"); }
    if (input.legalRisk === "oui") { score -= 20; notes.push("Risque légal/restriction eBay identifié : -20"); }
    if (input.reliableSupplier === "oui") { score += 10; notes.push("Fournisseur jugé fiable : +10"); }

    if (input.marginPct !== undefined && input.marginPct !== null && !isNaN(input.marginPct)) {
      if (input.marginPct < 15) { score -= 10; notes.push("Marge nette < 15% : -10"); }
      else if (input.marginPct < 30) { score += 5; notes.push("Marge nette 15-30% : +5"); }
      else { score += 15; notes.push("Marge nette > 30% : +15"); }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let verdict;
    if (score >= 75) verdict = { label: "Niche très prometteuse", cls: "ok" };
    else if (score >= 55) verdict = { label: "Niche intéressante, à valider", cls: "warn" };
    else if (score >= 35) verdict = { label: "Risqué — creusez davantage", cls: "warn" };
    else verdict = { label: "Déconseillé en l'état", cls: "bad" };

    return { score, verdict, notes };
  }

  return { margin, nicheScore };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Sourcing;
}
