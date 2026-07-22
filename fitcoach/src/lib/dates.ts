/** Helpers de dates purs (format YYYY-MM-DD, semaine lundi→dimanche). */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Lundi de la semaine contenant `d` (jour 1 = lundi). */
export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=dim..6=sam
  const diff = (day + 6) % 7; // nb de jours depuis lundi
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Les 7 dates ISO d'une semaine à partir de son lundi. */
export function weekDates(weekStart: Date): string[] {
  const start = startOfWeek(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toISODate(d);
}
