/**
 * File: scheduleRepositories.ts
 * The three lists used by Steps 3-5: classes, tasks and timetables.
 */
import { createRepository } from './repository';
import { ClassItem, Task, Timetable } from '../types/schedule';

export const classRepository = createRepository<ClassItem>('komore:classes');
export const taskRepository = createRepository<Task>('komore:tasks');
export const timetableRepository = createRepository<Timetable>(
  'komore:timetables',
);
