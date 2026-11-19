import { RoutineRepository } from '../src/services/routineRepository';

describe('RoutineRepository', () => {
  beforeEach(async () => {
    await RoutineRepository.clearLogs();
  });

  it('starts with empty logs array', async () => {
    const logs = await RoutineRepository.getLogs();
    expect(logs).toEqual([]);
  });

  it('adds a routine log with auto-generated id and timestamp', async () => {
    const created = await RoutineRepository.addLog({
      studentId: 'std_123',
      title: 'Operating Systems Virtual Memory',
      date: new Date().toISOString(),
      timeOfDayBlock: 'evening',
      durationMinutes: 45,
      retentionSpanMinutes: 40,
      focusRating: 4,
      bottleneckCategory: 'none',
      completedSuccessfully: true,
    });

    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeDefined();
    expect(created.title).toBe('Operating Systems Virtual Memory');

    const allLogs = await RoutineRepository.getLogs();
    expect(allLogs.length).toBe(1);
    expect(allLogs[0].id).toBe(created.id);
  });

  it('deletes a log entry by id', async () => {
    const log1 = await RoutineRepository.addLog({
      studentId: 'std_123',
      title: 'Linear Algebra',
      date: new Date().toISOString(),
      timeOfDayBlock: 'morning',
      durationMinutes: 30,
      retentionSpanMinutes: 25,
      focusRating: 5,
      bottleneckCategory: 'none',
      completedSuccessfully: true,
    });

    const log2 = await RoutineRepository.addLog({
      studentId: 'std_123',
      title: 'Data Structures',
      date: new Date().toISOString(),
      timeOfDayBlock: 'afternoon',
      durationMinutes: 40,
      retentionSpanMinutes: 20,
      focusRating: 3,
      bottleneckCategory: 'fatigue_or_sleepy',
      completedSuccessfully: false,
    });

    let current = await RoutineRepository.getLogs();
    expect(current.length).toBe(2);

    await RoutineRepository.deleteLog(log1.id);
    current = await RoutineRepository.getLogs();
    expect(current.length).toBe(1);
    expect(current[0].id).toBe(log2.id);
  });

  it('filters logs by studentId', async () => {
    await RoutineRepository.addLog({
      studentId: 'student_A',
      title: 'A Task',
      date: new Date().toISOString(),
      timeOfDayBlock: 'morning',
      durationMinutes: 30,
      retentionSpanMinutes: 25,
      focusRating: 4,
      bottleneckCategory: 'none',
      completedSuccessfully: true,
    });

    await RoutineRepository.addLog({
      studentId: 'student_B',
      title: 'B Task',
      date: new Date().toISOString(),
      timeOfDayBlock: 'evening',
      durationMinutes: 45,
      retentionSpanMinutes: 35,
      focusRating: 4,
      bottleneckCategory: 'none',
      completedSuccessfully: true,
    });

    const studentALogs = await RoutineRepository.getLogsByStudent('student_A');
    expect(studentALogs.length).toBe(1);
    expect(studentALogs[0].title).toBe('A Task');
  });
});
