import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Segmented } from '../../components/FormControls';
import { colors } from '../../components/theme';
import { TaskCategory, TaskPriority } from '../../types/schedule';
import { addDays, formatDate } from '../../services/timeUtils';
import { SchedulingStackParamList } from '../scheduling/navigationTypes';
import {
  combineDeadline,
  createTask,
  deleteTask,
  getTask,
  splitDeadline,
  updateTask,
} from './taskService';

type Props = NativeStackScreenProps<SchedulingStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props): React.JSX.Element {
  const taskId = route.params?.taskId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('assignment');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [date, setDate] = useState(addDays(formatDate(new Date()), 1));
  const [time, setTime] = useState('23:59');
  const [minutes, setMinutes] = useState('60');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!taskId) {
      return;
    }
    getTask(taskId).then(t => {
      if (!t) {
        return;
      }
      const d = splitDeadline(t.deadline);
      setTitle(t.title);
      setDescription(t.description ?? '');
      setCategory(t.category);
      setPriority(t.priority);
      setDate(d.date);
      setTime(d.time);
      setMinutes(String(t.estimatedMinutes));
    });
  }, [taskId]);

  const submit = async () => {
    const deadline = combineDeadline(date, time);
    const input = {
      title,
      description,
      category,
      priority,
      deadline,
      estimatedMinutes: Number(minutes),
    };
    const res = taskId ? await updateTask(taskId, input) : await createTask(input);
    if (res.status === 'saved') {
      navigation.goBack();
    } else if (res.status === 'invalid') {
      setErrors(res.errors);
    } else {
      setErrors(['This task no longer exists.']);
    }
  };

  const remove = () =>
    Alert.alert('Delete task', 'Delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (taskId) {
            await deleteTask(taskId);
          }
          navigation.goBack();
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Calculus Assignment 3" />
      <Segmented
        label="Category"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'assignment' as TaskCategory, label: 'Assignment' },
          { value: 'exam_revision' as TaskCategory, label: 'Exam revision' },
          { value: 'lecture_recap' as TaskCategory, label: 'Lecture recap' },
        ]}
      />
      <Segmented
        label="Priority"
        value={priority}
        onChange={setPriority}
        options={[
          { value: 'low' as TaskPriority, label: 'Low' },
          { value: 'medium' as TaskPriority, label: 'Medium' },
          { value: 'high' as TaskPriority, label: 'High' },
        ]}
      />
      <Field label="Deadline date (YYYY-MM-DD)" value={date} onChangeText={setDate} autoCapitalize="none" />
      <Field label="Deadline time (HH:mm)" value={time} onChangeText={setTime} autoCapitalize="none" />
      <Field label="Estimated time (minutes)" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" />
      <Field label="Notes (optional)" value={description} onChangeText={setDescription} multiline />
      {errors.map(e => (
        <Text key={e} style={styles.error}>
          {e}
        </Text>
      ))}
      <Button title="Save Task" variant="primary" onPress={submit} />
      {taskId ? <Button title="Delete Task" variant="danger" onPress={remove} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 40 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 4 },
});
