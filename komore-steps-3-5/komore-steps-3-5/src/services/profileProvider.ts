/**
 * File: profileProvider.ts
 * Connection point to Step 2 (onboarding profile). Only this file must change when Step 2 is merged.
 */
import { ScheduleProfile } from '../types/profile';
import { isValidTime } from './timeUtils';

export interface ProfileProvider {
  getProfile(): Promise<ScheduleProfile>;
}

export const DEFAULT_PROFILE: ScheduleProfile = {
  studentType: 'day_scholar',
  sleepTime: '23:00',
  travelMinutes: 0,
};

/** Fill missing or invalid fields with safe defaults. */
export function normalizeProfile(
  raw: Partial<ScheduleProfile> | null | undefined,
): ScheduleProfile {
  const p = raw ?? {};
  return {
    studentType:
      p.studentType === 'hostel' || p.studentType === 'day_scholar'
        ? p.studentType
        : DEFAULT_PROFILE.studentType,
    sleepTime:
      typeof p.sleepTime === 'string' && isValidTime(p.sleepTime)
        ? p.sleepTime
        : DEFAULT_PROFILE.sleepTime,
    travelMinutes:
      typeof p.travelMinutes === 'number' &&
      Number.isFinite(p.travelMinutes) &&
      p.travelMinutes >= 0
        ? Math.round(p.travelMinutes)
        : DEFAULT_PROFILE.travelMinutes,
  };
}

/**
 * Temporary provider used until Step 2 (onboarding branch) is merged.
 * TODO(Step 2): replace the body with a read of the onboarding profile from AsyncStorage
 * and map its fields into ScheduleProfile (use normalizeProfile on the result).
 * Tests inject their own fake provider, so nothing else needs to change.
 */
export const defaultProfileProvider: ProfileProvider = {
  async getProfile() {
    return DEFAULT_PROFILE;
  },
};
