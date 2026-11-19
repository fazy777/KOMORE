import { ProfileRepository } from '../src/services/profileRepository';
import { UserProfile } from '../src/types/profile';

describe('ProfileRepository', () => {
  beforeEach(async () => {
    await ProfileRepository.clearProfile();
  });

  const testProfile: UserProfile = {
    id: 'test_std_01',
    name: 'Ahmad Raza',
    email: 'ahmad@nust.edu.pk',
    university: 'NUST',
    archetype: 'day_scholar',
    dayScholarDetails: {
      commuteMinutesOneWay: 35,
      morningCommuteWindow: '07:15 - 08:00',
      eveningCommuteWindow: '16:00 - 17:00',
      transportMode: 'metro_train',
      canStudyDuringCommute: true,
    },
    environmentalRules: {
      noiseSensitivity: 'low',
      preferredStudySpace: 'campus_library',
      allowCommuteStudy: true,
      distractingAppsWhitelist: ['WhatsApp'],
    },
    lifestyleBoundaries: {
      wakeTime: '06:00',
      sleepTime: '22:30',
      maxContinuousStudyMinutes: 50,
      minimumBreakMinutes: 10,
      preferredStudyTime: 'early_morning',
      strictLockdownEnabled: true,
    },
    isOnboarded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('saves and retrieves student profile', async () => {
    const saved = await ProfileRepository.saveProfile(testProfile);
    expect(saved).toBe(true);

    const retrieved = await ProfileRepository.getProfile();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Ahmad Raza');
    expect(retrieved?.archetype).toBe('day_scholar');
    expect(retrieved?.dayScholarDetails?.commuteMinutesOneWay).toBe(35);
  });

  it('partially updates existing profile', async () => {
    await ProfileRepository.saveProfile(testProfile);

    const updated = await ProfileRepository.updateProfile({
      university: 'FAST-NUCES',
      lifestyleBoundaries: {
        ...testProfile.lifestyleBoundaries,
        maxContinuousStudyMinutes: 60,
      },
    });

    expect(updated).not.toBeNull();
    expect(updated?.university).toBe('FAST-NUCES');
    expect(updated?.lifestyleBoundaries.maxContinuousStudyMinutes).toBe(60);

    const fresh = await ProfileRepository.getProfile();
    expect(fresh?.university).toBe('FAST-NUCES');
  });

  it('correctly reports onboarding status and clears profile', async () => {
    expect(await ProfileRepository.isOnboarded()).toBe(false);

    await ProfileRepository.saveProfile(testProfile);
    expect(await ProfileRepository.isOnboarded()).toBe(true);

    await ProfileRepository.clearProfile();
    expect(await ProfileRepository.isOnboarded()).toBe(false);
    expect(await ProfileRepository.getProfile()).toBeNull();
  });
});
