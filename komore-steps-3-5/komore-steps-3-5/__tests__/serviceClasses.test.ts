import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassScheduleService } from '../src/features/classes/ClassScheduleService';
import { TaskManagerService } from '../src/features/tasks/TaskManagerService';
import { TimetableManager } from '../src/features/timetable/TimetableManager';
import { createTask } from '../src/features/tasks/taskService';
import { ProfileProvider } from '../src/services/profileProvider';

// Test double for Step 2 (onboarding profile)
const profile: ProfileProvider = {
  getProfile: async () => ({
    studentType: 'day_scholar',
    sleepTime: '23:00',
    travelMinutes: 30,
  }),
};

const NOW = new Date(2026, 10, 22, 12, 0);

describe('service classes (merge entry points)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('ClassScheduleService saves, lists and removes classes', async () => {
    const svc = new ClassScheduleService();
    const res = await svc.save({
      title: 'SE',
      kind: 'class',
      dayOfWeek: 1,
      specificDate: null,
      startTime: '10:00',
      endTime: '11:00',
      location: null,
    });
    expect(res.status).toBe('saved');
    expect(await svc.list()).toHaveLength(1);
    if (res.status === 'saved') {
      expect((await svc.get(res.item.id))?.title).toBe('SE');
      expect(await svc.remove(res.item.id)).toBe(true);
    }
    expect(await svc.list()).toHaveLength(0);
  });

  it('ClassScheduleService syncs from a calendar provider', async () => {
    const svc = new ClassScheduleService();
    const summary = await svc.syncFromGoogle({
      fetchEvents: async () => [
        {
          id: 'g1',
          summary: 'Lab',
          start: { dateTime: '2026-11-23T11:00:00+05:00' },
          end: { dateTime: '2026-11-23T12:00:00+05:00' },
        },
      ],
    });
    expect(summary.added).toBe(1);
    expect(await svc.list()).toHaveLength(1);
  });

  it('TaskManagerService creates tasks and Step 6/8 can change their status', async () => {
    const svc = new TaskManagerService();
    const res = await svc.create({
      title: 'Calculus',
      category: 'assignment',
      priority: 'high',
      deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
      estimatedMinutes: 60,
    });
    expect(res.status).toBe('saved');
    if (res.status !== 'saved') {
      return;
    }
    expect((await svc.setStatus(res.item.id, 'in_progress'))?.status).toBe('in_progress');
    const done = await svc.markCompleted(res.item.id);
    expect(done?.status).toBe('completed');
    expect(await svc.list({ status: 'completed' })).toHaveLength(1);
  });

  it('TimetableManager builds a day using the plugged-in profile', async () => {
    await new ClassScheduleService().save({
      title: 'SE',
      kind: 'class',
      dayOfWeek: 1,
      specificDate: null,
      startTime: '10:00',
      endTime: '11:00',
      location: null,
    });
    // Created with a fixed clock so the test does not depend on today's date
    const created = await createTask(
      {
        title: 'Calculus',
        category: 'assignment',
        priority: 'high',
        deadline: new Date(2026, 10, 25, 23, 59).toISOString(),
        estimatedMinutes: 60,
      },
      NOW,
    );
    expect(created.status).toBe('saved');

    const manager = new TimetableManager({ profileProvider: profile, now: () => NOW });
    const tt = await manager.generate('2026-11-23'); // Monday
    const block = tt.entries.find(e => e.kind === 'task_block');
    // 30 minutes of travel before the 10:00 class leaves 08:00-09:30 free
    expect(block?.startTime).toBe('08:00');
    expect((await manager.getForDate('2026-11-23'))?.id).toBe(tt.id);

    if (block) {
      const moved = await manager.moveBlock(tt.id, block.id, { startTime: '14:00', endTime: '15:00' });
      expect(moved.status).toBe('saved');
      const after = await manager.removeBlock(tt.id, block.id);
      expect(after?.entries.some(e => e.kind === 'task_block')).toBe(false);
    }
  });
});
