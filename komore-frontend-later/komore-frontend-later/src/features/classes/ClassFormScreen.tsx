import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Segmented } from '../../components/FormControls';
import { colors } from '../../components/theme';
import { ClassKind } from '../../types/schedule';
import { SchedulingStackParamList } from '../scheduling/navigationTypes';
import { deleteClass, getClass, saveClass } from './classService';

type Props = NativeStackScreenProps<SchedulingStackParamList, 'ClassForm'>;

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => ({
  value: i + 1,
  label: l,
}));

export default function ClassFormScreen({ navigation, route }: Props): React.JSX.Element {
  const classId = route.params?.classId;
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ClassKind>('class');
  const [day, setDay] = useState<number | null>(1);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!classId) {
      return;
    }
    getClass(classId).then(c => {
      if (!c) {
        return;
      }
      setTitle(c.title);
      setKind(c.kind);
      setDay(c.dayOfWeek);
      setDate(c.specificDate ?? '');
      setStart(c.startTime);
      setEnd(c.endTime);
      setLocation(c.location ?? '');
    });
  }, [classId]);

  const submit = async (allowOverlap: boolean) => {
    const res = await saveClass(
      {
        title,
        kind,
        dayOfWeek: day,
        specificDate: date,
        startTime: start,
        endTime: end,
        location,
      },
      { id: classId, allowOverlap },
    );
    if (res.status === 'saved') {
      navigation.goBack();
    } else if (res.status === 'invalid') {
      setErrors(res.errors);
    } else if (res.status === 'overlap') {
      const names = res.conflicts.map(c => c.title).join(', ');
      Alert.alert('Overlapping class', `This overlaps with: ${names}.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save anyway', onPress: () => submit(true) },
      ]);
    } else {
      setErrors(['This class no longer exists.']);
    }
  };

  const remove = () =>
    Alert.alert('Delete class', 'Delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (classId) {
            await deleteClass(classId);
          }
          navigation.goBack();
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Software Engineering" />
      <Segmented
        label="Type"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'class' as ClassKind, label: 'Class' },
          { value: 'lab' as ClassKind, label: 'Lab' },
        ]}
      />
      <Segmented label="Day (repeats weekly)" value={date ? null : day} onChange={setDay} options={DAY_OPTIONS} />
      <Field
        label="Or one specific date (optional, YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        placeholder="2026-11-23"
        autoCapitalize="none"
      />
      <Field label="Start time (HH:mm)" value={start} onChangeText={setStart} placeholder="08:00" autoCapitalize="none" />
      <Field label="End time (HH:mm)" value={end} onChangeText={setEnd} placeholder="09:30" autoCapitalize="none" />
      <Field label="Location (optional)" value={location} onChangeText={setLocation} placeholder="Room 12" />
      <Text style={styles.note}>🔒 Classes are fixed. The timetable never moves them.</Text>
      {errors.map(e => (
        <Text key={e} style={styles.error}>
          {e}
        </Text>
      ))}
      <Button title="Save Class" variant="primary" onPress={() => submit(false)} />
      {classId ? <Button title="Delete Class" variant="danger" onPress={remove} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  note: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 4 },
});
