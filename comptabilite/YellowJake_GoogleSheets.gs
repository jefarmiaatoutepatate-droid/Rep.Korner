/**
 * YELLOW JAKE — boutons et facturation automatique (Google Sheets)
 *
 * Installation (une seule fois) :
 *  1. Importe Yellow_Jake_Compta.xlsx dans Google Drive, ouvre-le, puis
 *     Fichier > Enregistrer au format Google Sheets.
 *  2. Extensions > Apps Script : efface tout, colle ce fichier, clique sur Enregistrer (disquette).
 *  3. Recharge la page du tableur. Un menu « 🍺 Yellow Jake » apparaît :
 *     lance une fois « Facturer » depuis ce menu et accepte les autorisations.
 *
 * Ensuite : un clic sur un bouton de l'Accueil (ou « ⬅ Accueil ») ouvre l'onglet,
 * un clic sur FACTURER enregistre la vente dans l'Historique, un clic sur EFFACER vide le formulaire.
 */
const H0 = 7, HMAX = 506, AMAX = 2006;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🍺 Yellow Jake')
    .addItem('Facturer', 'facturer')
    .addItem('Effacer le formulaire', 'effacer')
    .addSeparator()
    .addItem('Archiver la semaine', 'archiverSemaine')
    .addToUi();
}

/** Un seul clic sur une case-bouton suffit. */
function onSelectionChange(e) {
  const cell = e.range.getCell(1, 1);
  const f = cell.getFormula();
  const txt = String(cell.getDisplayValue());
  const sheet = cell.getSheet().getName();
  if (f.indexOf('HYPERLINK("#') >= 0) {
    if (txt === 'FACTURER') { facturer(); return; }
    const m = f.match(/#'?([^'!]+)'?!/);
    if (m) aller_(m[1]);
    return;
  }
  if (sheet === 'Vente' && txt === 'EFFACER') effacer();
}

function aller_(nom) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(nom);
  if (!sh) return;
  ss.setActiveSheet(sh);
  sh.getRange('A1').activate();
}

function toast_(msg, titre) {
  SpreadsheetApp.getActive().toast(msg, titre || '🍺 Yellow Jake', 6);
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
  if (i < 0) return toast_("L'historique est plein : archive la semaine.", '⚠️');
  const row = H0 + i;

  h.getRange(row, 3, 1, 4).setValues([[date, vendeur, client, produit]]);
  h.getRange(row, 8).setValue(qte);
  SpreadsheetApp.flush();

  const [prix, benef, , prime] = [h.getRange(row, 9).getValue(), h.getRange(row, 10).getValue(),
                                   null, h.getRange(row, 12).getValue()];
  const fmt = n => (typeof n === 'number' ? n.toFixed(2) : n) + ' $';
  let msg = `${qte} × ${produit} — prix ${fmt(prix)}, bénéfice ${fmt(benef)}, prime ${fmt(prime)}`;
  if (typeof stock === 'number' && qte > stock) msg += `  ⚠️ Stock insuffisant (${stock} dispo)`;
  toast_(msg, `✅ Vente n° ${row - H0 + 1} enregistrée`);
  effacer(true);
}

function effacer(silencieux) {
  const v = SpreadsheetApp.getActive().getSheetByName('Vente');
  ['E7', 'G7', 'C12', 'E12'].forEach(a => v.getRange(a).clearContent());
  v.getRange('I7').setFormula('=TODAY()');
  v.getRange('E7').activate();
  if (silencieux !== true) toast_('Formulaire vidé.');
}

function archiverSemaine() {
  const ss = SpreadsheetApp.getActive();
  const ui = SpreadsheetApp.getUi();
  const h = ss.getSheetByName('Historique Semaine');
  const a = ss.getSheetByName('Archive');
  const rows = h.getRange(H0, 3, HMAX - H0 + 1, 10).getValues().filter(r => r[3] !== '');
  if (!rows.length) return ui.alert('Aucune vente à archiver.');
  if (ui.alert(`${rows.length} vente(s) vont être copiées dans l'Archive puis l'historique sera vidé. Continuer ?`,
               ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  const colA = a.getRange(H0, 6, AMAX - H0 + 1, 1).getValues();
  const i = colA.findIndex(r => r[0] === '');
  if (i < 0 || i + rows.length > colA.length) return ui.alert("L'archive est pleine.");
  a.getRange(H0 + i, 3, rows.length, 10).setValues(rows);
  h.getRange(H0, 3, HMAX - H0 + 1, 4).clearContent();
  h.getRange(H0, 8, HMAX - H0 + 1, 1).clearContent();
  ui.alert(`${rows.length} vente(s) archivée(s). Nouvelle semaine prête.`);
}
