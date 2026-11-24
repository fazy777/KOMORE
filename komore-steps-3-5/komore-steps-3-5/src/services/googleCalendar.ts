/**
 * File: googleCalendar.ts
 * Step 3: turns Google Calendar events into fixed classes and merges them without duplicates.
 * Fetching events (Google sign-in) is not here yet. It needs the backend.
 */
import { classRepository } from '../storage/scheduleRepositories';
import { newId } from './ids';
import { ClassInput, ClassItem, ClassKind } from '../types/schedule';

/** The parts of a Google Calendar API event that Komore uses. */
export interface GoogleCalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

/**
 * Supplies events from the student's calendar.
 * TODO(backend): implement with Google sign-in (OAuth) and the Google Calendar API.
 * The refresh token must be kept on the backend (calendar_connections table), not on the phone.
 */
export interface CalendarSyncProvider {
  fetchEvents(): Promise<GoogleCalendarEvent[]>;
}

export interface SyncSummary {
  added: number;
  updated: number;
  removed: number;
  skipped: number;
}

/**
 * Turn a Google event into a fixed one-off class.
 * Returns null for events that cannot be a class block: cancelled, all-day,
 * missing times, or spanning more than one day.
 * The wall-clock time written in the event is kept as it is.
 */
export function mapGoogleEvent(
  event: GoogleCalendarEvent,
  kind: ClassKind = 'class',
): ClassInput | null {
  if (event.status === 'cancelled') {
    return null;
  }
  const start = event.start?.dateTime;
  const end = event.end?.dateTime;
  if (!start || !end || start.length < 16 || end.length < 16) {
    return null;
  }
  const date = start.slice(0, 10);
  if (end.slice(0, 10) !== date) {
    return null;
  }
  const startTime = start.slice(11, 16);
  const endTime = end.slice(11, 16);
  if (endTime <= startTime) {
    return null;
  }
  return {
    title: event.summary?.trim() || 'Untitled event',
    kind,
    dayOfWeek: null,
    specificDate: date,
    startTime,
    endTime,
    location: event.location?.trim() || null,
  };
}

/** Merge synced events into the class list. Manual classes are never touched. */
export function mergeGoogleEvents(
  existing: ClassItem[],
  events: GoogleCalendarEvent[],
  kind: ClassKind = 'class',
  now: Date = new Date(),
): { classes: ClassItem[]; summary: SyncSummary } {
  const summary: SyncSummary = { added: 0, updated: 0, removed: 0, skipped: 0 };
  const result = [...existing];
  const incomingIds = new Set<string>();

  for (const event of events) {
    const mapped = mapGoogleEvent(event, kind);
    if (!mapped) {
      summary.skipped += 1;
      continue;
    }
    incomingIds.add(event.id);
    const idx = result.findIndex(
      c => c.source === 'google_calendar' && c.googleEventId === event.id,
    );
    if (idx >= 0) {
      result[idx] = { ...result[idx], ...mapped };
      summary.updated += 1;
    } else {
      result.push({
        ...mapped,
        id: newId('class'),
        source: 'google_calendar',
        googleEventId: event.id,
        createdAt: now.toISOString(),
      });
      summary.added += 1;
    }
  }

  const kept = result.filter(c => {
    const gone =
      c.source === 'google_calendar' &&
      c.googleEventId !== null &&
      !incomingIds.has(c.googleEventId);
    if (gone) {
      summary.removed += 1;
    }
    return !gone;
  });
  return { classes: kept, summary };
}

/**
 * Fetches events from the provider and merges them into the saved classes (manual classes are untouched).
 * @param provider supplies the Google Calendar events
 * @param kind class or lab for the imported events
 * @param now current time (for tests)
 * @returns how many events were added, updated, removed and skipped
 */
export async function syncGoogleCalendar(
  provider: CalendarSyncProvider,
  kind: ClassKind = 'class',
  now: Date = new Date(),
): Promise<SyncSummary> {
  const events = await provider.fetchEvents();
  const existing = await classRepository.list();
  const { classes, summary } = mergeGoogleEvents(existing, events, kind, now);
  await classRepository.saveAll(classes);
  return summary;
}
