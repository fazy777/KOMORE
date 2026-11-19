export type TimeOfDayBlock =
  | 'early_morning' // 05:00 - 08:00
  | 'morning'       // 08:00 - 12:00
  | 'afternoon'     // 12:00 - 17:00
  | 'evening'       // 17:00 - 21:00
  | 'late_night';   // 21:00 - 05:00

export type FocusRating = 1 | 2 | 3 | 4 | 5;

export type BottleneckCategory =
  | 'phone_distraction'
  | 'commute_exhaustion'
  | 'noisy_environment'
  | 'fatigue_or_sleepy'
  | 'procrastination'
  | 'unexpected_interruption'
  | 'hunger_or_meal_clash'
  | 'none'
  | 'other';

export interface RoutineLogEntry {
  id: string;
  studentId: string;
  title: string;
  date: string; // ISO 8601 string
  timeOfDayBlock: TimeOfDayBlock;
  durationMinutes: number; // planned or executed duration
  retentionSpanMinutes: number; // actual continuous focus span before losing track
  focusRating: FocusRating; // 1 to 5 scale
  bottleneckCategory: BottleneckCategory;
  bottleneckNotes?: string;
  completedSuccessfully: boolean;
  createdAt: string;
}

export interface PeakBlockStat {
  block: TimeOfDayBlock;
  label: string;
  averageFocusRating: number;
  averageRetentionSpan: number;
  sessionCount: number;
}

export interface BottleneckPatternStat {
  category: BottleneckCategory;
  label: string;
  count: number;
  percentage: number;
}

export interface RoutineAnalyticsSummary {
  totalSessions: number;
  totalFocusMinutes: number;
  averageRetentionSpan: number;
  averageFocusRating: number;
  peakEnergeticBlocks: PeakBlockStat[];
  recurringBottleneckPatterns: BottleneckPatternStat[];
  smartSuggestions: string[];
}
