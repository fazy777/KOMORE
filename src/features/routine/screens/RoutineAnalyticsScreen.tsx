import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { RoutineLogEntry, RoutineAnalyticsSummary } from '../../../types/routine';
import { UserProfile } from '../../../types/profile';
import { RoutineRepository } from '../../../services/routineRepository';
import { ProfileRepository } from '../../../services/profileRepository';
import { RoutineAnalyticsService } from '../../../services/routineAnalytics';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineAnalytics'>;

export const RoutineAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<RoutineLogEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<RoutineAnalyticsSummary | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedLogs, fetchedProfile] = await Promise.all([
        RoutineRepository.getLogs(),
        ProfileRepository.getProfile(),
      ]);
      setLogs(fetchedLogs);
      setProfile(fetchedProfile);
      const computed = RoutineAnalyticsService.computeSummary(fetchedLogs, fetchedProfile);
      setSummary(computed);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleDeleteLog = (id: string, title: string) => {
    Alert.alert('Delete Session', `Remove "${title}" from your activity log?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await RoutineRepository.deleteLog(id);
          loadData();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Synthesizing Routine Insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Overview Stats Cards */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Sessions</Text>
          <Text style={styles.metricValue}>{summary?.totalSessions || 0}</Text>
          <Text style={styles.metricSub}>{summary?.totalFocusMinutes || 0} total mins</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Focus Span</Text>
          <Text style={styles.metricValue}>{summary?.averageRetentionSpan || 0}m</Text>
          <Text style={styles.metricSub}>Continuous retention</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>Focus Quality</Text>
          <Text style={styles.metricValue}>{summary?.averageFocusRating || 0} ★</Text>
          <Text style={styles.metricSub}>Out of 5.0</Text>
        </Card>
      </View>

      {/* Smart Suggestions & Insights */}
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Smart Timetable Suggestions</Text>
          <Badge label="Adaptive AI" tone="info" />
        </View>
        {summary && summary.smartSuggestions.length > 0 ? (
          summary.smartSuggestions.map((suggestion, idx) => (
            <View key={idx} style={styles.suggestionItem}>
              <Text style={styles.suggestionBullet}>✦</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No suggestions available yet.</Text>
        )}
      </Card>

      {/* Peak Energetic Blocks */}
      <Card>
        <Text style={styles.sectionTitle}>Peak Energetic & Focus Blocks</Text>
        <Text style={styles.sectionSubtitle}>
          Ranked by highest focus retention and self-reported performance.
        </Text>
        {summary && summary.peakEnergeticBlocks.length > 0 ? (
          summary.peakEnergeticBlocks.map((block, index) => (
            <View key={block.block} style={styles.blockRow}>
              <View style={styles.blockRankBadge}>
                <Text style={styles.blockRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.blockInfo}>
                <Text style={styles.blockName}>{block.label}</Text>
                <Text style={styles.blockStats}>
                  {block.sessionCount} session{block.sessionCount > 1 ? 's' : ''} • Avg{' '}
                  {block.averageRetentionSpan}m retention
                </Text>
              </View>
              <View style={styles.blockRating}>
                <Text style={styles.blockRatingText}>{block.averageFocusRating} ★</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No sessions logged yet.</Text>
        )}
      </Card>

      {/* Recurring Bottlenecks */}
      <Card>
        <Text style={styles.sectionTitle}>Recurring Bottleneck Patterns</Text>
        <Text style={styles.sectionSubtitle}>
          Impediments tracked across your execution history.
        </Text>
        {summary && summary.recurringBottleneckPatterns.length > 0 ? (
          summary.recurringBottleneckPatterns.map((b) => (
            <View key={b.category} style={styles.bottleneckRow}>
              <View style={styles.bottleneckInfo}>
                <Text style={styles.bottleneckName}>{b.label}</Text>
                <Text style={styles.bottleneckCount}>
                  {b.count} instance{b.count > 1 ? 's' : ''} ({b.percentage}%)
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, Math.max(8, b.percentage))}%`,
                      backgroundColor: b.category === 'none' ? '#22C55E' : '#EF4444',
                    },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No bottleneck patterns logged yet.</Text>
        )}
      </Card>

      {/* Historical Sessions Log */}
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Execution History ({logs.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoutineLog')}>
            <Text style={styles.linkText}>+ Log New</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No study sessions recorded yet.</Text>
            <Button
              title="Log Your First Session"
              onPress={() => navigation.navigate('RoutineLog')}
              variant="outline"
              style={styles.logFirstButton}
            />
          </View>
        ) : (
          logs.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyMain}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{entry.title}</Text>
                  <Text style={styles.historyRating}>{entry.focusRating} ★</Text>
                </View>
                <Text style={styles.historyMeta}>
                  {entry.durationMinutes}m planned • {entry.retentionSpanMinutes}m deep focus •{' '}
                  {entry.timeOfDayBlock}
                </Text>
                {entry.bottleneckCategory !== 'none' && (
                  <View style={styles.historyBottleneck}>
                    <Badge label={entry.bottleneckCategory.replace(/_/g, ' ')} tone="warning" />
                    {entry.bottleneckNotes ? (
                      <Text style={styles.historyNotes} numberOfLines={2}>
                        {entry.bottleneckNotes}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteLog(entry.id, entry.title)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricValue: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  suggestionBullet: {
    color: '#38BDF8',
    marginRight: 8,
    fontSize: 14,
  },
  suggestionText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  blockRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  blockRankText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  blockInfo: {
    flex: 1,
  },
  blockName: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  blockStats: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  blockRating: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  blockRatingText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  bottleneckRow: {
    marginVertical: 6,
  },
  bottleneckInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bottleneckName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
  },
  bottleneckCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logFirstButton: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  historyMain: {
    flex: 1,
    marginRight: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  historyRating: {
    color: '#FBBF24',
    fontWeight: '700',
    fontSize: 13,
  },
  historyMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  historyBottleneck: {
    marginTop: 4,
    gap: 4,
  },
  historyNotes: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#64748B',
    fontSize: 16,
  },
});
