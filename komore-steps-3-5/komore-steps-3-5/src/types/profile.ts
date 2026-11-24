// What the timetable maker (Step 5) needs from the onboarding profile (Step 2).
// The onboarding feature owns the real profile. src/services/profileProvider.ts is the
// ONLY place that has to be adapted to the real Step 2 storage once it is merged.

export type StudentType = 'day_scholar' | 'hostel';

export interface ScheduleProfile {
  studentType: StudentType;
  /** Usual bedtime, 24-hour HH:mm */
  sleepTime: string;
  /** One-way travel time to campus in minutes */
  travelMinutes: number;
}
