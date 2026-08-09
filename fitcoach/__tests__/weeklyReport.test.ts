import {
  generateWeeklyReport,
  generateRecommendation,
  comparePersonalRecords,
  interpretTrend,
  mean,
  type ReportInput,
} from '@/lib/weeklyReport';

const baseInput = (overrides: Partial<ReportInput> = {}): ReportInput => ({
  weekStart: '2026-07-20',
  days: [],
  sessionsCompleted: 4,
  totalVolumeKg: 0,
  weekWeights: [],
  prevWeekWeightAvg: null,
  keyLiftBests: {},
  isCreatineWeek1to3: false,
  ...overrides,
});

const goodDay = (kcal: number, protein: number) => ({
  date: '2026-07-20',
  kcal,
  protein_g: protein,
  carbs_g: 250,
  fat_g: 70,
});

describe('mean', () => {
  it('moyenne simple', () => {
    expect(mean([80, 80.4, 79.6])).toBeCloseTo(80, 5);
  });
  it('liste vide → 0', () => {
    expect(mean([])).toBe(0);
  });
});

describe('interpretTrend', () => {
  it('perte / gain / stable / inconnu', () => {
    expect(interpretTrend(-0.4)).toBe('loss');
    expect(interpretTrend(0.4)).toBe('gain');
    expect(interpretTrend(0.05)).toBe('stable');
    expect(interpretTrend(null)).toBe('unknown');
  });
});

describe('comparePersonalRecords', () => {
  it('détecte un PR quand la charge courante dépasse la précédente', () => {
    const prs = comparePersonalRecords({
      'Squat barre': { current: 100, previous: 95 },
      'Développé couché barre': { current: 80, previous: 80 }, // égalité = pas PR
    });
    expect(prs).toContain('Squat barre');
    expect(prs).not.toContain('Développé couché barre');
  });
  it('un exercice jamais fait avant (previous null) compte comme PR', () => {
    const prs = comparePersonalRecords({
      'Tractions pronation': { current: 10, previous: null },
    });
    expect(prs).toContain('Tractions pronation');
  });
});

describe('generateRecommendation', () => {
  it('priorité aux protéines insuffisantes', () => {
    expect(
      generateRecommendation({ weightDelta: -0.4, daysHitProtein: 3, isCreatineWeek1to3: false }),
    ).toMatch(/prot/i);
  });
  it('perte trop rapide → +100 kcal', () => {
    expect(
      generateRecommendation({ weightDelta: -0.9, daysHitProtein: 6, isCreatineWeek1to3: false }),
    ).toMatch(/\+100 kcal/);
  });
  it('gain hors S1-3 créatine → -100 kcal', () => {
    expect(
      generateRecommendation({ weightDelta: 0.5, daysHitProtein: 6, isCreatineWeek1to3: false }),
    ).toMatch(/-100 kcal/);
  });
  it('gain pendant S1-3 créatine → on ne touche à rien', () => {
    expect(
      generateRecommendation({ weightDelta: 0.5, daysHitProtein: 6, isCreatineWeek1to3: true }),
    ).toMatch(/créatine/i);
  });
  it('cible idéale → continue', () => {
    expect(
      generateRecommendation({ weightDelta: -0.4, daysHitProtein: 7, isCreatineWeek1to3: false }),
    ).toMatch(/OK/i);
  });
  it('pas de pesée → demande de se peser', () => {
    expect(
      generateRecommendation({ weightDelta: null, daysHitProtein: 6, isCreatineWeek1to3: false }),
    ).toMatch(/pèse|pesée/i);
  });
});

describe('generateWeeklyReport', () => {
  it('agrège nutrition, training et poids', () => {
    const report = generateWeeklyReport(
      baseInput({
        days: [goodDay(2450, 165), goodDay(2400, 170), goodDay(2500, 150)],
        weekWeights: [79.8, 79.6],
        prevWeekWeightAvg: 80.1,
        totalVolumeKg: 42000,
        keyLiftBests: { 'Squat barre': { current: 102.5, previous: 100 } },
      }),
    );

    expect(report.nutrition.days_logged).toBe(3);
    expect(report.nutrition.avg_kcal_per_day).toBe(2450);
    expect(report.nutrition.days_hit_protein_target).toBe(2); // 165 et 170 >= 160
    expect(report.body.weight_current).toBe(79.7);
    expect(report.body.weight_delta_kg).toBe(-0.4);
    expect(report.body.trend).toBe('loss');
    expect(report.training.prs_this_week).toContain('Squat barre');
    expect(report.recommendation).toBeTruthy();
  });

  it('compliance_pct calculée sur 7 jours', () => {
    // 2 jours dans la fourchette [2250, 2600]
    const report = generateWeeklyReport(
      baseInput({ days: [goodDay(2400, 165), goodDay(2500, 165), goodDay(3200, 165)] }),
    );
    expect(report.nutrition.days_over_kcal_target).toBe(1); // 3200 > 2550
    expect(report.nutrition.compliance_pct).toBe(29); // 2/7 = 28.57 -> 29
  });
});
