/**
 * File: TimetableManager.ts
 * Step 5 entry point. One class that builds and edits daily timetables.
 * It reads classes (Step 3), tasks (Step 4) and the onboarding profile (Step 2).
 * The profile comes from a ProfileProvider, so Step 2 can be plugged in later
 * (or replaced by a fake in tests).
 */
import {
  defaultProfileProvider,
  ProfileProvider,
} from '../../services/profileProvider';
import { SchedulerOptions } from '../../services/scheduler';
import { Timetable } from '../../types/schedule';
import {
  EditBlockResult,
  generateTimetable,
  getTimetable,
  removeTaskBlock,
  updateTaskBlock,
} from './timetableService';

export interface TimetableManagerOptions {
  /** Supplies sleep time, travel time and student type. Defaults to safe defaults until Step 2 is merged. */
  profileProvider?: ProfileProvider;
  /** Returns the current time. Tests pass a fixed time. */
  now?: () => Date;
  /** Overrides for day start, bedtime buffer, smallest block and planning horizon. */
  schedulerOptions?: Partial<SchedulerOptions>;
}

export class TimetableManager {
  private readonly profileProvider: ProfileProvider;
  private readonly now: () => Date;
  private readonly schedulerOptions?: Partial<SchedulerOptions>;

  /** @param options profile source, clock and scheduler settings (all optional) */
  constructor(options: TimetableManagerOptions = {}) {
    this.profileProvider = options.profileProvider ?? defaultProfileProvider;
    this.now = options.now ?? (() => new Date());
    this.schedulerOptions = options.schedulerOptions;
  }

  /**
   * Builds the plan for one day and saves it as the active timetable.
   * Fixed classes stay put, urgent tasks fill the free gaps, and blocks the
   * student moved by hand are kept. Calling it again regenerates the day.
   * @param date YYYY-MM-DD
   */
  generate(date: string): Promise<Timetable> {
    return generateTimetable(date, {
      profileProvider: this.profileProvider,
      now: this.now(),
      schedulerOptions: this.schedulerOptions,
    });
  }

  /** Returns the active timetable for a day, or null if none was generated yet. */
  getForDate(date: string): Promise<Timetable | null> {
    return getTimetable(date);
  }

  /**
   * Moves a task block to new times (HH:mm). Fixed class entries cannot be moved.
   * Returns 'conflict' if the new time overlaps another entry.
   */
  moveBlock(
    timetableId: string,
    entryId: string,
    times: { startTime: string; endTime: string },
  ): Promise<EditBlockResult> {
    return updateTaskBlock(timetableId, entryId, times);
  }

  /** Removes a task block from a day. The task returns to 'pending' if it has no block left. */
  removeBlock(timetableId: string, entryId: string): Promise<Timetable | null> {
    return removeTaskBlock(timetableId, entryId);
  }
}
