import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import {
  StudentArchetype,
  TransportMode,
  NoiseSensitivity,
  PrimaryStudySpace,
  FocusPreference,
  UserProfile,
} from '../../../types/profile';
import { ProfileRepository } from '../../../services/profileRepository';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { InputField } from '../../../components/InputField';
import { ChoiceSelector, ChoiceOption } from '../../../components/ChoiceSelector';
import { Badge } from '../../../components/Badge';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Identity & Archetype
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [archetype, setArchetype] = useState<StudentArchetype>('day_scholar');
  const [archetypeCustomNotes, setArchetypeCustomNotes] = useState('');

  // Step 2: Commute & Environmental Rules
  const [commuteMinutes, setCommuteMinutes] = useState('45');
  const [morningWindow, setMorningWindow] = useState('07:30 - 08:30');
  const [eveningWindow, setEveningWindow] = useState('16:30 - 17:30');
  const [transportMode, setTransportMode] = useState<TransportMode>('public_bus');
  const [canStudyInCommute, setCanStudyInCommute] = useState(false);

  // Hostel specific fields
  const [curfewTime, setCurfewTime] = useState('21:30');
  const [breakfastTime, setBreakfastTime] = useState('07:30 - 08:45');
  const [dinnerTime, setDinnerTime] = useState('19:45 - 21:00');
  const [roomSharingCount, setRoomSharingCount] = useState('2');

  // Environmental rules
  const [noiseSensitivity, setNoiseSensitivity] = useState<NoiseSensitivity>('moderate');
  const [preferredStudySpace, setPreferredStudySpace] = useState<PrimaryStudySpace>('bedroom');

  // Step 3: Lifestyle Boundaries
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [maxStudyMinutes, setMaxStudyMinutes] = useState('45');
  const [minBreakMinutes, setMinBreakMinutes] = useState('10');
  const [focusPreference, setFocusPreference] = useState<FocusPreference>('morning');
  const [strictLockdown, setStrictLockdown] = useState(true);

  // Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your student name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid university/student email.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      const profile: UserProfile = {
        id: `student_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        university: university.trim() || undefined,
        archetype,
        archetypeCustomNotes: archetypeCustomNotes.trim() || undefined,
        dayScholarDetails:
          archetype === 'day_scholar'
            ? {
                commuteMinutesOneWay: parseInt(commuteMinutes, 10) || 30,
                morningCommuteWindow: morningWindow,
                eveningCommuteWindow: eveningWindow,
                transportMode,
                canStudyDuringCommute: canStudyInCommute,
              }
            : undefined,
        hostelDetails:
          archetype === 'hostel'
            ? {
                curfewTime,
                diningMessHours: {
                  breakfast: breakfastTime,
                  lunch: '12:30 - 14:00',
                  dinner: dinnerTime,
                },
                dormEnvironment: 'moderate',
                roomSharingCount: parseInt(roomSharingCount, 10) || 2,
              }
            : undefined,
        environmentalRules: {
          noiseSensitivity,
          preferredStudySpace,
          allowCommuteStudy: canStudyInCommute,
          distractingAppsWhitelist: ['WhatsApp (Academic Groups)'],
        },
        lifestyleBoundaries: {
          wakeTime,
          sleepTime,
          maxContinuousStudyMinutes: parseInt(maxStudyMinutes, 10) || 45,
          minimumBreakMinutes: parseInt(minBreakMinutes, 10) || 10,
          preferredStudyTime: focusPreference,
          strictLockdownEnabled: strictLockdown,
        },
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ProfileRepository.saveProfile(profile);
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('Error', 'Failed to save student profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const archetypeOptions: ChoiceOption<StudentArchetype>[] = [
    {
      value: 'day_scholar',
      label: 'Day Scholar',
      sublabel: 'Commutes from home, transit intervals',
    },
    {
      value: 'hostel',
      label: 'Hostel Resident',
      sublabel: 'On-campus dorm, mess hours & curfew',
    },
    {
      value: 'other',
      label: 'Custom Lifestyle',
      sublabel: 'Hybrid / distance learner',
    },
  ];

  const transportOptions: ChoiceOption<TransportMode>[] = [
    { value: 'public_bus', label: 'Public Bus' },
    { value: 'metro_train', label: 'Metro / Train' },
    { value: 'college_bus', label: 'College Bus' },
    { value: 'personal_vehicle', label: 'Bike / Car' },
    { value: 'walking_bicycle', label: 'Walking / Cycle' },
  ];

  const noiseOptions: ChoiceOption<NoiseSensitivity>[] = [
    { value: 'low', label: 'Low', sublabel: 'Needs total silence' },
    { value: 'moderate', label: 'Moderate', sublabel: 'Tolerates ambient buzz' },
    { value: 'high', label: 'High', sublabel: 'Focuses through anything' },
  ];

  const studySpaceOptions: ChoiceOption<PrimaryStudySpace>[] = [
    { value: 'bedroom', label: 'Quiet Room' },
    { value: 'campus_library', label: 'Library' },
    { value: 'hostel_study_room', label: 'Study Hall' },
    { value: 'cafe', label: 'Cafe' },
  ];

  const focusPreferenceOptions: ChoiceOption<FocusPreference>[] = [
    { value: 'early_morning', label: '05:00 - 08:00', sublabel: 'Dawn focus' },
    { value: 'morning', label: '08:00 - 12:00', sublabel: 'Standard morning' },
    { value: 'afternoon', label: '12:00 - 17:00', sublabel: 'Midday' },
    { value: 'evening', label: '17:00 - 21:00', sublabel: 'Twilight' },
    { value: 'late_night', label: '21:00 - 02:00', sublabel: 'Night owl' },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>KOMORE</Text>
          <Text style={styles.stepTitle}>
            Step {currentStep} of 3:{' '}
            {currentStep === 1
              ? 'Student Archetype'
              : currentStep === 2
              ? 'Commute & Environment'
              : 'Lifestyle & Focus Boundaries'}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' },
              ]}
            />
          </View>
        </View>

        {currentStep === 1 && (
          <View>
            <Card>
              <Text style={styles.sectionHeader}>Baseline Identity</Text>
              <InputField
                testID="input-name"
                label="Full Name *"
                placeholder="e.g. Faizan Ali"
                value={name}
                onChangeText={setName}
              />
              <InputField
                testID="input-email"
                label="Student Email *"
                placeholder="student@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <InputField
                testID="input-university"
                label="University / College (Optional)"
                placeholder="e.g. NUST / FAST / UET"
                value={university}
                onChangeText={setUniversity}
              />
            </Card>

            <Card>
              <Text style={styles.sectionHeader}>Select Student Archetype</Text>
              <Text style={styles.sectionHint}>
                Komore adapts schedule constraints based on whether you commute daily or live in a
                dorm.
              </Text>
              <ChoiceSelector
                testIDPrefix="archetype"
                options={archetypeOptions}
                selected={archetype}
                onSelect={setArchetype}
              />
              <InputField
                testID="input-archetype-notes"
                label="Special Routine Notes (Optional)"
                placeholder="e.g. Lab days on Wed, thesis research semesters"
                value={archetypeCustomNotes}
                onChangeText={setArchetypeCustomNotes}
                multiline
              />
            </Card>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            {archetype === 'day_scholar' ? (
              <Card>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionHeader}>Commute Intervals</Text>
                  <Badge label="Day Scholar" tone="info" />
                </View>
                <Text style={styles.sectionHint}>
                  Komore guards these hours so timetable logic doesn't assign deep focus during
                  transit.
                </Text>
                <InputField
                  testID="input-commute-minutes"
                  label="One-Way Commute Duration (Minutes)"
                  placeholder="e.g. 45"
                  keyboardType="numeric"
                  value={commuteMinutes}
                  onChangeText={setCommuteMinutes}
                />
                <InputField
                  testID="input-morning-window"
                  label="Morning Commute Window"
                  placeholder="07:30 - 08:30"
                  value={morningWindow}
                  onChangeText={setMorningWindow}
                />
                <InputField
                  testID="input-evening-window"
                  label="Evening Commute Window"
                  placeholder="16:30 - 17:30"
                  value={eveningWindow}
                  onChangeText={setEveningWindow}
                />
                <ChoiceSelector
                  label="Primary Commute Mode"
                  options={transportOptions}
                  selected={transportMode}
                  onSelect={setTransportMode}
                />
                <View style={styles.switchRow}>
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchLabel}>Can Read/Review During Commute?</Text>
                    <Text style={styles.switchSubtext}>
                      Enables low-intensity flashcards or audio recap tasks while in transit.
                    </Text>
                  </View>
                  <Switch
                    testID="switch-study-commute"
                    value={canStudyInCommute}
                    onValueChange={setCanStudyInCommute}
                    trackColor={{ false: '#334155', true: '#0284C7' }}
                    thumbColor={canStudyInCommute ? '#38BDF8' : '#94A3B8'}
                  />
                </View>
              </Card>
            ) : (
              <Card>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionHeader}>Hostel & Dorm Boundaries</Text>
                  <Badge label="Hostel Resident" tone="purple" />
                </View>
                <InputField
                  testID="input-curfew"
                  label="Hostel In-Time / Curfew"
                  placeholder="21:30"
                  value={curfewTime}
                  onChangeText={setCurfewTime}
                />
                <InputField
                  testID="input-breakfast"
                  label="Breakfast Mess Window"
                  placeholder="07:30 - 08:45"
                  value={breakfastTime}
                  onChangeText={setBreakfastTime}
                />
                <InputField
                  testID="input-dinner"
                  label="Dinner Mess Window"
                  placeholder="19:45 - 21:00"
                  value={dinnerTime}
                  onChangeText={setDinnerTime}
                />
                <InputField
                  testID="input-room-sharing"
                  label="Number of Roommates"
                  placeholder="2"
                  keyboardType="numeric"
                  value={roomSharingCount}
                  onChangeText={setRoomSharingCount}
                />
              </Card>
            )}

            <Card>
              <Text style={styles.sectionHeader}>Environmental Rules</Text>
              <ChoiceSelector
                label="Noise Sensitivity"
                options={noiseOptions}
                selected={noiseSensitivity}
                onSelect={setNoiseSensitivity}
              />
              <ChoiceSelector
                label="Primary Study Space"
                options={studySpaceOptions}
                selected={preferredStudySpace}
                onSelect={setPreferredStudySpace}
              />
            </Card>
          </View>
        )}

        {currentStep === 3 && (
          <View>
            <Card>
              <Text style={styles.sectionHeader}>Sleep & Wake Preferences</Text>
              <InputField
                testID="input-wake-time"
                label="Typical Wake Time"
                placeholder="07:00"
                value={wakeTime}
                onChangeText={setWakeTime}
              />
              <InputField
                testID="input-sleep-time"
                label="Target Bed Time"
                placeholder="23:00"
                value={sleepTime}
                onChangeText={setSleepTime}
              />
            </Card>

            <Card>
              <Text style={styles.sectionHeader}>Study Constraints & Focus Span</Text>
              <InputField
                testID="input-max-study"
                label="Max Continuous Focus Span (Minutes)"
                placeholder="45"
                keyboardType="numeric"
                value={maxStudyMinutes}
                onChangeText={setMaxStudyMinutes}
                helperText="Prevents cognitive fatigue by enforcing break boundaries."
              />
              <InputField
                testID="input-min-break"
                label="Minimum Rest Break Between Tasks (Minutes)"
                placeholder="10"
                keyboardType="numeric"
                value={minBreakMinutes}
                onChangeText={setMinBreakMinutes}
              />
              <ChoiceSelector
                label="Self-Reported Peak Focus Window"
                options={focusPreferenceOptions}
                selected={focusPreference}
                onSelect={setFocusPreference}
              />
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Strict Anti-Distraction Lockdown</Text>
                  <Text style={styles.switchSubtext}>
                    Blocks distracting apps during active scheduled study sessions.
                  </Text>
                </View>
                <Switch
                  testID="switch-strict-lockdown"
                  value={strictLockdown}
                  onValueChange={setStrictLockdown}
                  trackColor={{ false: '#334155', true: '#0284C7' }}
                  thumbColor={strictLockdown ? '#38BDF8' : '#94A3B8'}
                />
              </View>
            </Card>
          </View>
        )}

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <Button
              testID="btn-back"
              title="Back"
              variant="secondary"
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <Button
            testID={currentStep === 3 ? 'btn-finish' : 'btn-next'}
            title={currentStep === 3 ? 'Finish & Save Profile' : 'Next Step'}
            variant="primary"
            loading={saving}
            onPress={currentStep === 3 ? handleFinishOnboarding : handleNext}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 2,
  },
  stepTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  switchLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtext: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
