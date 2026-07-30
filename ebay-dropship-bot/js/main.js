/* ==========================================================================
   MAIN.JS — Navigation, formulaires, persistance locale
   ========================================================================== */

const CATEGORIES = RULES.categories;
const CONDITIONS = RULES.conditions;

const STORAGE_KEY = "ebayDropshipCopilot.v1";

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { audits: [], descriptions: 0, niches: 0 };
  } catch (e) {
    return { audits: [], descriptions: 0, niches: 0 };
  }
}
function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  populateSelects();
  initAudit();
  initGenerator();
  initSourcing();
  initKnowledgeBase();
  refreshDashboard();
});

/* ---------------- Tabs ---------------- */
function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "dashboard") refreshDashboard();
    });
  });
}

/* ---------------- Populate <select> ---------------- */
function populateSelects() {
  ["a-category", "g-category"].forEach(id => {
    const sel = document.getElementById(id);
    CATEGORIES.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", () => {
      if (id === "a-category") toggleGpsrFieldset();
    });
  });

  const condSel = document.getElementById("g-condition");
  CONDITIONS.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.value; opt.textContent = c.label;
    condSel.appendChild(opt);
  });

  toggleGpsrFieldset();
}

function toggleGpsrFieldset() {
  const cat = document.getElementById("a-category").value;
  const fieldset = document.getElementById("gpsr-fieldset");
  const applicable = RULES.gpsrCategories.includes(cat);
  fieldset.style.opacity = applicable ? "1" : "0.45";
  fieldset.querySelectorAll("input").forEach(i => i.disabled = !applicable);
}

/* ---------------- Audit ---------------- */
function initAudit() {
  const form = document.getElementById("audit-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: val("a-title"),
      description: val("a-description"),
      category: val("a-category"),
      brand: val("a-brand"),
      photoCount: val("a-photos"),
      photoHighRes: document.getElementById("a-photohighres").checked,
      returns: val("a-returns"),
      shipFrom: val("a-shipfrom"),
      declaredDelay: val("a-declared-delay"),
      supplierDelay: val("a-supplier-delay"),
      specificsFilled: val("a-specifics-filled"),
      specificsTotal: val("a-specifics-total"),
      gpsrManufacturer: document.getElementById("a-gpsr-manufacturer").checked,
      gpsrResponsible: document.getElementById("a-gpsr-responsible").checked,
      gpsrWarnings: document.getElementById("a-gpsr-warnings").checked
    };
    const result = Audit.run(data);
    renderAuditResult(result, data.title);

    const store = loadStore();
    store.audits.unshift({ date: new Date().toISOString(), title: data.title || "(sans titre)", score: result.score, cls: result.verdict.cls });
    store.audits = store.audits.slice(0, 25);
    saveStore(store);
    refreshDashboard();
  });

  document.getElementById("audit-reset").addEventListener("click", () => {
    form.reset();
    document.getElementById("audit-result").classList.add("hidden");
    toggleGpsrFieldset();
  });
}

function renderAuditResult(result, title) {
  const box = document.getElementById("audit-result");
  box.classList.remove("hidden");

  const findingsHtml = result.findings.map(f => `
    <div class="finding ${f.severity}">
      <div class="finding-title"><span class="badge ${f.severity}">${f.severity}</span> ${escapeHtml(f.title)}</div>
      <div class="finding-detail">${escapeHtml(f.detail)}</div>
    </div>`).join("");

  box.innerHTML = `
    <div class="score-header ${result.verdict.cls}">
      <div class="score-num">${result.score}/100</div>
      <div>
        <div style="font-weight:700;">${escapeHtml(result.verdict.label)}</div>
        <div style="font-size:13px;color:var(--text-muted);">${escapeHtml(title || "Annonce sans titre")}</div>
      </div>
    </div>
    ${findingsHtml}
  `;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------------- Generator ---------------- */
function initGenerator() {
  const form = document.getElementById("gen-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const shipfromMap = { france: "notre entrepôt en France", ue: "notre entrepôt en Union Européenne", asie: "notre partenaire logistique international" };
    const condSel = document.getElementById("g-condition");
    const data = {
      name: val("g-name"),
      brand: val("g-brand"),
      model: val("g-model"),
      category: val("g-category"),
      conditionLabel: condSel.options[condSel.selectedIndex] ? condSel.options[condSel.selectedIndex].textContent : "",
      color: val("g-color"),
      material: val("g-material"),
      shipFromLabel: shipfromMap[val("g-shipfrom")],
      declaredDelay: val("g-delay"),
      highlights: val("g-highlights"),
      boxContents: val("g-contents"),
      warranty: val("g-warranty")
    };
    const result = Generator.generate(data);
    renderGeneratorResult(result);

    const store = loadStore();
    store.descriptions = (store.descriptions || 0) + 1;
    saveStore(store);
    refreshDashboard();
  });

  document.getElementById("gen-reset").addEventListener("click", () => {
    form.reset();
    document.getElementById("gen-result").classList.add("hidden");
  });
}

