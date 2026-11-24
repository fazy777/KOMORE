import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteClass,
  listClasses,
  saveClass,
  validateClassInput,
} from '../src/features/classes/classService';
import { ClassInput } from '../src/types/schedule';

const base: ClassInput = {
  title: 'Software Engineering',
  kind: 'class',
  dayOfWeek: 1,
  specificDate: null,
  startTime: '08:00',
  endTime: '09:30',
  location: 'Room 12',
};

describe('class schedule (Step 3)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('rejects bad input', () => {
    expect(validateClassInput({ ...base, title: '' })).toContain('Title is required.');
    expect(validateClassInput({ ...base, startTime: '8am' }).length).toBeGreaterThan(0);
    expect(
      validateClassInput({ ...base, startTime: '10:00', endTime: '09:00' }),
    ).toContain('End time must be after the start time.');
    expect(validateClassInput({ ...base, dayOfWeek: null }).length).toBeGreaterThan(0);
    expect(validateClassInput({ ...base, dayOfWeek: 9 }).length).toBeGreaterThan(0);
    expect(
      validateClassInput({ ...base, dayOfWeek: null, specificDate: '2026-13-40' })
        .length,
    ).toBeGreaterThan(0);
  });

  it('saves and lists classes in day and time order', async () => {
    await saveClass({ ...base, title: 'B', dayOfWeek: 2, startTime: '08:00', endTime: '09:00' });
    await saveClass({ ...base, title: 'A', dayOfWeek: 1, startTime: '13:00', endTime: '14:00' });
    await saveClass({ ...base, title: 'C', dayOfWeek: 1, startTime: '08:00', endTime: '09:00' });
    const list = await listClasses();
    expect(list.map(c => c.title)).toEqual(['C', 'A', 'B']);
    expect(list[0].source).toBe('manual');
  });

  it('returns invalid without saving', async () => {
    const res = await saveClass({ ...base, title: '  ' });
    expect(res.status).toBe('invalid');
    expect(await listClasses()).toHaveLength(0);
  });

  it('warns about overlapping classes and saves when confirmed', async () => {
    await saveClass(base);
    const clash = { ...base, title: 'Lab', startTime: '09:00', endTime: '10:00' };
    const res = await saveClass(clash);
    expect(res.status).toBe('overlap');
    expect(await listClasses()).toHaveLength(1);

    const forced = await saveClass(clash, { allowOverlap: true });
    expect(forced.status).toBe('saved');
    expect(await listClasses()).toHaveLength(2);
  });

  it('allows classes that touch end to start', async () => {
    await saveClass(base);
    const res = await saveClass({ ...base, title: 'Next', startTime: '09:30', endTime: '10:30' });
    expect(res.status).toBe('saved');
  });

  it('detects an overlap between a weekly class and a one-off date', async () => {
    await saveClass(base); // Mondays 08:00-09:30
    const res = await saveClass({
      ...base,
      title: 'Makeup',
      dayOfWeek: null,
      specificDate: '2026-11-23', // a Monday
      startTime: '09:00',
      endTime: '10:00',
    });
    expect(res.status).toBe('overlap');
  });

  it('clears dayOfWeek when a specific date is given', async () => {
    const res = await saveClass({ ...base, specificDate: '2026-11-24' });
    expect(res.status).toBe('saved');
    if (res.status === 'saved') {
      expect(res.item.dayOfWeek).toBeNull();
      expect(res.item.specificDate).toBe('2026-11-24');
    }
  });

  it('edits an existing class without flagging it as its own conflict', async () => {
    const created = await saveClass(base);
    if (created.status !== 'saved') {
      throw new Error('setup failed');
    }
    const res = await saveClass(
      { ...base, endTime: '10:00' },
      { id: created.item.id },
    );
    expect(res.status).toBe('saved');
    const list = await listClasses();
    expect(list).toHaveLength(1);
    expect(list[0].endTime).toBe('10:00');
    expect(list[0].id).toBe(created.item.id);
  });

  it('reports not_found when editing a missing class', async () => {
    const res = await saveClass(base, { id: 'nope' });
    expect(res.status).toBe('not_found');
  });

  it('deletes a class', async () => {
    const created = await saveClass(base);
    if (created.status !== 'saved') {
      throw new Error('setup failed');
    }
    expect(await deleteClass(created.item.id)).toBe(true);
    expect(await deleteClass(created.item.id)).toBe(false);
    expect(await listClasses()).toHaveLength(0);
  });
});
