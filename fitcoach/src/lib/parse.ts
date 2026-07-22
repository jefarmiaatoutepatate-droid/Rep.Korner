/**
 * Parsing PUR du widget d'ajout rapide (§4). Isolé pour être testable en Node
 * (foodService importe expo-constants, non chargeable hors runtime Expo).
 * Ex : "180g poulet + 100g riz + brocolis" → 3 items.
 */
export interface ParsedItem {
  raw: string;
  name: string;
  quantity_g: number | null;
}

export function parseQuickAdd(input: string): ParsedItem[] {
  // On ne coupe PAS sur la virgule : en français elle sert de séparateur
  // décimal ("1,5 kg"). Séparateurs d'items : +, ;, saut de ligne, " et ".
  return input
    .split(/\s*\+\s*|\s*;\s*|\n|\s+et\s+/i)
    .map((s) => s.trim())
    .filter((s) => /\p{L}/u.test(s)) // au moins une lettre (ignore "", ",", ";"…)
    .map((raw) => {
      const m = raw.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)?\b/i);
      let quantity_g: number | null = null;
      if (m) {
        let val = parseFloat(m[1].replace(',', '.'));
        const unit = (m[2] ?? 'g').toLowerCase();
        if (unit === 'kg' || unit === 'l') val *= 1000;
        quantity_g = val;
      }
      const name = raw
        .replace(/\d+(?:[.,]\d+)?\s*(kg|g|ml|l)?\b/i, '')
        .trim()
        .replace(/^de\s+/i, '');
      return { raw, name: name || raw, quantity_g };
    });
}