function renderGeneratorResult(result) {
  const box = document.getElementById("gen-result");
  box.classList.remove("hidden");

  const titlesHtml = result.titles.map(t => `
    <div class="title-variant">
      <span>${escapeHtml(t)}</span>
      <span class="char-count">${t.length}/80 <button type="button" class="btn-copy" data-copy="${escapeAttr(t)}">Copier</button></span>
    </div>`).join("");

  const specificsHtml = result.specifics.map(s => `<span>${escapeHtml(s)}</span>`).join("");

  box.innerHTML = `
    <h3>Titres suggérés</h3>
    ${titlesHtml}

    <h3 style="margin-top:22px;">Description HTML (aperçu)</h3>
    <div class="desc-preview">${result.descriptionHtml}</div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 6px 0;">
      <strong style="font-size:13.5px;">Code source HTML à coller dans eBay</strong>
      <button type="button" class="btn-copy" id="copy-desc-html">Copier le HTML</button>
    </div>
    <textarea class="desc-source" readonly id="desc-source-textarea">${escapeHtml(result.descriptionHtml)}</textarea>

    <h3 style="margin-top:22px;">Caractéristiques (Item Specifics) à renseigner</h3>
    <div class="specifics-list">${specificsHtml}</div>
  `;

  box.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => copyToClipboard(btn.dataset.copy, btn));
  });
  document.getElementById("copy-desc-html").addEventListener("click", (e) => {
    copyToClipboard(result.descriptionHtml, e.target);
  });

  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function copyToClipboard(text, btn) {
  const done = () => {
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = "Copié !";
    setTimeout(() => { btn.textContent = original; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* noop */ }
  document.body.removeChild(ta);
  if (cb) cb();
}

/* ---------------- Sourcing ---------------- */
let lastMarginPct = null;

function initSourcing() {
  const accountSel = document.getElementById("m-account");
  const proRateField = document.getElementById("m-prorate-field");
  const toggleProRate = () => { proRateField.style.display = accountSel.value === "professionnel" ? "flex" : "none"; };
  accountSel.addEventListener("change", toggleProRate);
  toggleProRate();

  document.getElementById("margin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = {
      accountType: val("m-account"),
      proRate: val("m-prorate"),
      sellPrice: val("m-sellprice"),
      shippingCharged: val("m-shipcharged"),
      productCost: val("m-productcost"),
      supplierShipping: val("m-suppliershipping"),
      adSpendPct: val("m-adspend"),
      miscPct: val("m-misc")
    };
    const r = Sourcing.margin(input);
    lastMarginPct = r.netMarginPct;
    renderMarginResult(r);
    document.getElementById("n-sellprice").value = input.sellPrice;
  });

  document.getElementById("niche-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = {
      trend: val("n-trend"),
      competition: val("n-competition"),
      weight: val("n-weight"),
      solvesProblem: val("n-solves"),
      easilyFoundLocally: val("n-local"),
      legalRisk: val("n-legal"),
      reliableSupplier: val("n-supplier"),
      sellPrice: val("n-sellprice"),
      marginPct: lastMarginPct
    };
    const r = Sourcing.nicheScore(input);
    renderNicheResult(r);

    const store = loadStore();
    store.niches = (store.niches || 0) + 1;
    saveStore(store);
    refreshDashboard();
  });
}

