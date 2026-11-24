/**
 * File: TaskManagerService.ts
 * Step 4 entry point. One class that holds everything about tasks and deadlines.
 * Other steps use it like this: Step 6 calls setStatus(id, 'in_progress'),
 * Step 8 calls markCompleted(id) after the photo is verified.
 */
import { Task, TaskInput, TaskStatus } from '../../types/schedule';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  markTaskCompleted,
  SaveTaskResult,
  setTaskStatus,
  TaskFilter,
  updateTask,
} from './taskService';

export class TaskManagerService {
  /** Adds a task (status starts as 'pending'). Returns the errors if the values are invalid. */
  create(input: TaskInput): Promise<SaveTaskResult> {
    return createTask(input);
  }

  /** Edits a task. Returns not_found if the id does not exist. */
  update(id: string, input: TaskInput): Promise<SaveTaskResult> {
    return updateTask(id, input);
  }

  /** Deletes a task. Returns false if it did not exist. */
  remove(id: string): Promise<boolean> {
    return deleteTask(id);
  }

  /** Finds one task by id. Returns null if it does not exist. */
  get(id: string): Promise<Task | null> {
    return getTask(id);
  }

  /** Lists tasks, soonest deadline first (completed last). Optional filter by category, priority or status. */
  list(filter: TaskFilter = {}): Promise<Task[]> {
    return listTasks(filter);
  }

  /** Changes a task's status (used by Step 6 for 'in_progress'). Returns null if the task does not exist. */
  setStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return setTaskStatus(id, status);
  }

  /** Marks a task completed and records the time (used by Step 8 after photo proof). */
  markCompleted(id: string): Promise<Task | null> {
    return markTaskCompleted(id);
  }
}
