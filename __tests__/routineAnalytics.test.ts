import { RoutineAnalyticsService } from '../src/services/routineAnalytics';
import { RoutineLogEntry } from '../src/types/routine';
import { UserProfile } from '../src/types/profile';

describe('RoutineAnalyticsService', () => {
  const mockDayScholarProfile: UserProfile = {
    id: 'user_1',
    name: 'Faizan Day Scholar',
    email: 'faizan@komore.app',
    archetype: 'day_scholar',
    dayScholarDetails: {
      commuteMinutesOneWay: 50,
      morningCommuteWindow: '07:30 - 08:30',
      eveningCommuteWindow: '16:30 - 17:30',
      transportMode: 'public_bus',
      canStudyDuringCommute: false,
    },
    environmentalRules: {
      noiseSensitivity: 'moderate',
      preferredStudySpace: 'bedroom',
      allowCommuteStudy: false,
      distractingAppsWhitelist: [],
    },
    lifestyleBoundaries: {
      wakeTime: '06:30',
      sleepTime: '23:00',
      maxContinuousStudyMinutes: 45,
      minimumBreakMinutes: 10,
      preferredStudyTime: 'morning',
      strictLockdownEnabled: true,
    },
    isOnboarded: true,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };

  const mockHostelProfile: UserProfile = {
    ...mockDayScholarProfile,
    archetype: 'hostel',
    dayScholarDetails: undefined,
    hostelDetails: {
      curfewTime: '21:30',
      diningMessHours: {
        breakfast: '07:30 - 08:30',
        lunch: '12:30 - 14:00',
        dinner: '19:30 - 21:00',
      },
      dormEnvironment: 'moderate',
      roomSharingCount: 2,
    },
  };

  it('handles empty routine logs gracefully', () => {
    const summary = RoutineAnalyticsService.computeSummary([], mockDayScholarProfile);
    expect(summary.totalSessions).toBe(0);
    expect(summary.totalFocusMinutes).toBe(0);
    expect(summary.averageRetentionSpan).toBe(0);
    expect(summary.averageFocusRating).toBe(0);
    expect(summary.peakEnergeticBlocks).toEqual([]);
    expect(summary.recurringBottleneckPatterns).toEqual([]);
    expect(summary.smartSuggestions.length).toBeGreaterThan(0);
  });

  it('computes accurate metrics and identifies peak energetic blocks', () => {
    const entries: RoutineLogEntry[] = [
      {
        id: '1',
        studentId: 'user_1',
        title: 'Math Calculus Integration',
        date: '2026-11-10T08:00:00.000Z',
        timeOfDayBlock: 'morning',
        durationMinutes: 60,
        retentionSpanMinutes: 50,
        focusRating: 5,
        bottleneckCategory: 'none',
        completedSuccessfully: true,
        createdAt: '2026-11-10T08:00:00.000Z',
      },
      {
        id: '2',
        studentId: 'user_1',
        title: 'Algorithms - Graph Traversals',
        date: '2026-11-10T14:00:00.000Z',
        timeOfDayBlock: 'afternoon',
        durationMinutes: 45,
        retentionSpanMinutes: 20,
        focusRating: 2,
        bottleneckCategory: 'commute_exhaustion',
        bottleneckNotes: 'Felt dizzy after bus ride',
        completedSuccessfully: false,
        createdAt: '2026-11-10T14:00:00.000Z',
      },
      {
        id: '3',
        studentId: 'user_1',
        title: 'Physics Mechanics Review',
        date: '2026-11-11T08:30:00.000Z',
        timeOfDayBlock: 'morning',
        durationMinutes: 50,
        retentionSpanMinutes: 45,
        focusRating: 4,
        bottleneckCategory: 'phone_distraction',
        completedSuccessfully: true,
        createdAt: '2026-11-11T08:30:00.000Z',
      },
    ];

    const summary = RoutineAnalyticsService.computeSummary(entries, mockDayScholarProfile);

    expect(summary.totalSessions).toBe(3);
    expect(summary.totalFocusMinutes).toBe(155); // 60 + 45 + 50
    expect(summary.averageRetentionSpan).toBe(38.3); // (50 + 20 + 45) / 3 = 38.33
    expect(summary.averageFocusRating).toBe(3.7); // (5 + 2 + 4) / 3 = 3.666 -> 3.7

    // Peak block should be morning (average rating (5+4)/2 = 4.5, vs afternoon 2.0)
    expect(summary.peakEnergeticBlocks.length).toBe(2);
    expect(summary.peakEnergeticBlocks[0].block).toBe('morning');
    expect(summary.peakEnergeticBlocks[0].averageFocusRating).toBe(4.5);
    expect(summary.peakEnergeticBlocks[1].block).toBe('afternoon');
    expect(summary.peakEnergeticBlocks[1].averageFocusRating).toBe(2.0);

    // Bottleneck distribution should reflect phone distraction and commute exhaustion
    const commuteBottleneck = summary.recurringBottleneckPatterns.find(
      (b) => b.category === 'commute_exhaustion'
    );
    expect(commuteBottleneck).toBeDefined();
    expect(commuteBottleneck?.count).toBe(1);
    expect(commuteBottleneck?.percentage).toBe(33); // 1 / 3 = 33%

    // Suggestions should include Day Scholar commute advice (commute is 50m > 40m)
    const hasCommuteAdvisory = summary.smartSuggestions.some((s) =>
      s.includes('Day Scholar Advisory')
    );
    expect(hasCommuteAdvisory).toBe(true);
  });

  it('generates hostel student specific advice when profile archetype is hostel', () => {
    const entries: RoutineLogEntry[] = [
      {
        id: '1',
        studentId: 'user_2',
        title: 'Distributed Systems',
        date: '2026-11-10T20:00:00.000Z',
        timeOfDayBlock: 'evening',
        durationMinutes: 50,
        retentionSpanMinutes: 40,
        focusRating: 4,
        bottleneckCategory: 'none',
        completedSuccessfully: true,
        createdAt: '2026-11-10T20:00:00.000Z',
      },
    ];

    const summary = RoutineAnalyticsService.computeSummary(entries, mockHostelProfile);
    const hasHostelAdvisory = summary.smartSuggestions.some((s) =>
      s.includes('Hostel Student Advisory')
    );
    expect(hasHostelAdvisory).toBe(true);
  });
});
