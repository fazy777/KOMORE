/**
 * File: classService.ts
 * Step 3: class schedule logic (add, edit, delete, list, overlap check).
 */
import { classRepository } from '../../storage/scheduleRepositories';
import { classesOverlap } from '../../services/classRules';
import { newId } from '../../services/ids';
import {
  isValidDate,
  isValidTime,
  toMinutes,
} from '../../services/timeUtils';
import { ClassInput, ClassItem } from '../../types/schedule';

export type SaveClassResult =
  | { status: 'saved'; item: ClassItem }
  | { status: 'invalid'; errors: string[] }
  | { status: 'overlap'; conflicts: ClassItem[] }
  | { status: 'not_found' };

export interface SaveClassOptions {
  /** Edit the class with this id instead of creating a new one. */
  id?: string;
  /** Save even if it overlaps another class (the student confirmed the warning). */
  allowOverlap?: boolean;
  now?: Date;
}

/**
 * Cleans a class form: trims text, turns empty fields into null, and drops dayOfWeek when a specific date is given.
 * @param input raw class values
 * @returns cleaned class values
 */
export function normalizeClassInput(input: ClassInput): ClassInput {
  const specificDate = input.specificDate?.trim() || null;
  return {
    title: input.title.trim(),
    kind: input.kind,
    dayOfWeek: specificDate ? null : input.dayOfWeek,
    specificDate,
    startTime: input.startTime.trim(),
    endTime: input.endTime.trim(),
    location: input.location?.trim() || null,
  };
}

/**
 * Checks class values and lists every problem found (empty list means valid).
 * @param input cleaned class values
 * @returns error messages for the student
 */
export function validateClassInput(input: ClassInput): string[] {
  const errors: string[] = [];
  if (!input.title) {
    errors.push('Title is required.');
  }
  if (input.kind !== 'class' && input.kind !== 'lab') {
    errors.push('Type must be class or lab.');
  }
  if (input.specificDate) {
    if (!isValidDate(input.specificDate)) {
      errors.push('Date must look like 2026-11-23.');
    }
  } else if (
    input.dayOfWeek === null ||
    !Number.isInteger(input.dayOfWeek) ||
    input.dayOfWeek < 1 ||
    input.dayOfWeek > 7
  ) {
    errors.push('Choose a day of the week.');
  }
  const startOk = isValidTime(input.startTime);
  const endOk = isValidTime(input.endTime);
  if (!startOk) {
    errors.push('Start time must look like 08:00.');
  }
  if (!endOk) {
    errors.push('End time must look like 09:30.');
  }
  if (startOk && endOk && toMinutes(input.endTime) <= toMinutes(input.startTime)) {
    errors.push('End time must be after the start time.');
  }
  return errors;
}

/**
 * Reads all saved classes, ordered by weekday, then date, then start time.
 * @returns the class list
 */
export async function listClasses(): Promise<ClassItem[]> {
  const all = await classRepository.list();
  return all.sort(
    (a, b) =>
      (a.dayOfWeek ?? 8) - (b.dayOfWeek ?? 8) ||
      (a.specificDate ?? '').localeCompare(b.specificDate ?? '') ||
      toMinutes(a.startTime) - toMinutes(b.startTime),
  );
}

/**
 * Finds one saved class.
 * @param id the class id
 * @returns the class, or null if it does not exist
 */
export async function getClass(id: string): Promise<ClassItem | null> {
  const all = await classRepository.list();
  return all.find(c => c.id === id) ?? null;
}

/**
 * Creates a class, or edits one when options.id is given. Validates first, and warns about overlapping classes
 * unless options.allowOverlap is true.
 * @param rawInput class values from the student
 * @param options id to edit, allowOverlap to ignore overlap, now for tests
 * @returns saved | invalid (with errors) | overlap (with the clashing classes) | not_found
 */
export async function saveClass(
  rawInput: ClassInput,
  options: SaveClassOptions = {},
): Promise<SaveClassResult> {
  const input = normalizeClassInput(rawInput);
  const errors = validateClassInput(input);
  if (errors.length > 0) {
    return { status: 'invalid', errors };
  }

  const all = await classRepository.list();
  const existing = options.id ? all.find(c => c.id === options.id) : undefined;
  if (options.id && !existing) {
    return { status: 'not_found' };
  }

  if (!options.allowOverlap) {
    const conflicts = all.filter(
      c => c.id !== options.id && classesOverlap(c, input),
    );
    if (conflicts.length > 0) {
      return { status: 'overlap', conflicts };
    }
  }

  const item: ClassItem = existing
    ? { ...existing, ...input }
    : {
        ...input,
        id: newId('class'),
        source: 'manual',
        googleEventId: null,
        createdAt: (options.now ?? new Date()).toISOString(),
      };

  const next = existing ? all.map(c => (c.id === item.id ? item : c)) : [...all, item];
  await classRepository.saveAll(next);
  return { status: 'saved', item };
}

/**
 * Deletes a class.
 * @param id the class id
 * @returns true if it was deleted, false if it did not exist
 */
export async function deleteClass(id: string): Promise<boolean> {
  const all = await classRepository.list();
  const next = all.filter(c => c.id !== id);
  if (next.length === all.length) {
    return false;
  }
  await classRepository.saveAll(next);
  return true;
}
