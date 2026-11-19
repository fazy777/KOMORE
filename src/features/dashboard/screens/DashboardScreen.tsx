import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { UserProfile } from '../../../types/profile';
import { RoutineLogEntry } from '../../../types/routine';
import { ProfileRepository } from '../../../services/profileRepository';
import { RoutineRepository } from '../../../services/routineRepository';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentLogs, setRecentLogs] = useState<RoutineLogEntry[]>([]);

  const loadData = useCallback(async () => {
    const p = await ProfileRepository.getProfile();
    const l = await RoutineRepository.getLogs();
    setProfile(p);
    setRecentLogs(l.slice(0, 3));
  }, []);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation, loadData]);

  const handleSeedSampleData = async () => {
    const sampleEntries: Omit<RoutineLogEntry, 'id' | 'createdAt'>[] = [
      {
        studentId: profile?.id || 'std_demo',
        title: 'Compiler Design - Parsing & ASTs',
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        timeOfDayBlock: 'morning',
        durationMinutes: 50,
        retentionSpanMinutes: 45,
        focusRating: 5,
        bottleneckCategory: 'none',
        completedSuccessfully: true,
      },
      {
        studentId: profile?.id || 'std_demo',
        title: 'Operating Systems - Concurrency Primitives',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        timeOfDayBlock: 'afternoon',
        durationMinutes: 45,
        retentionSpanMinutes: 25,
        focusRating: 2,
        bottleneckCategory: 'commute_exhaustion',
        bottleneckNotes: 'Stuck in bus for 1 hour before session, low alertness',
        completedSuccessfully: false,
      },
      {
        studentId: profile?.id || 'std_demo',
        title: 'Database Management Systems - Normalization',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        timeOfDayBlock: 'early_morning',
        durationMinutes: 60,
        retentionSpanMinutes: 55,
        focusRating: 5,
        bottleneckCategory: 'none',
        completedSuccessfully: true,
      },
      {
        studentId: profile?.id || 'std_demo',
        title: 'Software Engineering - Sprint Planning',
        date: new Date(Date.now() - 3600000 * 72).toISOString(),
        timeOfDayBlock: 'evening',
        durationMinutes: 40,
        retentionSpanMinutes: 20,
        focusRating: 3,
        bottleneckCategory: 'phone_distraction',
        bottleneckNotes: 'Group chat notifications interrupted twice',
        completedSuccessfully: true,
      },
    ];

    for (const entry of sampleEntries) {
      await RoutineRepository.addLog(entry);
    }
    await loadData();
    Alert.alert('Demo Data Added', '4 realistic study sessions have been added to your Activity Log.');
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile & Onboarding',
      'This will clear your local student profile and return to the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await ProfileRepository.clearProfile();
            navigation.replace('Onboarding');
          },
        },
      ]
    );
  };

  const isDayScholar = profile?.archetype === 'day_scholar';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Student Archetype Banner */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.studentName}>{profile?.name || 'Student'}</Text>
            <Text style={styles.studentEmail}>{profile?.email || 'student@komore.app'}</Text>
            {profile?.university ? (
              <Text style={styles.studentUni}>{profile.university}</Text>
            ) : null}
          </View>
          <Badge
            label={isDayScholar ? 'Day Scholar' : 'Hostel Resident'}
            tone={isDayScholar ? 'info' : 'purple'}
          />
        </View>

        <View style={styles.profileDivider} />

        {/* Environmental & Commute Summary */}
        <View style={styles.rulesGrid}>
          {isDayScholar ? (
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>Daily Commute</Text>
              <Text style={styles.ruleValue}>
                ~{profile?.dayScholarDetails?.commuteMinutesOneWay || 30}m one-way
              </Text>
            </View>
          ) : (
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>Hostel Curfew</Text>
              <Text style={styles.ruleValue}>
                {profile?.hostelDetails?.curfewTime || '21:30'}
              </Text>
            </View>
          )}

          <View style={styles.ruleItem}>
            <Text style={styles.ruleLabel}>Wake / Sleep</Text>
            <Text style={styles.ruleValue}>
              {profile?.lifestyleBoundaries.wakeTime || '07:00'} -{' '}
              {profile?.lifestyleBoundaries.sleepTime || '23:00'}
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleLabel}>Focus Span Cap</Text>
            <Text style={styles.ruleValue}>
              {profile?.lifestyleBoundaries.maxContinuousStudyMinutes || 45}m max
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.actionsGrid}>
        <Button
          testID="btn-nav-log-routine"
          title="+ Log Study Session"
          variant="primary"
          onPress={() => navigation.navigate('RoutineLog')}
          style={styles.actionBtn}
        />
        <Button
          testID="btn-nav-analytics"
          title="Focus Analytics & Insights"
          variant="secondary"
          onPress={() => navigation.navigate('RoutineAnalytics')}
          style={styles.actionBtn}
        />
      </View>

      {/* Recent Activity Log Preview */}
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Recent Focus Executions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoutineAnalytics')}>
            <Text style={styles.linkText}>View Full History</Text>
          </TouchableOpacity>
        </View>

        {recentLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No routines logged yet.</Text>
            <Text style={styles.emptySubtext}>
              Track your focus sessions to discover peak performance hours.
            </Text>
            <Button
              title="Populate Demo Data"
              variant="outline"
              onPress={handleSeedSampleData}
              style={styles.demoButton}
            />
          </View>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logLeft}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logSubtitle}>
                  {log.durationMinutes}m duration • {log.retentionSpanMinutes}m deep focus •{' '}
                  {log.timeOfDayBlock}
                </Text>
              </View>
              <Badge
                label={`${log.focusRating} ★`}
                tone={log.focusRating >= 4 ? 'success' : 'warning'}
              />
            </View>
          ))
        )}
      </Card>

      {/* Settings / Reset */}
      <View style={styles.footerContainer}>
        <Button
          title="Reset Onboarding / Profile"
          variant="outline"
          onPress={handleResetProfile}
          style={styles.resetButton}
        />
      </View>
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
  profileCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  studentEmail: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  studentUni: {
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  rulesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ruleItem: {
    flex: 1,
  },
  ruleLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  ruleValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsGrid: {
    gap: 10,
    marginVertical: 12,
  },
  actionBtn: {
    width: '100%',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 14,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  demoButton: {
    marginTop: 14,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logLeft: {
    flex: 1,
    marginRight: 8,
  },
  logTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  logSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resetButton: {
    borderColor: '#475569',
  },
});
