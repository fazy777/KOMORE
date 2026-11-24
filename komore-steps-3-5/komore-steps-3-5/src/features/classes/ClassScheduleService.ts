/**
 * File: ClassScheduleService.ts
 * Step 3 entry point. One class that holds everything about the class schedule,
 * so it can be merged with other features without touching the logic inside.
 */
import {
  CalendarSyncProvider,
  SyncSummary,
  syncGoogleCalendar,
} from '../../services/googleCalendar';
import { ClassInput, ClassItem, ClassKind } from '../../types/schedule';
import {
  deleteClass,
  getClass,
  listClasses,
  saveClass,
  SaveClassOptions,
  SaveClassResult,
} from './classService';

export class ClassScheduleService {
  /** Lists all fixed classes and labs, ordered by weekday and start time. */
  list(): Promise<ClassItem[]> {
    return listClasses();
  }

  /** Finds one class by id. Returns null if it does not exist. */
  get(id: string): Promise<ClassItem | null> {
    return getClass(id);
  }

  /**
   * Adds a class, or edits one when options.id is given.
   * Returns 'overlap' (with the clashing classes) unless options.allowOverlap is true.
   */
  save(input: ClassInput, options: SaveClassOptions = {}): Promise<SaveClassResult> {
    return saveClass(input, options);
  }

  /** Deletes a class. Returns false if it did not exist. */
  remove(id: string): Promise<boolean> {
    return deleteClass(id);
  }

  /**
   * Imports events from Google Calendar as fixed one-off classes.
   * Needs a provider that fetches the events (Google sign-in, to be built with the backend).
   */
  syncFromGoogle(
    provider: CalendarSyncProvider,
    kind: ClassKind = 'class',
  ): Promise<SyncSummary> {
    return syncGoogleCalendar(provider, kind);
  }
}
