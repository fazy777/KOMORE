/**
 * File: taskService.ts
 * Step 4: task manager logic (create, edit, delete, list, status changes).
 */
import { taskRepository } from '../../storage/scheduleRepositories';
import { newId } from '../../services/ids';
import { isValidDate, isValidTime } from '../../services/timeUtils';
import {
  Task,
  TaskCategory,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from '../../types/schedule';

export type SaveTaskResult =
  | { status: 'saved'; item: Task }
  | { status: 'invalid'; errors: string[] }
  | { status: 'not_found' };

const CATEGORIES: TaskCategory[] = ['assignment', 'exam_revision', 'lecture_recap'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const MAX_MINUTES = 720;

/** Join a YYYY-MM-DD date and an HH:mm time (local time) into an ISO string. Empty if invalid. */
export function combineDeadline(date: string, time: string): string {
  if (!isValidDate(date.trim()) || !isValidTime(time.trim())) {
    return '';
  }
  const d = new Date(`${date.trim()}T${time.trim()}:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

/** Split an ISO deadline back into local date and time strings for the form. */
export function splitDeadline(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

/**
 * Checks task values and lists every problem found (empty list means valid).
 * @param input task values
 * @param now current time (for tests)
 * @param requireFutureDeadline true when the deadline must not be in the past
 * @returns error messages for the student
 */
export function validateTaskInput(
  input: TaskInput,
  now: Date,
  requireFutureDeadline: boolean,
): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) {
    errors.push('Title is required.');
  }
  if (!CATEGORIES.includes(input.category)) {
    errors.push('Choose a category.');
  }
  if (!PRIORITIES.includes(input.priority)) {
    errors.push('Choose a priority.');
  }
  const deadlineMs = Date.parse(input.deadline);
  if (!input.deadline || Number.isNaN(deadlineMs)) {
    errors.push('Enter a valid deadline date and time.');
  } else if (requireFutureDeadline && deadlineMs < now.getTime()) {
    errors.push('Deadline cannot be in the past.');
  }
  if (
    !Number.isInteger(input.estimatedMinutes) ||
    input.estimatedMinutes <= 0 ||
    input.estimatedMinutes > MAX_MINUTES
  ) {
    errors.push(`Estimated time must be between 1 and ${MAX_MINUTES} minutes.`);
  }
  return errors;
}

/**
 * Creates a new task with status 'pending' after validating it.
 * @param input task values
 * @param now current time (for tests)
 * @returns saved (with the task) | invalid (with errors)
 */
export async function createTask(
  input: TaskInput,
  now: Date = new Date(),
): Promise<SaveTaskResult> {
  const errors = validateTaskInput(input, now, true);
  if (errors.length > 0) {
    return { status: 'invalid', errors };
  }
  const item: Task = {
    id: newId('task'),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    category: input.category,
    priority: input.priority,
    deadline: input.deadline,
    estimatedMinutes: input.estimatedMinutes,
    status: 'pending',
    completedAt: null,
    createdAt: now.toISOString(),
  };
  const all = await taskRepository.list();
  await taskRepository.saveAll([...all, item]);
  return { status: 'saved', item };
}

/**
 * Edits an existing task. A deadline in the past is only rejected when the deadline itself is being changed.
 * @param id the task id
 * @param input new task values
 * @param now current time (for tests)
 * @returns saved | invalid | not_found
 */
export async function updateTask(
  id: string,
  input: TaskInput,
  now: Date = new Date(),
): Promise<SaveTaskResult> {
  const all = await taskRepository.list();
  const existing = all.find(t => t.id === id);
  if (!existing) {
    return { status: 'not_found' };
  }
  // Only a changed deadline has to be in the future, so old tasks stay editable.
  const errors = validateTaskInput(input, now, input.deadline !== existing.deadline);
  if (errors.length > 0) {
    return { status: 'invalid', errors };
  }
  const item: Task = {
    ...existing,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    category: input.category,
    priority: input.priority,
    deadline: input.deadline,
    estimatedMinutes: input.estimatedMinutes,
  };
  await taskRepository.saveAll(all.map(t => (t.id === id ? item : t)));
  return { status: 'saved', item };
}

/**
 * Deletes a task.
 * @param id the task id
 * @returns true if it was deleted, false if it did not exist
 */
export async function deleteTask(id: string): Promise<boolean> {
  const all = await taskRepository.list();
  const next = all.filter(t => t.id !== id);
  if (next.length === all.length) {
    return false;
  }
  await taskRepository.saveAll(next);
  return true;
}

/**
 * Finds one saved task.
 * @param id the task id
 * @returns the task, or null if it does not exist
 */
export async function getTask(id: string): Promise<Task | null> {
  const all = await taskRepository.list();
  return all.find(t => t.id === id) ?? null;
}

export interface TaskFilter {
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
}

/** Soonest deadline first. Completed tasks go to the end. */
export async function listTasks(filter: TaskFilter = {}): Promise<Task[]> {
  const all = await taskRepository.list();
  return all
    .filter(
      t =>
        (!filter.category || t.category === filter.category) &&
        (!filter.priority || t.priority === filter.priority) &&
        (!filter.status || t.status === filter.status),
    )
    .sort((a, b) => {
      const doneA = a.status === 'completed' ? 1 : 0;
      const doneB = b.status === 'completed' ? 1 : 0;
      return doneA - doneB || Date.parse(a.deadline) - Date.parse(b.deadline);
    });
}

/** Used by Step 6 (for example 'in_progress') and by the timetable maker. */
export async function setTaskStatus(
  id: string,
  status: TaskStatus,
  now: Date = new Date(),
): Promise<Task | null> {
  const all = await taskRepository.list();
  const existing = all.find(t => t.id === id);
  if (!existing) {
    return null;
  }
  const item: Task = {
    ...existing,
    status,
    completedAt: status === 'completed' ? now.toISOString() : null,
  };
  await taskRepository.saveAll(all.map(t => (t.id === id ? item : t)));
  return item;
}

/** Called by Step 8 (photo proof) once the photo is verified. */
export function markTaskCompleted(
  id: string,
  now: Date = new Date(),
): Promise<Task | null> {
  return setTaskStatus(id, 'completed', now);
}
