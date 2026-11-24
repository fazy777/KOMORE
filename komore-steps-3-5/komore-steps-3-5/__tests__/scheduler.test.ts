import {
  scheduleDay,
  sortTasksByUrgency,
} from '../src/services/scheduler';
import { ClassItem, Task, TimetableEntry } from '../src/types/schedule';
import { ScheduleProfile } from '../src/types/profile';

// 2026-11-23 is a Monday, 2026-11-24 a Tuesday
const MONDAY = '2026-11-23';
const TUESDAY = '2026-11-24';

const profile: ScheduleProfile = {
  studentType: 'hostel',
  sleepTime: '23:00',
  travelMinutes: 0,
};

let n = 0;
function cls(over: Partial<ClassItem>): ClassItem {
  n += 1;
  return {
    id: `c${n}`,
    title: 'Class',
    kind: 'class',
    dayOfWeek: 1,
    specificDate: null,
    startTime: '08:00',
    endTime: '09:00',
    location: null,
    source: 'manual',
    googleEventId: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    ...over,
  };
}

function task(over: Partial<Task>): Task {
  n += 1;
  return {
    id: `t${n}`,
    title: 'Task',
    description: null,
    category: 'assignment',
    priority: 'medium',
    deadline: new Date(2026, 10, 25, 23, 59).toISOString(),
    estimatedMinutes: 60,
    status: 'pending',
    completedAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    ...over,
  };
}

const due = (day: number, h = 23, m = 59) =>
  new Date(2026, 10, day, h, m).toISOString();

function blocksFor(entries: TimetableEntry[], taskId: string) {
  return entries.filter(e => e.taskId === taskId);
}

