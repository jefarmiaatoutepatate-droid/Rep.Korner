import {
  computeMacros,
  sumMacros,
  isEnergyConsistent,
  progress,
  pct,
  remaining,
  round,
} from '@/lib/macros';

describe('round', () => {
  it('arrondit à l\'entier par défaut', () => {
    expect(round(2449.6)).toBe(2450);
    expect(round(2449.4)).toBe(2449);
  });
  it('gère les décimales', () => {
    expect(round(12.345, 1)).toBe(12.3);
    expect(round(12.35, 1)).toBe(12.4);
  });
});

describe('computeMacros', () => {
  const rizPer100g = {
    kcal_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28,
    fat_per_100g: 0.3,
  };

  it('calcule (macros/100g) × quantité — riz basmati cuit 80g', () => {
    const m = computeMacros(rizPer100g, 80);
    expect(m.kcal).toBe(104); // 130 * 0.8
    expect(m.protein_g).toBe(2.2); // 2.7 * 0.8 = 2.16 -> 2.2
    expect(m.carbs_g).toBe(22.4);
    expect(m.fat_g).toBe(0.2);
  });

  it('poulet grillé 180g', () => {
    const poulet = {
      kcal_per_100g: 165,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
    };
    const m = computeMacros(poulet, 180);
    expect(m.kcal).toBe(297);
    expect(m.protein_g).toBe(55.8);
    expect(m.carbs_g).toBe(0);
    expect(m.fat_g).toBe(6.5); // 3.6*1.8=6.48 -> 6.5
  });

  it('quantité 0 → tout à zéro', () => {
    expect(computeMacros(rizPer100g, 0)).toEqual({
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
  });
});

describe('sumMacros', () => {
  it('additionne plusieurs portions', () => {
    const total = sumMacros([
      { kcal: 100, protein_g: 10, carbs_g: 5, fat_g: 2 },
      { kcal: 200, protein_g: 20, carbs_g: 15, fat_g: 8 },
    ]);
    expect(total).toEqual({ kcal: 300, protein_g: 30, carbs_g: 20, fat_g: 10 });
  });
  it('liste vide → zéro', () => {
    expect(sumMacros([])).toEqual({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  });
});

describe('isEnergyConsistent', () => {
  it('valide un aliment cohérent (4/4/9)', () => {
    // 31*4 + 0*4 + 3.6*9 = 124 + 32.4 = 156.4 ≈ 165 (ratio 0.95)
    expect(
      isEnergyConsistent({
        kcal_per_100g: 165,
        protein_per_100g: 31,
        carbs_per_100g: 0,
        fat_per_100g: 3.6,
      }),
    ).toBe(true);
  });
  it('rejette une saisie incohérente', () => {
    expect(
      isEnergyConsistent({
        kcal_per_100g: 400,
        protein_per_100g: 5,
        carbs_per_100g: 5,
        fat_per_100g: 1,
      }),
    ).toBe(false);
  });
});

describe('progress / pct / remaining', () => {
  it('progress est capé à 1', () => {
    expect(progress(2450, 2450)).toBe(1);
    expect(progress(3000, 2450)).toBe(1);
    expect(progress(1225, 2450)).toBe(0.5);
  });
  it('progress gère cible nulle', () => {
    expect(progress(100, 0)).toBe(0);
  });
  it('pct n\'est pas capé', () => {
    expect(pct(2700, 2450)).toBe(110);
  });
  it('remaining ne descend pas sous 0', () => {
    expect(remaining(2000, 2450)).toBe(450);
    expect(remaining(2700, 2450)).toBe(0);
  });
});
