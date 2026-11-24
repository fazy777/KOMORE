/**
 * File: timeUtils.ts
 * Small date and time helpers shared by Steps 3, 4 and 5. Times are HH:mm, dates are YYYY-MM-DD.
 */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks that a string is a valid 24-hour time written as HH:mm (for example 08:00).
 * @param value text to check
 * @returns true when the text is a valid time
 */
export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

/**
 * Converts an HH:mm time into minutes since midnight (08:30 becomes 510).
 * @param hhmm a valid HH:mm time
 * @returns minutes since 00:00
 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes since midnight into an HH:mm string. Values are kept between 00:00 and 23:59.
 * @param totalMinutes minutes since 00:00
 * @returns time as HH:mm
 */
export function toHHmm(totalMinutes: number): string {
  const t = Math.max(0, Math.min(1439, Math.round(totalMinutes)));
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Checks that a string is a real calendar date written as YYYY-MM-DD (2026-02-30 is rejected).
 * @param value text to check
 * @returns true when the text is a real date
 */
export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) {
    return false;
  }
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** 1 = Monday ... 7 = Sunday */
export function dayOfWeek(date: string): number {
  const d = new Date(`${date}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Local calendar date as YYYY-MM-DD */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Adds (or subtracts) whole days to a YYYY-MM-DD date.
 * @param date start date, YYYY-MM-DD
 * @param n number of days, may be negative
 * @returns the new date, YYYY-MM-DD
 */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Gives the local time of a Date as minutes since midnight.
 * @param d the date and time
 * @returns minutes since 00:00 (local time)
 */
export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Checks whether two time ranges overlap. Ranges that only touch (one ends when the other starts) do not overlap.
 * @returns true when the ranges share some time
 */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