describe('scheduleDay', () => {
  it('keeps classes fixed and puts urgent tasks into the gaps', () => {
    const classes = [
      cls({ title: 'SE', startTime: '08:00', endTime: '09:30' }),
      cls({ title: 'Lab', kind: 'lab', startTime: '11:00', endTime: '12:30' }),
      cls({ title: 'DSA', startTime: '13:00', endTime: '14:00' }),
    ];
    const a = task({ deadline: due(24), estimatedMinutes: 90 });
    const b = task({ deadline: due(25), estimatedMinutes: 120 });
    const c = task({ deadline: due(26), estimatedMinutes: 45 });

    const { entries, unplaced } = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [c, b, a],
      profile,
    });

    expect(unplaced).toHaveLength(0);
    const classEntries = entries.filter(e => e.kind === 'class');
    expect(classEntries.map(e => [e.startTime, e.endTime])).toEqual([
      ['08:00', '09:30'],
      ['11:00', '12:30'],
      ['13:00', '14:00'],
    ]);
    expect(blocksFor(entries, a.id)[0].startTime).toBe('09:30');
    expect(blocksFor(entries, a.id)[0].endTime).toBe('11:00');
    expect(blocksFor(entries, b.id)[0].startTime).toBe('14:00');
    expect(blocksFor(entries, b.id)[0].endTime).toBe('16:00');
    expect(blocksFor(entries, c.id)[0].startTime).toBe('16:00');
    expect(blocksFor(entries, c.id)[0].endTime).toBe('16:45');
  });

  it('never lets a task block overlap a class', () => {
    const classes = [
      cls({ startTime: '09:00', endTime: '10:00' }),
      cls({ startTime: '11:00', endTime: '22:00' }),
    ];
    const t = task({ estimatedMinutes: 90 });
    const { entries } = scheduleDay({ date: MONDAY, classes, tasks: [t], profile });
    const blocks = entries.filter(e => e.kind === 'task_block');
    for (const blk of blocks) {
      for (const c of classes) {
        const overlap = blk.startTime < c.endTime && c.startTime < blk.endTime;
        expect(overlap).toBe(false);
      }
    }
  });

  it('places the task with the nearer deadline first when only one fits', () => {
    const classes = [cls({ startTime: '09:00', endTime: '22:00' })];
    const soon = task({ deadline: due(24), estimatedMinutes: 60 });
    const later = task({ deadline: due(25), estimatedMinutes: 60 });
    const { entries, unplaced } = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [later, soon],
      profile,
    });
    expect(blocksFor(entries, soon.id)).toHaveLength(1);
    expect(blocksFor(entries, later.id)).toHaveLength(0);
    expect(unplaced).toEqual([{ taskId: later.id, minutes: 60 }]);
  });

  it('uses priority when deadlines are equal', () => {
    const low = task({ priority: 'low' });
    const high = task({ priority: 'high' });
    const sorted = sortTasksByUrgency([low, high]);
    expect(sorted[0].id).toBe(high.id);
  });

  it('reserves travel time before the first and after the last class', () => {
    const classes = [cls({ startTime: '10:00', endTime: '11:00' })];
    const t = task({ estimatedMinutes: 90 });
    const { entries } = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [t],
      profile: { ...profile, studentType: 'day_scholar', travelMinutes: 30 },
    });
    const blk = blocksFor(entries, t.id)[0];
    expect(blk.startTime).toBe('08:00');
    expect(blk.endTime).toBe('09:30');

    const t2 = task({ estimatedMinutes: 120 });
    const result2 = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [t2],
      profile: { ...profile, studentType: 'day_scholar', travelMinutes: 30 },
    });
    // 08:00-09:30 is too short for 120 minutes, so it starts after the trip home
    expect(blocksFor(result2.entries, t2.id)[0].startTime).toBe('11:30');
  });

  it('does not reserve travel time on a day without classes', () => {
    const t = task({ estimatedMinutes: 60 });
    const { entries } = scheduleDay({
      date: TUESDAY,
      classes: [cls({ dayOfWeek: 1 })],
      tasks: [t],
      profile: { ...profile, studentType: 'day_scholar', travelMinutes: 45 },
    });
    expect(blocksFor(entries, t.id)[0].startTime).toBe('08:00');
  });

  it('splits a task across gaps when no single gap is big enough', () => {
    const classes = [
      cls({ startTime: '09:00', endTime: '10:00' }),
      cls({ startTime: '11:00', endTime: '22:00' }),
    ];
    const t = task({ estimatedMinutes: 90 });
    const { entries, unplaced } = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [t],
      profile,
    });
    const blocks = blocksFor(entries, t.id);
    expect(unplaced).toHaveLength(0);
    expect(blocks.map(b => [b.startTime, b.endTime])).toEqual([
      ['08:00', '09:00'],
      ['10:00', '10:30'],
    ]);
  });

  it('stops before bedtime minus the buffer and reports what did not fit', () => {
    const classes = [cls({ startTime: '08:00', endTime: '20:30' })];
    const t = task({ estimatedMinutes: 60 });
    const { entries, unplaced } = scheduleDay({
      date: MONDAY,
      classes,
      tasks: [t],
      profile: { ...profile, sleepTime: '22:00' },
    });
    const blocks = blocksFor(entries, t.id);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].startTime).toBe('20:30');
    expect(blocks[0].endTime).toBe('21:00');
    expect(unplaced).toEqual([{ taskId: t.id, minutes: 30 }]);
  });

  it('handles a bedtime after midnight', () => {
    const t = task({ estimatedMinutes: 960 });
    const { entries, unplaced } = scheduleDay({
      date: TUESDAY,
      classes: [],
      tasks: [t],
      profile: { ...profile, sleepTime: '00:30' },
    });
    const blocks = blocksFor(entries, t.id);
    expect(blocks[blocks.length - 1].endTime).toBe('23:30');
    expect(unplaced).toEqual([{ taskId: t.id, minutes: 30 }]);
  });

  it('ignores completed and in-progress tasks', () => {
    const done = task({ status: 'completed' });
    const running = task({ status: 'in_progress' });
    const pending = task({ status: 'pending' });
    const { entries } = scheduleDay({
      date: MONDAY,
      classes: [],
      tasks: [done, running, pending],
      profile,
    });
    expect(blocksFor(entries, done.id)).toHaveLength(0);
    expect(blocksFor(entries, running.id)).toHaveLength(0);
    expect(blocksFor(entries, pending.id)).toHaveLength(1);
  });

  it('ignores tasks due after the planning horizon', () => {
    const far = task({ deadline: new Date(2026, 11, 20, 12, 0).toISOString() });
    const { entries } = scheduleDay({
      date: MONDAY,
      classes: [],
      tasks: [far],
      profile,
    });
    expect(blocksFor(entries, far.id)).toHaveLength(0);
  });

  it('keeps work before the deadline when it is due the same day', () => {
    const early = task({ deadline: due(23, 10, 0), estimatedMinutes: 60 });
    const fits = scheduleDay({
      date: MONDAY,
      classes: [cls({ startTime: '09:00', endTime: '22:00' })],
      tasks: [early],
      profile,
    });
    expect(blocksFor(fits.entries, early.id)[0].endTime).toBe('09:00');

    const late = task({ deadline: due(23, 10, 0), estimatedMinutes: 60 });
    const misses = scheduleDay({
      date: MONDAY,
      classes: [cls({ startTime: '08:00', endTime: '10:30' })],
      tasks: [late],
      profile,
    });
    expect(blocksFor(misses.entries, late.id)).toHaveLength(0);
    expect(misses.unplaced).toEqual([{ taskId: late.id, minutes: 60 }]);
  });

  it('keeps blocks the student edited and only plans the remaining minutes', () => {
    const t = task({ estimatedMinutes: 90 });
    const edited: TimetableEntry = {
      id: 'kept',
      kind: 'task_block',
      classId: null,
      taskId: t.id,
      startTime: '10:00',
      endTime: '11:00',
      editedByStudent: true,
    };
    const { entries } = scheduleDay({
      date: MONDAY,
      classes: [],
      tasks: [t],
      profile,
      preservedEntries: [edited],
    });
    const blocks = blocksFor(entries, t.id);
    expect(blocks.some(b => b.id === 'kept')).toBe(true);
    const fresh = blocks.find(b => b.id !== 'kept');
    expect(fresh?.startTime).toBe('08:00');
    expect(fresh?.endTime).toBe('08:30');
  });

  it('drops an edited block that a class now overlaps', () => {
    const t = task({ estimatedMinutes: 60 });
    const edited: TimetableEntry = {
      id: 'old',
      kind: 'task_block',
      classId: null,
      taskId: t.id,
      startTime: '09:00',
      endTime: '10:00',
      editedByStudent: true,
    };
    const { entries } = scheduleDay({
      date: MONDAY,
      classes: [cls({ startTime: '09:30', endTime: '10:30' })],
      tasks: [t],
      profile,
      preservedEntries: [edited],
    });
    expect(entries.some(e => e.id === 'old')).toBe(false);
  });

  it('does not plan in the past when planning today', () => {
    const t = task({ estimatedMinutes: 60 });
    const { entries } = scheduleDay({
      date: MONDAY,
      classes: [],
      tasks: [t],
      profile,
      options: { nowMinutes: 603 },
    });
    expect(blocksFor(entries, t.id)[0].startTime).toBe('10:05');
  });

  it('shows a one-off class only on its own date', () => {
    const oneOff = cls({
      dayOfWeek: null,
      specificDate: TUESDAY,
      startTime: '12:00',
      endTime: '13:00',
    });
    const monday = scheduleDay({ date: MONDAY, classes: [oneOff], tasks: [], profile });
    const tuesday = scheduleDay({ date: TUESDAY, classes: [oneOff], tasks: [], profile });
    expect(monday.entries).toHaveLength(0);
    expect(tuesday.entries).toHaveLength(1);
  });
});
