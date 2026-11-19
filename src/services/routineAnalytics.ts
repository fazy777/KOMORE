import {
  RoutineLogEntry,
  RoutineAnalyticsSummary,
  TimeOfDayBlock,
  PeakBlockStat,
  BottleneckCategory,
  BottleneckPatternStat,
} from '../types/routine';
import { UserProfile } from '../types/profile';

const TIME_BLOCK_LABELS: Record<TimeOfDayBlock, string> = {
  early_morning: 'Early Morning (05:00 - 08:00)',
  morning: 'Morning (08:00 - 12:00)',
  afternoon: 'Afternoon (12:00 - 17:00)',
  evening: 'Evening (17:00 - 21:00)',
  late_night: 'Late Night (21:00 - 05:00)',
};

const BOTTLENECK_LABELS: Record<BottleneckCategory, string> = {
  phone_distraction: 'Phone & Social Media Distraction',
  commute_exhaustion: 'Commute Fatigue / Transit Delays',
  noisy_environment: 'Noisy Study Environment',
  fatigue_or_sleepy: 'Exhaustion & Low Energy',
  procrastination: 'Task Avoidance & Procrastination',
  unexpected_interruption: 'Unexpected Interruptions',
  hunger_or_meal_clash: 'Meal Time or Hunger Clashes',
  none: 'Smooth / No Bottlenecks',
  other: 'Other Custom Impediments',
};

export class RoutineAnalyticsService {
  /**
   * Computes comprehensive focus analytics, energetic peak blocks,
   * bottleneck distribution, and personalized archetype suggestions.
   */
  static computeSummary(
    entries: RoutineLogEntry[],
    profile?: UserProfile | null
  ): RoutineAnalyticsSummary {
    if (!entries || entries.length === 0) {
      return {
        totalSessions: 0,
        totalFocusMinutes: 0,
        averageRetentionSpan: 0,
        averageFocusRating: 0,
        peakEnergeticBlocks: [],
        recurringBottleneckPatterns: [],
        smartSuggestions: [
          'Log your first study session to reveal your personal peak energetic blocks and focus patterns.',
        ],
      };
    }

    const totalSessions = entries.length;
    let totalFocusMinutes = 0;
    let sumRetentionSpan = 0;
    let sumFocusRating = 0;

    // Grouping by time blocks
    const blockMap: Record<
      TimeOfDayBlock,
      { totalRating: number; totalRetention: number; count: number }
    > = {
      early_morning: { totalRating: 0, totalRetention: 0, count: 0 },
      morning: { totalRating: 0, totalRetention: 0, count: 0 },
      afternoon: { totalRating: 0, totalRetention: 0, count: 0 },
      evening: { totalRating: 0, totalRetention: 0, count: 0 },
      late_night: { totalRating: 0, totalRetention: 0, count: 0 },
    };

    // Grouping bottlenecks
    const bottleneckMap: Partial<Record<BottleneckCategory, number>> = {};

    for (const entry of entries) {
      totalFocusMinutes += entry.durationMinutes || 0;
      sumRetentionSpan += entry.retentionSpanMinutes || 0;
      sumFocusRating += entry.focusRating || 0;

      const blockStat = blockMap[entry.timeOfDayBlock];
      if (blockStat) {
        blockStat.totalRating += entry.focusRating || 0;
        blockStat.totalRetention += entry.retentionSpanMinutes || 0;
        blockStat.count += 1;
      }

      const cat = entry.bottleneckCategory || 'none';
      bottleneckMap[cat] = (bottleneckMap[cat] || 0) + 1;
    }

    const averageRetentionSpan = Math.round((sumRetentionSpan / totalSessions) * 10) / 10;
    const averageFocusRating = Math.round((sumFocusRating / totalSessions) * 10) / 10;

    // Build peak energetic blocks
    const peakEnergeticBlocks: PeakBlockStat[] = (
      Object.keys(blockMap) as TimeOfDayBlock[]
    )
      .filter((block) => blockMap[block].count > 0)
      .map((block) => {
        const item = blockMap[block];
        return {
          block,
          label: TIME_BLOCK_LABELS[block],
          averageFocusRating: Math.round((item.totalRating / item.count) * 10) / 10,
          averageRetentionSpan: Math.round((item.totalRetention / item.count) * 10) / 10,
          sessionCount: item.count,
        };
      })
      .sort((a, b) => {
        // Sort primarily by averageFocusRating, then by averageRetentionSpan
        if (b.averageFocusRating !== a.averageFocusRating) {
          return b.averageFocusRating - a.averageFocusRating;
        }
        return b.averageRetentionSpan - a.averageRetentionSpan;
      });

    // Build bottleneck pattern distribution
    const recurringBottleneckPatterns: BottleneckPatternStat[] = (
      Object.keys(bottleneckMap) as BottleneckCategory[]
    )
      .map((cat) => {
        const count = bottleneckMap[cat] || 0;
        const percentage = Math.round((count / totalSessions) * 100);
        return {
          category: cat,
          label: BOTTLENECK_LABELS[cat] || cat,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Generate personalized smart suggestions
    const smartSuggestions = this.generateSmartSuggestions(
      peakEnergeticBlocks,
      recurringBottleneckPatterns,
      averageRetentionSpan,
      profile
    );

    return {
      totalSessions,
      totalFocusMinutes,
      averageRetentionSpan,
      averageFocusRating,
      peakEnergeticBlocks,
      recurringBottleneckPatterns,
      smartSuggestions,
    };
  }

  private static generateSmartSuggestions(
    peakBlocks: PeakBlockStat[],
    bottlenecks: BottleneckPatternStat[],
    avgRetention: number,
    profile?: UserProfile | null
  ): string[] {
    const suggestions: string[] = [];

    // Peak block insight
    if (peakBlocks.length > 0) {
      const best = peakBlocks[0];
      suggestions.push(
        `High Energy Zone: Your peak focus occurs during ${best.label} with an average rating of ${best.averageFocusRating}/5.`
      );
    }

    // Retention span recommendation
    if (avgRetention > 0) {
      const pomodoroSuggestion = Math.max(20, Math.min(50, Math.floor(avgRetention)));
      suggestions.push(
        `Optimal Session Length: Your true focus retention averages ${avgRetention} mins. We recommend capping focus intervals at ${pomodoroSuggestion} minutes before taking a break.`
      );
    }

    // Top bottleneck warning
    const topIssue = bottlenecks.find((b) => b.category !== 'none');
    if (topIssue && topIssue.percentage >= 25) {
      suggestions.push(
        `Critical Bottleneck: "${topIssue.label}" affected ${topIssue.percentage}% of your logged sessions. Consider engaging strict lockdown rules.`
      );
    }

    // Archetype specific insights
    if (profile) {
      if (profile.archetype === 'day_scholar') {
        const commute = profile.dayScholarDetails?.commuteMinutesOneWay || 0;
        if (commute > 40) {
          suggestions.push(
            `Day Scholar Advisory: Long commute (~${commute} mins each way). Guard the 60-minute window post-commute against cognitive exhaustion.`
          );
        }
      } else if (profile.archetype === 'hostel') {
        suggestions.push(
          'Hostel Student Advisory: Coordinate study bursts around mess meal windows to prevent abrupt focus breaks.'
        );
      }
    }

    return suggestions;
  }
}
