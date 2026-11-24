import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Field } from '../../components/FormControls';
import { colors } from '../../components/theme';
import { addDays, formatDate } from '../../services/timeUtils';
import { classRepository, taskRepository } from '../../storage/scheduleRepositories';
import { Timetable, TimetableEntry } from '../../types/schedule';
import {
  generateTimetable,
  getTimetable,
  removeTaskBlock,
  updateTaskBlock,
} from './timetableService';

export default function TimetableScreen(): React.JSX.Element {
  const [date, setDate] = useState(formatDate(new Date()));
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<TimetableEntry | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (d: string) => {
    const [tt, classes, tasks] = await Promise.all([
      getTimetable(d),
      classRepository.list(),
      taskRepository.list(),
    ]);
    const map: Record<string, string> = {};
    classes.forEach(c => (map[c.id] = c.title));
    tasks.forEach(t => (map[t.id] = t.title));
    setNames(map);
    setTimetable(tt);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(date);
    }, [load, date]),
  );

  const generate = async () => {
    setTimetable(await generateTimetable(date));
    await load(date);
  };

  const openEdit = (e: TimetableEntry) => {
    if (e.kind === 'class') {
      Alert.alert('Fixed class', 'Classes cannot be moved. Edit them in My Classes.');
      return;
    }
    setEditing(e);
    setStart(e.startTime);
    setEnd(e.endTime);
    setError('');
  };

  const save = async () => {
    if (!timetable || !editing) {
      return;
    }
    const res = await updateTaskBlock(timetable.id, editing.id, { startTime: start, endTime: end });
    if (res.status === 'saved') {
      setEditing(null);
      await load(date);
    } else if (res.status === 'conflict') {
      setError('That time overlaps another block or a class.');
    } else if (res.status === 'invalid') {
      setError(res.errors.join(' '));
    } else {
      setError('This block no longer exists.');
    }
  };

  const remove = async () => {
    if (!timetable || !editing) {
      return;
    }
    await removeTaskBlock(timetable.id, editing.id);
    setEditing(null);
    await load(date);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.dateBar}>
        <Pressable onPress={() => setDate(addDays(date, -1))}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.date}>{date}</Text>
        <Pressable onPress={() => setDate(addDays(date, 1))}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {!timetable ? (
          <Text style={styles.empty}>No timetable for this day yet.</Text>
        ) : (
          <>
            {timetable.entries.length === 0 && (
              <Text style={styles.empty}>Nothing planned. Add classes or tasks first.</Text>
            )}
            {timetable.entries.map(e => {
              const fixed = e.kind === 'class';
              return (
                <Pressable
                  key={e.id}
                  onPress={() => openEdit(e)}
                  style={[styles.slot, fixed && styles.slotFixed]}>
                  <Text style={styles.time}>
                    {e.startTime} - {e.endTime}
                  </Text>
                  <Text style={styles.slotTitle}>
                    {fixed ? '🔒 ' : ''}
                    {names[(fixed ? e.classId : e.taskId) ?? ''] ?? 'Unknown'}
                    {e.editedByStudent ? '  (edited)' : ''}
                  </Text>
                </Pressable>
              );
            })}
            {timetable.unplaced.length > 0 && (
              <View style={styles.warn}>
                <Text style={styles.warnTitle}>⚠ Could not fit today:</Text>
                {timetable.unplaced.map(u => (
                  <Text key={u.taskId} style={styles.warnText}>
                    {names[u.taskId] ?? 'Task'} ({u.minutes} min)
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
        <Button
          title={timetable ? 'Regenerate timetable' : 'Generate timetable'}
          variant="primary"
          onPress={generate}
        />
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.dim}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {editing?.taskId ? names[editing.taskId] ?? 'Task' : 'Task'}
            </Text>
            <Field label="Start (HH:mm)" value={start} onChangeText={setStart} autoCapitalize="none" />
            <Field label="End (HH:mm)" value={end} onChangeText={setEnd} autoCapitalize="none" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Save Change" variant="primary" onPress={save} />
            <Button title="Remove From Today" variant="danger" onPress={remove} />
            <Button title="Cancel" onPress={() => setEditing(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  arrow: { color: colors.accent, fontSize: 30, paddingHorizontal: 10 },
  date: { color: colors.text, fontSize: 16, fontWeight: '700' },
  body: { padding: 16, paddingBottom: 40 },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 20 },
  slot: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  slotFixed: { backgroundColor: colors.cardLocked, borderColor: colors.border },
  time: { color: colors.muted, fontSize: 12 },
  slotTitle: { color: colors.text, fontWeight: '700', marginTop: 2 },
  warn: { borderColor: colors.danger, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 6 },
  warnTitle: { color: colors.danger, fontWeight: '700', marginBottom: 4 },
  warnText: { color: colors.text, fontSize: 13 },
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  error: { color: colors.danger, marginBottom: 6 },
});
