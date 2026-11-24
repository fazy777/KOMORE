/**
 * File: scheduler.ts
 * Step 5 core: builds one day's plan. Fixed classes first, then the most urgent tasks in the free gaps.
 * Pure functions (no storage, no screens), so it can be tested and merged on its own.
 */
import {
  ClassItem,
  Task,
  TimetableEntry,
  UnplacedTask,
} from '../types/schedule';
import { ScheduleProfile } from '../types/profile';
import { classOccursOn } from './classRules';
import { newId } from './ids';
import {
  addDays,
  formatDate,
  intervalsOverlap,
  minutesOfDay,
  toMinutes,
  toHHmm,
} from './timeUtils';

export interface SchedulerOptions {
  /** First minute of the study day, HH:mm. Default 08:00 */
  dayStart: string;
  /** Minutes kept free before bedtime. Default 60 */
  sleepBufferMinutes: number;
  /** Smallest block a task may be split into. Default 25 */
  minBlockMinutes: number;
  /** Only tasks due within this many days (plus overdue ones) are planned. Default 7 */
  horizonDays: number;
  /** When planning today, nothing is placed before this minute of the day. */
  nowMinutes?: number;
}

export const DEFAULT_OPTIONS: SchedulerOptions = {
  dayStart: '08:00',
  sleepBufferMinutes: 60,
  minBlockMinutes: 25,
  horizonDays: 7,
};

export interface ScheduleInput {
  /** YYYY-MM-DD */
  date: string;
  classes: ClassItem[];
  tasks: Task[];
  profile: ScheduleProfile;
  /** Task blocks the student edited by hand. They are kept as they are. */
  preservedEntries?: TimetableEntry[];
  options?: Partial<SchedulerOptions>;
}

export interface ScheduleResult {
  entries: TimetableEntry[];
  unplaced: UnplacedTask[];
}

interface Interval {
  start: number;
  end: number;
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 } as const;
const CATEGORY_RANK = {
  assignment: 1,
  exam_revision: 2,
  lecture_recap: 3,
} as const;

/** Nearest deadline first, then higher priority, then category order. */
export function sortTasksByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byDeadline = Date.parse(a.deadline) - Date.parse(b.deadline);
    if (byDeadline !== 0) {
      return byDeadline;
    }
    const byPriority = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (byPriority !== 0) {
      return byPriority;
    }
    return CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
  });
}

/**
 * Internal: sorts time ranges and joins the ones that touch or overlap.
 * @returns a list of separate ranges in time order
 */
function mergeIntervals(list: Interval[]): Interval[] {
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];
  for (const iv of sorted) {
    const last = merged[merged.length - 1];
    if (last && iv.start <= last.end) {
      last.end = Math.max(last.end, iv.end);
    } else {
      merged.push({ start: iv.start, end: iv.end });
    }
  }
  return merged;
}

/**
 * Internal: finds the free gaps inside a window after removing the busy ranges.
 * @param window the part of the day available for work
 * @param busy ranges that are already taken (classes, travel, edited blocks)
 * @returns free gaps in time order
 */
function subtractIntervals(window: Interval, busy: Interval[]): Interval[] {
  const gaps: Interval[] = [];
  let cursor = window.start;
  for (const b of mergeIntervals(busy)) {
    if (b.end <= cursor) {
      continue;
    }
    if (b.start >= window.end) {
      break;
    }
    if (b.start > cursor) {
      gaps.push({ start: cursor, end: Math.min(b.start, window.end) });
    }
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < window.end) {
    gaps.push({ start: cursor, end: window.end });
  }
  return gaps;
}

/** Minute of the day after which a task may no longer be worked on, on this date. */
function deadlineCutoff(task: Task, date: string): number {
  const d = new Date(task.deadline);
  const deadlineDate = formatDate(d);
  if (deadlineDate === date) {
    return minutesOfDay(d);
  }
  // Due on a later day, or already overdue: any time of this day is allowed.
  return 1440;
}

/**
 * Internal: puts one task into the free gaps. It first tries one gap that holds the whole task,
 * then splits the task across gaps (earliest first). The gaps array is updated in place.
 * @param gaps free gaps, in minutes of the day
 * @param need minutes of work still to place
 * @param cutoff minute of the day after which work is no longer useful (the task deadline)
 * @param minBlock smallest block a task may be split into
 * @returns the blocks created and the minutes that did not fit
 */
