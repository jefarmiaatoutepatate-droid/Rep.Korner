/**
 * Recherche d'aliments à 3 niveaux (§4) :
 *   1. Cache local SQLite + fuzzy (fuse.js)  → instantané
 *   2. OpenFoodFacts (base FR)                → macros/100g
 *   3. Fallback Claude via mini-backend proxy → plats maison / introuvables
 * La clé API Claude n'est JAMAIS dans l'app : on passe par un Cloudflare Worker.
 */
import Fuse from 'fuse.js';
import Constants from 'expo-constants';
import type { Food, MacroEstimate } from '@/types';
import { searchFoods } from '@/db/repositories';
import { parseQuickAdd } from '@/lib/parse';

export { parseQuickAdd } from '@/lib/parse';
export type { ParsedItem } from '@/lib/parse';

export interface FoodSuggestion {
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  source: Food['source'];
}

/** Niveau 1 — cache local avec tri fuzzy. */
export async function searchLocal(term: string): Promise<Food[]> {
  const rows = await searchFoods(term, 50);
  if (rows.length <= 1 || term.trim().length < 2) return rows;
  const fuse = new Fuse(rows, { keys: ['name'], threshold: 0.4, ignoreLocation: true });
  const ranked = fuse.search(term).map((r) => r.item);
  return ranked.length ? ranked : rows;
}

/** Niveau 2 — OpenFoodFacts. Retourne les meilleurs matchs pour 100 g. */
export async function searchOpenFoodFacts(term: string, max = 3): Promise<FoodSuggestion[]> {
  const url =
    `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(term)}` +
    `&fields=product_name,nutriments&lang=fr&page_size=15`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FitCoach/1.0 (personal app)' } });
  if (!res.ok) throw new Error(`OpenFoodFacts ${res.status}`);
  const data = (await res.json()) as { products?: OFFProduct[] };

  const out: FoodSuggestion[] = [];
  for (const p of data.products ?? []) {
    const n = p.nutriments;
    const kcal = n?.['energy-kcal_100g'];
    if (!p.product_name || kcal == null || kcal <= 0) continue;
    out.push({
      name: p.product_name,
      kcal_per_100g: round1(kcal),
      protein_per_100g: round1(n?.proteins_100g ?? 0),
      carbs_per_100g: round1(n?.carbohydrates_100g ?? 0),
      fat_per_100g: round1(n?.fat_100g ?? 0),
      source: 'openfoodfacts',
    });
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Niveau 3 — fallback Claude via le Worker proxy.
 * Le Worker attend { food, quantity_g } et renvoie l'estimation JSON stricte.
 */
export async function estimateWithClaude(food: string, quantityG: number): Promise<MacroEstimate | null> {
  const base = (Constants.expoConfig?.extra as { claudeProxyUrl?: string } | undefined)?.claudeProxyUrl;
  if (!base || base.includes('YOUR-WORKER')) {
    return null; // proxy non configuré → on n'appelle pas
  }
  const res = await fetch(`${base}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ food, quantity_g: quantityG }),
  });
  if (!res.ok) throw new Error(`Proxy Claude ${res.status}`);
  const json = (await res.json()) as MacroEstimate;
  return json;
}

/** Ré-export pour compat : le parsing pur vit dans src/lib/parse.ts. */
void parseQuickAdd;

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

interface OFFProduct {
  product_name?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}
