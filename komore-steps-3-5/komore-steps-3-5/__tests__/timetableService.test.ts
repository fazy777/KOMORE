import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveClass } from '../src/features/classes/classService';
import {
  createTask,
  listTasks,
  markTaskCompleted,
} from '../src/features/tasks/taskService';
import {
  generateTimetable,
  getTimetable,
  removeTaskBlock,
  updateTaskBlock,
} from '../src/features/timetable/timetableService';
import { ProfileProvider } from '../src/services/profileProvider';
import { ScheduleProfile } from '../src/types/profile';
import { timetableRepository } from '../src/storage/scheduleRepositories';

// Test double for Step 2 (onboarding profile), so these tests do not depend on that branch
const fakeProfile = (over: Partial<ScheduleProfile> = {}): ProfileProvider => ({
  getProfile: async () => ({
    studentType: 'hostel',
    sleepTime: '23:00',
    travelMinutes: 0,
    ...over,
  }),
});

const DATE = '2026-11-23'; // Monday
const NOW = new Date(2026, 10, 22, 12, 0); // the day before, so nothing is "today"

async function seed() {
  await saveClass({
    title: 'Software Engineering',
    kind: 'class',
    dayOfWeek: 1,
    specificDate: null,
    startTime: '08:00',
    endTime: '09:30',
    location: null,
  });
  const urgent = await createTask(
    {
      title: 'Calculus',
      category: 'assignment',
      priority: 'high',
      deadline: new Date(2026, 10, 24, 23, 59).toISOString(),
      estimatedMinutes: 90,
    },
    NOW,
  );
  const later = await createTask(
    {
      title: 'Revision',
      category: 'exam_revision',
      priority: 'medium',
      deadline: new Date(2026, 10, 26, 23, 59).toISOString(),
      estimatedMinutes: 60,
    },
    NOW,
  );
  if (urgent.status !== 'saved' || later.status !== 'saved') {
    throw new Error('setup failed');
  }
  return { urgent: urgent.item, later: later.item };
}

describe('timetable maker (Step 5)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('generates a plan from classes and tasks and marks tasks scheduled', async () => {
    const { urgent } = await seed();
    const tt = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });

    expect(tt.date).toBe(DATE);
    expect(tt.isActive).toBe(true);
    expect(tt.entries.filter(e => e.kind === 'class')).toHaveLength(1);
    const first = tt.entries.find(e => e.taskId === urgent.id);
    expect(first?.startTime).toBe('09:30');

    const tasks = await listTasks();
    expect(tasks.every(t => t.status === 'scheduled')).toBe(true);
    expect((await getTimetable(DATE))?.id).toBe(tt.id);
  });

  it('uses the onboarding profile: travel time changes the plan', async () => {
    await seed();
    const noTravel = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });
    await AsyncStorage.clear();
    await seed();
    const withTravel = await generateTimetable(DATE, {
      profileProvider: fakeProfile({ studentType: 'day_scholar', travelMinutes: 30 }),
      now: NOW,
    });
    const startOf = (tt: typeof noTravel) =>
      tt.entries.filter(e => e.kind === 'task_block').map(e => e.startTime)[0];
    expect(startOf(noTravel)).toBe('09:30');
    expect(startOf(withTravel)).toBe('10:00');
  });

  it('keeps one active timetable per day and archives the old one', async () => {
    await seed();
    const opts = { profileProvider: fakeProfile(), now: NOW };
    const one = await generateTimetable(DATE, opts);
    const two = await generateTimetable(DATE, opts);
    const all = await timetableRepository.list();
    expect(all).toHaveLength(2);
    expect(all.filter(t => t.isActive)).toHaveLength(1);
    expect((await getTimetable(DATE))?.id).toBe(two.id);
    expect(all.find(t => t.id === one.id)?.isActive).toBe(false);
  });

  it('returns null when no timetable exists for a day', async () => {
    expect(await getTimetable(DATE)).toBeNull();
  });

  it('lets the student move a task block and keeps it on regeneration', async () => {
    const { urgent } = await seed();
    const opts = { profileProvider: fakeProfile(), now: NOW };
    const tt = await generateTimetable(DATE, opts);
    const block = tt.entries.find(e => e.taskId === urgent.id);
    if (!block) {
      throw new Error('block missing');
    }
    const res = await updateTaskBlock(tt.id, block.id, { startTime: '15:00', endTime: '16:30' });
    expect(res.status).toBe('saved');

    const again = await generateTimetable(DATE, opts);
    const kept = again.entries.find(e => e.taskId === urgent.id);
    expect(kept?.startTime).toBe('15:00');
    expect(kept?.endTime).toBe('16:30');
    expect(kept?.editedByStudent).toBe(true);
    // the task is not planned twice
    expect(again.entries.filter(e => e.taskId === urgent.id)).toHaveLength(1);
  });

  it('rejects an edit that overlaps another entry or has bad times', async () => {
    const { urgent } = await seed();
    const tt = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });
    const block = tt.entries.find(e => e.taskId === urgent.id);
    if (!block) {
      throw new Error('block missing');
    }
    expect((await updateTaskBlock(tt.id, block.id, { startTime: '09:00', endTime: '10:00' })).status).toBe('conflict');
    expect((await updateTaskBlock(tt.id, block.id, { startTime: '10:00', endTime: '09:00' })).status).toBe('invalid');
    expect((await updateTaskBlock(tt.id, block.id, { startTime: 'abc', endTime: '09:00' })).status).toBe('invalid');
  });

  it('never lets a fixed class entry be edited or removed', async () => {
    await seed();
    const tt = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });
    const classEntry = tt.entries.find(e => e.kind === 'class');
    if (!classEntry) {
      throw new Error('class entry missing');
    }
    expect((await updateTaskBlock(tt.id, classEntry.id, { startTime: '10:00', endTime: '11:00' })).status).toBe('not_found');
    expect(await removeTaskBlock(tt.id, classEntry.id)).toBeNull();
  });

  it('puts a task back to pending when its last block is removed', async () => {
    const { urgent } = await seed();
    const tt = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });
    const block = tt.entries.find(e => e.taskId === urgent.id);
    if (!block) {
      throw new Error('block missing');
    }
    const updated = await removeTaskBlock(tt.id, block.id);
    expect(updated?.entries.some(e => e.taskId === urgent.id)).toBe(false);
    const task = (await listTasks()).find(t => t.id === urgent.id);
    expect(task?.status).toBe('pending');
  });

  it('does not plan completed tasks', async () => {
    const { urgent } = await seed();
    await markTaskCompleted(urgent.id, NOW);
    const tt = await generateTimetable(DATE, { profileProvider: fakeProfile(), now: NOW });
    expect(tt.entries.some(e => e.taskId === urgent.id)).toBe(false);
  });
});
