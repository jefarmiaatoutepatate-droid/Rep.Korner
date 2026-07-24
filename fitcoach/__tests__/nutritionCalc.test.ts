import {
  bmrMifflin,
  activityFactor,
  goalAdjustment,
  suggestGoal,
  computeTargets,
  type ProfileInput,
} from '@/lib/nutritionCalc';

describe('bmrMifflin', () => {
  it('homme (Mifflin-St Jeor)', () => {
    // 10*80 + 6.25*178 - 5*23 + 5 = 1802.5 → 1803
    expect(bmrMifflin('male', 80, 178, 23)).toBe(1803);
  });
  it('femme (−161)', () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 1320.25 → 1320
    expect(bmrMifflin('female', 60, 165, 30)).toBe(1320);
  });
});

describe('activityFactor', () => {
  it('augmente avec les séances', () => {
    expect(activityFactor(0)).toBe(1.2);
    expect(activityFactor(2)).toBe(1.375);
    expect(activityFactor(4)).toBe(1.55);
    expect(activityFactor(6)).toBe(1.725);
    expect(activityFactor(7)).toBe(1.9);
  });
  it('borne les valeurs extrêmes', () => {
    expect(activityFactor(-3)).toBe(1.2);
    expect(activityFactor(99)).toBe(1.9);
  });
});

describe('goalAdjustment', () => {
  it('déficit / surplus / maintien', () => {
    expect(goalAdjustment('lose')).toBeLessThan(0);
    expect(goalAdjustment('gain')).toBeGreaterThan(0);
    expect(goalAdjustment('maintain')).toBe(0);
  });
});

describe('suggestGoal', () => {
  it('déduit l’objectif de l’écart de poids', () => {
    expect(suggestGoal(80, 75)).toBe('lose');
    expect(suggestGoal(70, 78)).toBe('gain');
    expect(suggestGoal(80, 80)).toBe('maintain');
  });
});

describe('computeTargets', () => {
  const base: ProfileInput = {
    sex: 'male', age: 23, height_cm: 178, weight_kg: 80,
    weight_target_kg: 77, sessions_per_week: 4, goal: 'lose',
  };

  it('produit des cibles cohérentes', () => {
    const t = computeTargets(base);
    // BMR 1803 × 1.55 ≈ 2795 ; −450 déficit → 2345 arrondi à 2350
    expect(t.tdee_kcal).toBe(2795);
    expect(t.daily_kcal).toBe(2350);
    expect(t.protein_g).toBe(160); // 80 × 2.0 g/kg (cut)
    expect(t.water_l).toBeCloseTo(2.8, 5);
  });

  it('l’énergie des macros correspond ~ aux kcal cibles', () => {
    const t = computeTargets(base);
    const kcalFromMacros = t.protein_g * 4 + t.carbs_g * 4 + t.fat_g * 9;
    expect(Math.abs(kcalFromMacros - t.daily_kcal)).toBeLessThanOrEqual(30);
  });

  it('prise de muscle → plus de calories que la perte', () => {
    const cut = computeTargets({ ...base, goal: 'lose' });
    const bulk = computeTargets({ ...base, goal: 'gain' });
    expect(bulk.daily_kcal).toBeGreaterThan(cut.daily_kcal);
  });

  it('applique un plancher de sécurité', () => {
    const tiny = computeTargets({ ...base, sex: 'female', weight_kg: 40, height_cm: 150, age: 60, sessions_per_week: 0, goal: 'lose' });
    expect(tiny.daily_kcal).toBeGreaterThanOrEqual(1200);
  });
});
