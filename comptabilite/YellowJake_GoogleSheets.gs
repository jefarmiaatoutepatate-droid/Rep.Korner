/**
 * YELLOW JAKE — boutons en un clic et facturation automatique (Google Sheets)
 *
 * Installation (une seule fois) :
 *  1. Dépose Yellow_Jake_Compta.xlsx dans Google Drive, ouvre-le avec Google Sheets,
 *     puis Fichier > Enregistrer au format Google Sheets (ouvre la copie Google Sheets).
 *  2. Extensions > Apps Script : efface le contenu, colle tout ce fichier, clique sur 💾 Enregistrer.
 *  3. Reviens sur le tableur et recharge la page (F5).
 *  4. Menu « 🍺 Yellow Jake » > « Autoriser le script » : accepte les autorisations Google.
 *
 * Ensuite, un seul clic sur une case-bouton suffit :
 *  - boutons de l'Accueil et « ⬅ Accueil » : ouvrent l'onglet ;
 *  - FACTURER (onglet Vente) : enregistre la vente dans l'Historique et vide le formulaire ;
 *  - EFFACER : vide le formulaire ;
 *  - ARCHIVER LA SEMAINE (Historique) : 2 clics à la suite pour confirmer.
 */
const H0 = 7, HMAX = 506, AMAX = 2006;

const PAGES = {
  'VENTE': 'Vente', 'HISTORIQUE': 'Historique Semaine', 'STATISTIQUE': 'Statistique',
  'ARCHIVE': 'Archive', 'PRODUCTION': 'Production', 'STOCK': 'Stock', 'SALAIRES': 'Salaires',
  'COFFRE': 'Coffre', 'EFFECTIF': 'Effectif', 'CATALOGUE': 'Catalogue', 'RECETTES': 'Recettes',
  'MATIÈRES': 'Matières', 'PARAMÈTRES': 'Paramètres'
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const nav = ui.createMenu('Aller à…');
  Object.keys(PAGES).forEach(k => nav.addItem(PAGES[k], 'menu_' + k.normalize('NFD').replace(/[̀-ͯ]/g, '')));
  ui.createMenu('🍺 Yellow Jake')
    .addItem('Facturer', 'facturer')
    .addItem('Effacer le formulaire', 'effacer')
    .addSeparator()
    .addItem('Archiver la semaine', 'archiverSemaineMenu')
    .addSeparator()
    .addSubMenu(nav)
    .addItem('Autoriser le script', 'autoriser')
    .addToUi();
}

// Fonctions de menu (une par onglet)
function menu_VENTE() { aller_('Vente'); }
function menu_HISTORIQUE() { aller_('Historique Semaine'); }
function menu_STATISTIQUE() { aller_('Statistique'); }
function menu_ARCHIVE() { aller_('Archive'); }
function menu_PRODUCTION() { aller_('Production'); }
function menu_STOCK() { aller_('Stock'); }
function menu_SALAIRES() { aller_('Salaires'); }
function menu_COFFRE() { aller_('Coffre'); }
function menu_EFFECTIF() { aller_('Effectif'); }
function menu_CATALOGUE() { aller_('Catalogue'); }
function menu_RECETTES() { aller_('Recettes'); }
function menu_MATIERES() { aller_('Matières'); }
function menu_PARAMETRES() { aller_('Paramètres'); }

function autoriser() {
  toast_('Script autorisé : les boutons sont actifs.', '✅ Yellow Jake');
}

/** Un seul clic sur une case-bouton déclenche l'action. */
function onSelectionChange(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const txt = String(range.getCell(1, 1).getDisplayValue()).trim();
  if (!txt) return;
  const page = sheet.getName();

  if (txt === '⬅ Accueil') return aller_('Accueil', sheet);

  if (page === 'Accueil') {
    const i = txt.indexOf(' ');
    if (i < 0) return;
    const cible = PAGES[txt.slice(i + 1).toUpperCase()];
    if (cible) aller_(cible, sheet);
    return;
  }
  if (page === 'Vente' && txt === 'FACTURER') { neutre_(sheet); return facturer(); }
  if (page === 'Vente' && txt === 'EFFACER') { neutre_(sheet); return effacer(); }
  if (page === 'Historique Semaine' && txt === 'ARCHIVER LA SEMAINE') { neutre_(sheet); return archiverAvecDoubleClic_(); }
}

/** Remet la sélection hors du bouton pour pouvoir recliquer dessus. */
function neutre_(sheet) {
  sheet.getRange('A1').activate();
}

