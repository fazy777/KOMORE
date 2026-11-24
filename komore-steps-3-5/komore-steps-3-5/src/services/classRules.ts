/**
 * File: classRules.ts
 * Rules about which day a class falls on and when two classes clash (Step 3).
 */
import { ClassItem } from '../types/schedule';
import { dayOfWeek, intervalsOverlap, toMinutes } from './timeUtils';

/** Does this class take place on the given YYYY-MM-DD date? */
export function classOccursOn(c: ClassItem, date: string): boolean {
  if (c.specificDate) {
    return c.specificDate === date;
  }
  return c.dayOfWeek === dayOfWeek(date);
}

type DayShape = Pick<ClassItem, 'dayOfWeek' | 'specificDate'>;

/**
 * Internal: tells whether two classes can fall on the same calendar day (weekly vs weekly, weekly vs one-off, one-off vs one-off).
 */
function sameDay(a: DayShape, b: DayShape): boolean {
  if (a.specificDate && b.specificDate) {
    return a.specificDate === b.specificDate;
  }
  if (a.specificDate) {
    return dayOfWeek(a.specificDate) === b.dayOfWeek;
  }
  if (b.specificDate) {
    return dayOfWeek(b.specificDate) === a.dayOfWeek;
  }
  return a.dayOfWeek === b.dayOfWeek;
}

type TimedClass = Pick<
  ClassItem,
  'dayOfWeek' | 'specificDate' | 'startTime' | 'endTime'
>;

/**
 * Checks whether two classes clash: they can fall on the same day AND their times overlap.
 * @returns true when the classes clash
 */
export function classesOverlap(a: TimedClass, b: TimedClass): boolean {
  return (
    sameDay(a, b) &&
    intervalsOverlap(
      toMinutes(a.startTime),
      toMinutes(a.endTime),
      toMinutes(b.startTime),
      toMinutes(b.endTime),
    )
  );
}
