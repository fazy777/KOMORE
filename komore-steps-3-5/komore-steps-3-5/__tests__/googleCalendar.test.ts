import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleCalendarEvent,
  mapGoogleEvent,
  mergeGoogleEvents,
  syncGoogleCalendar,
} from '../src/services/googleCalendar';
import { listClasses, saveClass } from '../src/features/classes/classService';

const ev = (over: Partial<GoogleCalendarEvent> = {}): GoogleCalendarEvent => ({
  id: 'e1',
  summary: 'Physics Lab',
  location: 'Lab 3',
  start: { dateTime: '2026-11-23T11:00:00+05:00' },
  end: { dateTime: '2026-11-23T12:30:00+05:00' },
  ...over,
});

const NOW = new Date(2026, 10, 22, 12, 0);

describe('Google Calendar sync (Step 3)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('turns a timed event into a fixed one-off class', () => {
    const mapped = mapGoogleEvent(ev(), 'lab');
    expect(mapped).toEqual({
      title: 'Physics Lab',
      kind: 'lab',
      dayOfWeek: null,
      specificDate: '2026-11-23',
      startTime: '11:00',
      endTime: '12:30',
      location: 'Lab 3',
    });
  });

  it('skips cancelled, all-day, multi-day and broken events', () => {
    expect(mapGoogleEvent(ev({ status: 'cancelled' }))).toBeNull();
    expect(mapGoogleEvent(ev({ start: { date: '2026-11-23' }, end: { date: '2026-11-24' } }))).toBeNull();
    expect(
      mapGoogleEvent(ev({ end: { dateTime: '2026-11-24T09:00:00+05:00' } })),
    ).toBeNull();
    expect(
      mapGoogleEvent(ev({ end: { dateTime: '2026-11-23T10:00:00+05:00' } })),
    ).toBeNull();
  });

  it('adds, updates and removes synced events but never touches manual classes', () => {
    const manual = {
      id: 'm1',
      title: 'Manual',
      kind: 'class' as const,
      dayOfWeek: 2,
      specificDate: null,
      startTime: '08:00',
      endTime: '09:00',
      location: null,
      source: 'manual' as const,
      googleEventId: null,
      createdAt: NOW.toISOString(),
    };
    const first = mergeGoogleEvents([manual], [ev({ id: 'a' }), ev({ id: 'b' })], 'class', NOW);
    expect(first.summary).toEqual({ added: 2, updated: 0, removed: 0, skipped: 0 });
    expect(first.classes).toHaveLength(3);

    const second = mergeGoogleEvents(
      first.classes,
      [ev({ id: 'a', summary: 'Renamed' }), ev({ id: 'c', status: 'cancelled' })],
      'class',
      NOW,
    );
    expect(second.summary).toEqual({ added: 0, updated: 1, removed: 1, skipped: 1 });
    expect(second.classes.map(c => c.title).sort()).toEqual(['Manual', 'Renamed']);
    expect(second.classes.find(c => c.id === 'm1')).toEqual(manual);
  });

  it('does not create duplicates when synced twice', async () => {
    const provider = { fetchEvents: async () => [ev({ id: 'x' })] };
    await syncGoogleCalendar(provider, 'class', NOW);
    const summary = await syncGoogleCalendar(provider, 'class', NOW);
    expect(summary.added).toBe(0);
    expect(summary.updated).toBe(1);
    expect(await listClasses()).toHaveLength(1);
  });

  it('keeps manual classes after a sync', async () => {
    await saveClass({
      title: 'Manual',
      kind: 'class',
      dayOfWeek: 3,
      specificDate: null,
      startTime: '08:00',
      endTime: '09:00',
      location: null,
    });
    await syncGoogleCalendar({ fetchEvents: async () => [ev()] }, 'class', NOW);
    const titles = (await listClasses()).map(c => c.title).sort();
    expect(titles).toEqual(['Manual', 'Physics Lab']);
  });
});