function renderMarginResult(r) {
  const box = document.getElementById("margin-result");
  box.classList.remove("hidden");
  box.innerHTML = `
    <div class="score-header ${r.verdict.cls}">
      <div class="score-num">${r.netMarginPct.toFixed(1)}%</div>
      <div>
        <div style="font-weight:700;">${escapeHtml(r.verdict.label)}</div>
        <div style="font-size:13px;color:var(--text-muted);">Marge nette : ${r.netMargin.toFixed(2)} €</div>
      </div>
    </div>
    <div class="margin-summary">
      <div><span>Chiffre d'affaires total</span><strong>${r.totalRevenue.toFixed(2)} €</strong></div>
      <div><span>Frais eBay estimés</span><strong>${r.ebayFees.toFixed(2)} €</strong></div>
      <div><span>Budget pub</span><strong>${r.adSpend.toFixed(2)} €</strong></div>
      <div><span>Frais divers / retours</span><strong>${r.misc.toFixed(2)} €</strong></div>
      <div><span>Coût total (produit + frais)</span><strong>${r.totalCost.toFixed(2)} €</strong></div>
      <div><span>Marge nette</span><strong>${r.netMargin.toFixed(2)} €</strong></div>
    </div>
  `;
}

function renderNicheResult(r) {
  const box = document.getElementById("niche-result");
  box.classList.remove("hidden");
  box.innerHTML = `
    <div class="score-header ${r.verdict.cls}">
      <div class="score-num">${r.score}/100</div>
      <div><div style="font-weight:700;">${escapeHtml(r.verdict.label)}</div></div>
    </div>
    <ul class="notes-list">${r.notes.map(n => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
  `;
}

/* ---------------- Knowledge base ---------------- */
function initKnowledgeBase() {
  document.getElementById("kb-date").textContent = RULES.meta.lastReviewed;
  const list = document.getElementById("knowledge-list");
  RULES.knowledgeBase.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "accordion-item" + (idx === 0 ? " open" : "");
    el.innerHTML = `
      <button type="button" class="accordion-header">
        <span>${escapeHtml(item.title)}</span>
        <span class="chevron">▶</span>
      </button>
      <div class="accordion-body"><p>${escapeHtml(item.body)}</p></div>
    `;
    el.querySelector(".accordion-header").addEventListener("click", () => {
      el.classList.toggle("open");
    });
    list.appendChild(el);
  });

  const note = document.createElement("p");
  note.className = "hint";
  note.style.marginTop = "10px";
  note.textContent = RULES.meta.disclaimer;
  document.getElementById("panel-knowledge").appendChild(note);
}

/* ---------------- Dashboard ---------------- */
function refreshDashboard() {
  const store = loadStore();
  document.getElementById("stat-audits").textContent = store.audits.length;
  document.getElementById("stat-descriptions").textContent = store.descriptions || 0;
  document.getElementById("stat-niches").textContent = store.niches || 0;

  const avg = store.audits.length
    ? Math.round(store.audits.reduce((s, a) => s + a.score, 0) / store.audits.length)
    : null;
  document.getElementById("stat-avgscore").textContent = avg === null ? "—" : avg + "/100";

  const recent = document.getElementById("recent-audits");
  if (!store.audits.length) {
    recent.innerHTML = "";
    recent.classList.add("empty-state");
    recent.textContent = "Aucun audit pour le moment.";
  } else {
    recent.classList.remove("empty-state");
    recent.innerHTML = store.audits.slice(0, 8).map(a => `
      <div class="recent-audit-row">
        <span>${escapeHtml(a.title)} <span style="color:var(--text-muted);font-size:12px;">${new Date(a.date).toLocaleDateString("fr-FR")}</span></span>
        <span class="recent-score ${a.cls}">${a.score}/100</span>
      </div>
    `).join("");
  }
}

/* ---------------- Utils ---------------- */
function val(id) { return document.getElementById(id).value; }
function escapeHtml(str) {
  return (str == null ? "" : String(str)).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function escapeAttr(str) { return escapeHtml(str).replace(/'/g, "&#39;"); }
