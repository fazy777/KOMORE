// Types for Steps 3, 4 and 5 (class schedule, task manager, timetable).
// Field names mirror the PostgreSQL schema in database/001_classes_tasks_timetables.sql
// (camelCase here, snake_case in the database).

export type ClassKind = 'class' | 'lab';
export type ClassSource = 'manual' | 'google_calendar';

export interface ClassItem {
  id: string;
  title: string;
  kind: ClassKind;
  /** 1 = Monday ... 7 = Sunday. Null for a one-off class that has a specificDate. */
  dayOfWeek: number | null;
  /** YYYY-MM-DD for a one-off class (for example a synced calendar event). */
  specificDate: string | null;
  /** 24-hour HH:mm */
  startTime: string;
  endTime: string;
  location: string | null;
  source: ClassSource;
  googleEventId: string | null;
  createdAt: string;
}

export interface ClassInput {
  title: string;
  kind: ClassKind;
  dayOfWeek: number | null;
  specificDate: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
}

export type TaskCategory = 'assignment' | 'exam_revision' | 'lecture_recap';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  /** ISO date-time string */
  deadline: string;
  estimatedMinutes: number;
  status: TaskStatus;
  /** Set by Step 8 (photo proof) through markTaskCompleted(). */
  completedAt: string | null;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: string;
  estimatedMinutes: number;
}

export type EntryKind = 'class' | 'task_block';

export interface TimetableEntry {
  id: string;
  kind: EntryKind;
  classId: string | null;
  taskId: string | null;
  /** HH:mm on the timetable's date */
  startTime: string;
  endTime: string;
  /** True when the student moved this block by hand. Kept when the timetable is regenerated. */
  editedByStudent: boolean;
}

export interface UnplacedTask {
  taskId: string;
  /** Minutes of the task that did not fit into any free gap. */
  minutes: number;
}

export interface Timetable {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  generatedAt: string;
  isActive: boolean;
  entries: TimetableEntry[];
  unplaced: UnplacedTask[];
}
