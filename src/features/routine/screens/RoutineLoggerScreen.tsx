import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import {
  TimeOfDayBlock,
  FocusRating,
  BottleneckCategory,
} from '../../../types/routine';
import { RoutineRepository } from '../../../services/routineRepository';
import { ProfileRepository } from '../../../services/profileRepository';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { InputField } from '../../../components/InputField';
import { ChoiceSelector, ChoiceOption } from '../../../components/ChoiceSelector';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineLog'>;

export const RoutineLoggerScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('45');
  const [retentionSpan, setRetentionSpan] = useState('35');
  const [timeBlock, setTimeBlock] = useState<TimeOfDayBlock>('morning');
  const [focusRating, setFocusRating] = useState<FocusRating>(4);
  const [bottleneckCategory, setBottleneckCategory] = useState<BottleneckCategory>('none');
  const [bottleneckNotes, setBottleneckNotes] = useState('');
  const [completedSuccessfully, setCompletedSuccessfully] = useState(true);
  const [saving, setSaving] = useState(false);

  const timeBlockOptions: ChoiceOption<TimeOfDayBlock>[] = [
    { value: 'early_morning', label: 'Early (05-08)', sublabel: 'Dawn focus' },
    { value: 'morning', label: 'Morning (08-12)', sublabel: 'Prime AM' },
    { value: 'afternoon', label: 'Afternoon (12-17)', sublabel: 'Post-lunch' },
    { value: 'evening', label: 'Evening (17-21)', sublabel: 'Dusk review' },
    { value: 'late_night', label: 'Late Night (21-05)', sublabel: 'Night shift' },
  ];

  const bottleneckOptions: ChoiceOption<BottleneckCategory>[] = [
    { value: 'none', label: 'No Delays', sublabel: 'Flow state reached' },
    { value: 'phone_distraction', label: 'Phone / Social', sublabel: 'Notifications loop' },
    { value: 'commute_exhaustion', label: 'Commute Fatigue', sublabel: 'Transit lag' },
    { value: 'noisy_environment', label: 'Noisy Surroundings', sublabel: 'Dorm / house sounds' },
    { value: 'fatigue_or_sleepy', label: 'Exhaustion', sublabel: 'Low stamina' },
    { value: 'procrastination', label: 'Procrastination', sublabel: 'Delayed start' },
    { value: 'hunger_or_meal_clash', label: 'Meal Clash', sublabel: 'Mess timing' },
    { value: 'unexpected_interruption', label: 'Interruption', sublabel: 'External call/visitor' },
    { value: 'other', label: 'Other', sublabel: 'Custom' },
  ];

  const handleSaveEntry = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task or subject title.');
      return;
    }

    const dur = parseInt(duration, 10);
    const ret = parseInt(retentionSpan, 10);

    if (isNaN(dur) || dur <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid study duration in minutes.');
      return;
    }

    if (isNaN(ret) || ret <= 0 || ret > dur) {
      Alert.alert(
        'Invalid Retention Span',
        'Retention span must be a positive number up to the total session duration.'
      );
      return;
    }

    setSaving(true);
    try {
      const profile = await ProfileRepository.getProfile();
      await RoutineRepository.addLog({
        studentId: profile?.id || 'guest_student',
        title: title.trim(),
        date: new Date().toISOString(),
        timeOfDayBlock: timeBlock,
        durationMinutes: dur,
        retentionSpanMinutes: ret,
        focusRating,
        bottleneckCategory,
        bottleneckNotes: bottleneckNotes.trim() || undefined,
        completedSuccessfully,
      });

      Alert.alert(
        'Session Logged',
        'Routine execution saved! Your analytics dashboard has been updated.',
        [
          {
            text: 'View Insights',
            onPress: () => navigation.navigate('RoutineAnalytics'),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save routine log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card>
        <Text style={styles.cardHeader}>Study Session Details</Text>
        <InputField
          testID="input-log-title"
          label="Subject / Task Title *"
          placeholder="e.g. Data Structures & Algorithms - Trees"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.row}>
          <View style={styles.flexHalf}>
            <InputField
              testID="input-log-duration"
              label="Session Duration (min) *"
              keyboardType="numeric"
              placeholder="45"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <View style={styles.flexHalf}>
            <InputField
              testID="input-log-retention"
              label="Focus Retention (min) *"
              keyboardType="numeric"
              placeholder="35"
              value={retentionSpan}
              onChangeText={setRetentionSpan}
              helperText="Continuous focus without distraction"
            />
          </View>
        </View>

        <ChoiceSelector
          label="Time-of-Day Block"
          options={timeBlockOptions}
          selected={timeBlock}
          onSelect={setTimeBlock}
        />
      </Card>

      <Card>
        <Text style={styles.cardHeader}>Focus Rating & Quality</Text>
        <Text style={styles.sublabel}>How deeply absorbed were you in this session?</Text>
        <View style={styles.ratingRow}>
          {([1, 2, 3, 4, 5] as FocusRating[]).map((rating) => {
            const isSelected = focusRating === rating;
            return (
              <TouchableOpacity
                key={rating}
                testID={`rating-${rating}`}
                onPress={() => setFocusRating(rating)}
                style={[styles.ratingPill, isSelected && styles.ratingPillActive]}
              >
                <Text style={[styles.ratingPillText, isSelected && styles.ratingPillTextActive]}>
                  {rating} ★
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardHeader}>Bottlenecks & Obstacles</Text>
        <Text style={styles.sublabel}>
          Identifying recurring friction points teaches Komore when not to schedule high-stakes work.
        </Text>
        <ChoiceSelector
          testIDPrefix="bottleneck"
          options={bottleneckOptions}
          selected={bottleneckCategory}
          onSelect={setBottleneckCategory}
        />
        <InputField
          testID="input-log-notes"
          label="Bottleneck Notes & Observations"
          placeholder="e.g. Heavy traffic on bridge caused 25min delay; noisy hallway"
          value={bottleneckNotes}
          onChangeText={setBottleneckNotes}
          multiline
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Goal Completed Successfully</Text>
          <Switch
            testID="switch-completed"
            value={completedSuccessfully}
            onValueChange={setCompletedSuccessfully}
            trackColor={{ false: '#334155', true: '#0284C7' }}
            thumbColor={completedSuccessfully ? '#38BDF8' : '#94A3B8'}
          />
        </View>
      </Card>

      <View style={styles.actionContainer}>
        <Button
          testID="btn-save-log"
          title="Save Session to Activity Log"
          onPress={handleSaveEntry}
          loading={saving}
          variant="primary"
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
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  ratingPill: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingPillActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  ratingPillText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
  ratingPillTextActive: {
    color: '#38BDF8',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  switchLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 12,
  },
});