function aller_(nom, depuis) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(nom);
  if (!sh) return;
  if (depuis) neutre_(depuis);
  ss.setActiveSheet(sh);
  sh.getRange('A1').activate();
}

function toast_(msg, titre) {
  SpreadsheetApp.getActive().toast(msg, titre || '🍺 Yellow Jake', 8);
}

function facturer() {
  const ss = SpreadsheetApp.getActive();
  const v = ss.getSheetByName('Vente');
  const h = ss.getSheetByName('Historique Semaine');
  const vendeur = v.getRange('E7').getValue();
  const produit = v.getRange('G7').getValue();
  const date = v.getRange('I7').getValue();
  const qte = v.getRange('C12').getValue();
  const client = v.getRange('E12').getValue();
  const stock = v.getRange('K17').getValue();

  if (!vendeur) return toast_('Choisis le nom du vendeur.', '⚠️ Facture incomplète');
  if (!produit) return toast_('Choisis le produit.', '⚠️ Facture incomplète');
  if (typeof qte !== 'number' || qte <= 0) return toast_('Indique une quantité supérieure à 0.', '⚠️ Facture incomplète');
  if (!(date instanceof Date)) return toast_('Date de vente invalide.', '⚠️ Facture incomplète');

  const col = h.getRange(H0, 6, HMAX - H0 + 1, 1).getValues();
  const i = col.findIndex(r => r[0] === '');
  if (i < 0) return toast_("L'historique est plein : archive la semaine.", '⚠️ Yellow Jake');
  const row = H0 + i;

  h.getRange(row, 3, 1, 4).setValues([[date, vendeur, client, produit]]);
  h.getRange(row, 8).setValue(qte);
  SpreadsheetApp.flush();

  const vals = h.getRange(row, 9, 1, 4).getValues()[0]; // prix, bénéfice, coût, prime
  const fmt = n => (typeof n === 'number' ? n.toFixed(2) : n) + ' $';
  let msg = `${qte} × ${produit} (vendeur : ${vendeur}) — prix ${fmt(vals[0])}, bénéfice ${fmt(vals[1])}, prime ${fmt(vals[3])}`;
  if (typeof stock === 'number' && qte > stock) msg += `   ⚠️ Stock insuffisant (${stock} disponible)`;
  toast_(msg, `✅ Vente n° ${row - H0 + 1} enregistrée`);
  effacer(true);
}

function effacer(silencieux) {
  const v = SpreadsheetApp.getActive().getSheetByName('Vente');
  ['E7', 'G7', 'C12', 'E12'].forEach(a => v.getRange(a).clearContent());
  v.getRange('I7').setFormula('=TODAY()');
  if (silencieux !== true) toast_('Formulaire vidé.');
}

/** Depuis une case-bouton : 1er clic = demande, 2e clic dans les 15 s = archive. */
function archiverAvecDoubleClic_() {
  const cache = CacheService.getDocumentCache();
  if (cache.get('archiver') === 'oui') {
    cache.remove('archiver');
    return archiver_();
  }
  cache.put('archiver', 'oui', 15);
  toast_("Clique encore une fois sur ARCHIVER LA SEMAINE (dans les 15 s) pour confirmer.", '🗄️ Archivage');
}

function archiverSemaineMenu() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert("Copier les ventes de la semaine dans l'Archive puis vider l'Historique ?",
               ui.ButtonSet.YES_NO) === ui.Button.YES) archiver_();
}

function archiver_() {
  const ss = SpreadsheetApp.getActive();
  const h = ss.getSheetByName('Historique Semaine');
  const a = ss.getSheetByName('Archive');
  const rows = h.getRange(H0, 3, HMAX - H0 + 1, 10).getValues().filter(r => r[3] !== '');
  if (!rows.length) return toast_('Aucune vente à archiver.');
  const colA = a.getRange(H0, 6, AMAX - H0 + 1, 1).getValues();
  const i = colA.findIndex(r => r[0] === '');
  if (i < 0 || i + rows.length > colA.length) return toast_("L'archive est pleine.", '⚠️ Yellow Jake');
  a.getRange(H0 + i, 3, rows.length, 10).setValues(rows);
  h.getRange(H0, 3, HMAX - H0 + 1, 4).clearContent();
  h.getRange(H0, 8, HMAX - H0 + 1, 1).clearContent();
  toast_(`${rows.length} vente(s) archivée(s). Nouvelle semaine prête.`, '🗄️ Archivage');
}
