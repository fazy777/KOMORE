import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Chip } from '../../components/FormControls';
import { colors } from '../../components/theme';
import { Task, TaskCategory } from '../../types/schedule';
import { SchedulingStackParamList } from '../scheduling/navigationTypes';
import { listTasks, splitDeadline } from './taskService';

type Props = NativeStackScreenProps<SchedulingStackParamList, 'TaskList'>;

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  assignment: 'Assignment',
  exam_revision: 'Exam revision',
  lecture_recap: 'Lecture recap',
};

const STATUS_LABELS = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Done',
} as const;

export default function TaskListScreen({ navigation }: Props): React.JSX.Element {
  const [filter, setFilter] = useState<TaskCategory | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      listTasks(filter ? { category: filter } : {}).then(setTasks);
    }, [filter]),
  );

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.chips}>
        <Chip label="All" on={filter === null} onPress={() => setFilter(null)} />
        {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map(c => (
          <Chip key={c} label={CATEGORY_LABELS[c]} on={filter === c} onPress={() => setFilter(c)} />
        ))}
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks yet.</Text>
      ) : (
        tasks.map(t => {
          const d = splitDeadline(t.deadline);
          const done = t.status === 'completed';
          return (
            <Pressable
              key={t.id}
              style={[styles.card, done && { opacity: 0.55 }]}
              onPress={() => navigation.navigate('TaskForm', { taskId: t.id })}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{t.title}</Text>
                <Text style={[styles.badge, t.priority === 'high' && styles.badgeHigh]}>
                  {t.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.meta}>
                {CATEGORY_LABELS[t.category]} · Due {d.date} {d.time}
              </Text>
              <Text style={styles.meta}>
                Est. {t.estimatedMinutes} min · {STATUS_LABELS[t.status]}
              </Text>
            </Pressable>
          );
        })
      )}

      <Button title="+ Add task" variant="primary" onPress={() => navigation.navigate('TaskForm')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  badge: {
    color: colors.muted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
    fontSize: 10,
    overflow: 'hidden',
  },
  badgeHigh: { color: colors.accent, borderColor: colors.accent },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  empty: { color: colors.muted, marginVertical: 20, textAlign: 'center' },
});
