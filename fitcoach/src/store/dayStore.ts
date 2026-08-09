/**
 * Store du jour courant (dashboard Home). Zustand : léger, pas de boilerplate.
 * Charge totaux nutrition + daily_log et expose les actions eau/créatine.
 */
import { create } from 'zustand';
import type { Macros, MealEntry, DailyLog } from '@/types';
import { todayISO } from '@/lib/dates';
import {
  getDayTotals,
  getMealEntries,
  getDailyLog,
  setWater as dbSetWater,
  setCreatine as dbSetCreatine,
} from '@/db/repositories';

interface DayState {
  date: string;
  totals: Macros;
  entries: MealEntry[];
  daily: DailyLog;
  loading: boolean;
  refresh: () => Promise<void>;
  setDate: (date: string) => Promise<void>;
  addWater: (deltaL: number) => Promise<void>;
  toggleCreatine: () => Promise<void>;
}

const emptyTotals: Macros = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

export const useDayStore = create<DayState>((set, get) => ({
  date: todayISO(),
  totals: emptyTotals,
  entries: [],
  daily: { date: todayISO(), water_l: 0, creatine_taken: false, sleep_hours: null, mood: null },
  loading: false,

  refresh: async () => {
    const { date } = get();
    set({ loading: true });
    const [totals, entries, daily] = await Promise.all([
      getDayTotals(date),
      getMealEntries(date),
      getDailyLog(date),
    ]);
    set({ totals, entries, daily, loading: false });
  },

  setDate: async (date) => {
    set({ date });
    await get().refresh();
  },

  addWater: async (deltaL) => {
    const { daily, date } = get();
    const next = Math.max(0, Math.round((daily.water_l + deltaL) * 10) / 10);
    await dbSetWater(date, next);
    set({ daily: { ...daily, water_l: next } });
  },

  toggleCreatine: async () => {
    const { daily, date } = get();
    const next = !daily.creatine_taken;
    await dbSetCreatine(date, next);
    set({ daily: { ...daily, creatine_taken: next } });
  },
}));
