/** "16:8" -> fasting hours */
export function methodHours(method: string): number {
  const hours = parseInt(method.split(':')[0], 10);
  return Number.isFinite(hours) && hours > 0 ? hours : 16;
}

export function methodToMs(method: string): number {
  return methodHours(method) * 60 * 60 * 1000;
}

/** Elapsed ms -> "4:38:26" */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Remaining ms -> "9h 14m" */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Today 14:45" / "Tomorrow 02:45" / "Fri 9 Oct 07:30" */
export function formatDayTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  if (diffDays === 0) return `Today ${formatClock(date)}`;
  if (diffDays === 1) return `Tomorrow ${formatClock(date)}`;
  if (diffDays === -1) return `Yesterday ${formatClock(date)}`;
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${formatClock(date)}`;
}

export function formatShortDate(ts: number): string {
  const date = new Date(ts);
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

/** Index 0 = Monday, matching the plan weekday chips. */
export function dayIndexMondayFirst(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Deterministic per-10-minute pseudo count, e.g. "3.8" (thousands). Purely local. */
export function peopleFastingNow(now: number): string {
  const bucket = Math.floor(now / 600000);
  const hash = (((bucket >>> 3) ^ (bucket * 17)) >>> 0) % 90;
  return ((28 + hash) / 10).toFixed(1);
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