function place(
  gaps: Interval[],
  need: number,
  cutoff: number,
  minBlock: number,
): { chunks: Interval[]; left: number } {
  const chunks: Interval[] = [];

  // 1) Prefer a single gap that holds the whole task.
  for (let i = 0; i < gaps.length; i += 1) {
    const end = Math.min(gaps[i].end, cutoff);
    if (end - gaps[i].start >= need) {
      chunks.push({ start: gaps[i].start, end: gaps[i].start + need });
      gaps[i] = { start: gaps[i].start + need, end: gaps[i].end };
      return { chunks, left: 0 };
    }
  }

  // 2) Otherwise split it across gaps, earliest first.
  let left = need;
  for (let i = 0; i < gaps.length && left > 0; i += 1) {
    const end = Math.min(gaps[i].end, cutoff);
    const len = end - gaps[i].start;
    if (len < Math.min(minBlock, left)) {
      continue;
    }
    const take = Math.min(len, left);
    chunks.push({ start: gaps[i].start, end: gaps[i].start + take });
    gaps[i] = { start: gaps[i].start + take, end: gaps[i].end };
    left -= take;
  }
  return { chunks, left };
}

/**
 * Build one day's plan: fixed classes first (they never move), then the most urgent
 * tasks in the free gaps. Pure function, so it is easy to test.
 */
export function scheduleDay(input: ScheduleInput): ScheduleResult {
  const opts: SchedulerOptions = { ...DEFAULT_OPTIONS, ...input.options };
  const { date, profile } = input;

  // 1. Fixed classes for this date
  const dayClasses = input.classes
    .filter(c => classOccursOn(c, date))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const classIntervals: Interval[] = dayClasses.map(c => ({
    start: toMinutes(c.startTime),
    end: toMinutes(c.endTime),
  }));
  const classEntries: TimetableEntry[] = dayClasses.map(c => ({
    id: newId('entry'),
    kind: 'class',
    classId: c.id,
    taskId: null,
    startTime: c.startTime,
    endTime: c.endTime,
    editedByStudent: false,
  }));

  // 2. Hand-edited task blocks stay, unless a class now sits on top of them
  const preserved = (input.preservedEntries ?? []).filter(
    e =>
      e.kind === 'task_block' &&
      e.editedByStudent &&
      !classIntervals.some(ci =>
        intervalsOverlap(
          toMinutes(e.startTime),
          toMinutes(e.endTime),
          ci.start,
          ci.end,
        ),
      ),
  );
  const preservedMinutes = new Map<string, number>();
  for (const e of preserved) {
    if (e.taskId) {
      preservedMinutes.set(
        e.taskId,
        (preservedMinutes.get(e.taskId) ?? 0) +
          (toMinutes(e.endTime) - toMinutes(e.startTime)),
      );
    }
  }

  // 3. Study window: from dayStart to bedtime minus the buffer
  let windowStart = toMinutes(opts.dayStart);
  if (opts.nowMinutes !== undefined) {
    windowStart = Math.max(windowStart, Math.ceil(opts.nowMinutes / 5) * 5);
  }
  let sleep = toMinutes(profile.sleepTime);
  if (sleep < 12 * 60) {
    sleep += 1440; // bedtime after midnight
  }
  const windowEnd = Math.min(sleep - opts.sleepBufferMinutes, 1439);

  // 4. Busy time: classes, travel to and from campus, hand-edited blocks
  const busy: Interval[] = [...classIntervals];
  if (classIntervals.length > 0 && profile.travelMinutes > 0) {
    const first = Math.min(...classIntervals.map(i => i.start));
    const last = Math.max(...classIntervals.map(i => i.end));
    busy.push({ start: first - profile.travelMinutes, end: first });
    busy.push({ start: last, end: last + profile.travelMinutes });
  }
  for (const e of preserved) {
    busy.push({ start: toMinutes(e.startTime), end: toMinutes(e.endTime) });
  }

  let gaps =
    windowEnd > windowStart
      ? subtractIntervals({ start: windowStart, end: windowEnd }, busy)
      : [];

  // 5. Tasks that need planning, most urgent first
  const lastDay = addDays(date, opts.horizonDays);
  const eligible = sortTasksByUrgency(
    input.tasks.filter(
      t =>
        (t.status === 'pending' || t.status === 'scheduled') &&
        formatDate(new Date(t.deadline)) <= lastDay,
    ),
  );

  const blocks: TimetableEntry[] = [];
  const unplaced: UnplacedTask[] = [];
  for (const task of eligible) {
    const need = task.estimatedMinutes - (preservedMinutes.get(task.id) ?? 0);
    if (need <= 0) {
      continue;
    }
    const { chunks, left } = place(
      gaps,
      need,
      deadlineCutoff(task, date),
      opts.minBlockMinutes,
    );
    gaps = gaps.filter(g => g.end > g.start);
    for (const chunk of chunks) {
      blocks.push({
        id: newId('entry'),
        kind: 'task_block',
        classId: null,
        taskId: task.id,
        startTime: toHHmm(chunk.start),
        endTime: toHHmm(chunk.end),
        editedByStudent: false,
      });
    }
    if (left > 0) {
      unplaced.push({ taskId: task.id, minutes: left });
    }
  }

  const entries = [...classEntries, ...preserved, ...blocks].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
  );
  return { entries, unplaced };
}
