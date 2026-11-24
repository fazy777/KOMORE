import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  combineDeadline,
  createTask,
  deleteTask,
  listTasks,
  markTaskCompleted,
  setTaskStatus,
  splitDeadline,
  updateTask,
  validateTaskInput,
} from '../src/features/tasks/taskService';
import { TaskInput } from '../src/types/schedule';

const NOW = new Date(2026, 10, 22, 12, 0);
const input = (over: Partial<TaskInput> = {}): TaskInput => ({
  title: 'Calculus Assignment 3',
  description: 'Chapters 4 and 5',
  category: 'assignment',
  priority: 'high',
  deadline: new Date(2026, 10, 25, 23, 59).toISOString(),
  estimatedMinutes: 90,
  ...over,
});

describe('task manager (Step 4)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('validates the fields', () => {
    expect(validateTaskInput(input({ title: ' ' }), NOW, true)).toContain('Title is required.');
    expect(validateTaskInput(input({ deadline: '' }), NOW, true).length).toBeGreaterThan(0);
    expect(
      validateTaskInput(input({ deadline: new Date(2026, 10, 20).toISOString() }), NOW, true),
    ).toContain('Deadline cannot be in the past.');
    expect(validateTaskInput(input({ estimatedMinutes: 0 }), NOW, true).length).toBeGreaterThan(0);
    expect(validateTaskInput(input({ estimatedMinutes: 721 }), NOW, true).length).toBeGreaterThan(0);
    expect(validateTaskInput(input({ estimatedMinutes: 30.5 }), NOW, true).length).toBeGreaterThan(0);
    expect(validateTaskInput(input(), NOW, true)).toHaveLength(0);
  });

  it('creates a pending task', async () => {
    const res = await createTask(input(), NOW);
    expect(res.status).toBe('saved');
    if (res.status === 'saved') {
      expect(res.item.status).toBe('pending');
      expect(res.item.completedAt).toBeNull();
      expect(res.item.createdAt).toBe(NOW.toISOString());
    }
    expect(await listTasks()).toHaveLength(1);
  });

  it('does not save an invalid task', async () => {
    const res = await createTask(input({ title: '' }), NOW);
    expect(res.status).toBe('invalid');
    expect(await listTasks()).toHaveLength(0);
  });

  it('lists soonest deadline first and completed tasks last', async () => {
    const a = await createTask(input({ title: 'A', deadline: new Date(2026, 10, 27, 12).toISOString() }), NOW);
    const b = await createTask(input({ title: 'B', deadline: new Date(2026, 10, 24, 12).toISOString() }), NOW);
    const c = await createTask(input({ title: 'C', deadline: new Date(2026, 10, 23, 12).toISOString() }), NOW);
    if (c.status !== 'saved' || a.status !== 'saved' || b.status !== 'saved') {
      throw new Error('setup failed');
    }
    await markTaskCompleted(c.item.id, NOW);
    const list = await listTasks();
    expect(list.map(t => t.title)).toEqual(['B', 'A', 'C']);
  });

  it('filters by category, priority and status', async () => {
    await createTask(input({ title: 'A', category: 'assignment', priority: 'high' }), NOW);
    await createTask(input({ title: 'B', category: 'exam_revision', priority: 'low' }), NOW);
    expect((await listTasks({ category: 'exam_revision' })).map(t => t.title)).toEqual(['B']);
    expect((await listTasks({ priority: 'high' })).map(t => t.title)).toEqual(['A']);
    expect(await listTasks({ status: 'completed' })).toHaveLength(0);
  });

  it('keeps an old deadline editable but rejects a new past deadline', async () => {
    const created = await createTask(input(), NOW);
    if (created.status !== 'saved') {
      throw new Error('setup failed');
    }
    const later = new Date(2026, 10, 30, 12, 0);
    const rename = await updateTask(created.item.id, input({ title: 'Renamed' }), later);
    expect(rename.status).toBe('saved');
    const pastDeadline = await updateTask(
      created.item.id,
      input({ deadline: new Date(2026, 10, 1).toISOString() }),
      later,
    );
    expect(pastDeadline.status).toBe('invalid');
  });

  it('reports not_found for a missing task', async () => {
    const res = await updateTask('nope', input(), NOW);
    expect(res.status).toBe('not_found');
  });

  it('marks a task completed with a time (used by Step 8)', async () => {
    const created = await createTask(input(), NOW);
    if (created.status !== 'saved') {
      throw new Error('setup failed');
    }
    const done = await markTaskCompleted(created.item.id, NOW);
    expect(done?.status).toBe('completed');
    expect(done?.completedAt).toBe(NOW.toISOString());
    const reopened = await setTaskStatus(created.item.id, 'pending', NOW);
    expect(reopened?.completedAt).toBeNull();
    expect(await markTaskCompleted('nope', NOW)).toBeNull();
  });

  it('deletes a task', async () => {
    const created = await createTask(input(), NOW);
    if (created.status !== 'saved') {
      throw new Error('setup failed');
    }
    expect(await deleteTask(created.item.id)).toBe(true);
    expect(await deleteTask(created.item.id)).toBe(false);
  });

  it('converts between form fields and the stored deadline', () => {
    const iso = combineDeadline('2026-11-21', '23:59');
    expect(iso).not.toBe('');
    expect(splitDeadline(iso)).toEqual({ date: '2026-11-21', time: '23:59' });
    expect(combineDeadline('2026-13-01', '10:00')).toBe('');
    expect(combineDeadline('2026-11-21', '25:00')).toBe('');
  });
});
