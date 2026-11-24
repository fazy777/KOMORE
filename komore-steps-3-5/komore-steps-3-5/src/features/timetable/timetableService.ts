/**
 * File: timetableService.ts
 * Step 5: generates and saves timetables, and edits task blocks inside them.
 */
import {
  taskRepository,
  timetableRepository,
  classRepository,
} from '../../storage/scheduleRepositories';
import { newId } from '../../services/ids';
import {
  defaultProfileProvider,
  ProfileProvider,
} from '../../services/profileProvider';
import { scheduleDay, SchedulerOptions } from '../../services/scheduler';
import {
  formatDate,
  intervalsOverlap,
  isValidTime,
  minutesOfDay,
  toMinutes,
} from '../../services/timeUtils';
import { Timetable } from '../../types/schedule';

export interface GenerateOptions {
  profileProvider?: ProfileProvider;
  now?: Date;
  schedulerOptions?: Partial<SchedulerOptions>;
}

/**
 * Finds the active timetable for a day.
 * @param date YYYY-MM-DD
 * @returns the timetable, or null if none was generated yet
 */
export async function getTimetable(date: string): Promise<Timetable | null> {
  const all = await timetableRepository.list();
  return all.find(t => t.date === date && t.isActive) ?? null;
}

/**
 * Build (or rebuild) the plan for one day and save it as the active timetable.
 * Older versions for that day are kept but marked inactive.
 * Blocks the student edited by hand are kept.
 */
export async function generateTimetable(
  date: string,
  options: GenerateOptions = {},
): Promise<Timetable> {
  const now = options.now ?? new Date();
  const provider = options.profileProvider ?? defaultProfileProvider;

  const [classes, tasks, profile, all] = await Promise.all([
    classRepository.list(),
    taskRepository.list(),
    provider.getProfile(),
    timetableRepository.list(),
  ]);

  const previous = all.find(t => t.date === date && t.isActive);
  const isToday = date === formatDate(now);

  const result = scheduleDay({
    date,
    classes,
    tasks,
    profile,
    preservedEntries: previous?.entries.filter(e => e.editedByStudent) ?? [],
    options: {
      ...(isToday ? { nowMinutes: minutesOfDay(now) } : {}),
      ...options.schedulerOptions,
    },
  });

  const timetable: Timetable = {
    id: newId('timetable'),
    date,
    generatedAt: now.toISOString(),
    isActive: true,
    entries: result.entries,
    unplaced: result.unplaced,
  };

  const next = all.map(t =>
    t.date === date && t.isActive ? { ...t, isActive: false } : t,
  );
  await timetableRepository.saveAll([...next, timetable]);

  // Tasks that got a block are now "scheduled"
  const placedIds = new Set(
    result.entries.map(e => e.taskId).filter((id): id is string => id !== null),
  );
  if (placedIds.size > 0) {
    await taskRepository.saveAll(
      tasks.map(t =>
        placedIds.has(t.id) && t.status === 'pending'
          ? { ...t, status: 'scheduled' as const }
          : t,
      ),
    );
  }
  return timetable;
}

export type EditBlockResult =
  | { status: 'saved'; timetable: Timetable }
  | { status: 'invalid'; errors: string[] }
  | { status: 'conflict' }
  | { status: 'not_found' };

/** Move a task block. Fixed class entries can never be edited. */
export async function updateTaskBlock(
  timetableId: string,
  entryId: string,
  times: { startTime: string; endTime: string },
): Promise<EditBlockResult> {
  const all = await timetableRepository.list();
  const timetable = all.find(t => t.id === timetableId);
  const entry = timetable?.entries.find(e => e.id === entryId);
  if (!timetable || !entry || entry.kind !== 'task_block') {
    return { status: 'not_found' };
  }
  const errors: string[] = [];
  if (!isValidTime(times.startTime) || !isValidTime(times.endTime)) {
    errors.push('Times must look like 09:30.');
  } else if (toMinutes(times.endTime) <= toMinutes(times.startTime)) {
    errors.push('End time must be after the start time.');
  }
  if (errors.length > 0) {
    return { status: 'invalid', errors };
  }
  const start = toMinutes(times.startTime);
  const end = toMinutes(times.endTime);
  const clash = timetable.entries.some(
    e =>
      e.id !== entryId &&
      intervalsOverlap(start, end, toMinutes(e.startTime), toMinutes(e.endTime)),
  );
  if (clash) {
    return { status: 'conflict' };
  }
  const updated: Timetable = {
    ...timetable,
    entries: timetable.entries.map(e =>
      e.id === entryId ? { ...e, ...times, editedByStudent: true } : e,
    ),
  };
  await timetableRepository.saveAll(all.map(t => (t.id === timetableId ? updated : t)));
  return { status: 'saved', timetable: updated };
}

/** Remove a task block from a day. The task goes back to "pending" if it has no block left. */
export async function removeTaskBlock(
  timetableId: string,
  entryId: string,
): Promise<Timetable | null> {
  const all = await timetableRepository.list();
  const timetable = all.find(t => t.id === timetableId);
  const entry = timetable?.entries.find(e => e.id === entryId);
  if (!timetable || !entry || entry.kind !== 'task_block') {
    return null;
  }
  const updated: Timetable = {
    ...timetable,
    entries: timetable.entries.filter(e => e.id !== entryId),
  };
  await timetableRepository.saveAll(all.map(t => (t.id === timetableId ? updated : t)));

  const stillPlaced = all.some(t =>
    t.isActive &&
    (t.id === timetableId ? updated : t).entries.some(e => e.taskId === entry.taskId),
  );
  if (entry.taskId && !stillPlaced) {
    const tasks = await taskRepository.list();
    await taskRepository.saveAll(
      tasks.map(t =>
        t.id === entry.taskId && t.status === 'scheduled'
          ? { ...t, status: 'pending' as const }
          : t,
      ),
    );
  }
  return updated;
}
