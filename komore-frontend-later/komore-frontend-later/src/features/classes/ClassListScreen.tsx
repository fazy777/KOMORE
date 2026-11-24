import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Chip } from '../../components/FormControls';
import { colors } from '../../components/theme';
import { ClassItem } from '../../types/schedule';
import { SchedulingStackParamList } from '../scheduling/navigationTypes';
import { listClasses } from './classService';

type Props = NativeStackScreenProps<SchedulingStackParamList, 'ClassList'>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClassListScreen({ navigation }: Props): React.JSX.Element {
  const [day, setDay] = useState(1);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      listClasses().then(setClasses);
    }, []),
  );

  const weekly = classes.filter(c => !c.specificDate && c.dayOfWeek === day);
  const oneOff = classes.filter(c => c.specificDate);

  const card = (c: ClassItem) => (
    <Pressable
      key={c.id}
      style={styles.card}
      onPress={() => navigation.navigate('ClassForm', { classId: c.id })}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>{c.title}</Text>
        <Text style={styles.lock}>🔒</Text>
      </View>
      <Text style={styles.meta}>
        {c.specificDate ? `${c.specificDate} · ` : ''}
        {c.startTime} - {c.endTime}
        {c.location ? ` · ${c.location}` : ''}
      </Text>
      <Text style={styles.meta}>
        {c.kind === 'lab' ? 'Lab' : 'Class'} ·{' '}
        {c.source === 'google_calendar' ? 'Google Calendar' : 'Manual'}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.chips}>
        {DAYS.map((d, i) => (
          <Chip key={d} label={d} on={day === i + 1} onPress={() => setDay(i + 1)} />
        ))}
      </View>

      {weekly.length === 0 ? (
        <Text style={styles.empty}>No classes on this day.</Text>
      ) : (
        weekly.map(card)
      )}

      {oneOff.length > 0 && (
        <>
          <Text style={styles.section}>One-off and synced events</Text>
          {oneOff.map(card)}
        </>
      )}

      <Button title="+ Add class" variant="primary" onPress={() => navigation.navigate('ClassForm')} />
      <Button
        title="Connect Google Calendar"
        onPress={() =>
          Alert.alert(
            'Google Calendar',
            'Calendar sync needs Google sign-in and the backend. It will be connected once those are ready.',
          )
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  card: {
    backgroundColor: colors.cardLocked,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  lock: { fontSize: 13 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  empty: { color: colors.muted, marginVertical: 20, textAlign: 'center' },
  section: { color: colors.accent, fontWeight: '700', marginTop: 14, marginBottom: 8 },
});
