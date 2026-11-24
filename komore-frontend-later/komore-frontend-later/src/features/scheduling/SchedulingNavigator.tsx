import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Button } from '../../components/FormControls';
import { colors } from '../../components/theme';
import ClassListScreen from '../classes/ClassListScreen';
import ClassFormScreen from '../classes/ClassFormScreen';
import TaskListScreen from '../tasks/TaskListScreen';
import TaskFormScreen from '../tasks/TaskFormScreen';
import TimetableScreen from '../timetable/TimetableScreen';
import { SchedulingStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<SchedulingStackParamList>();

function SchedulingHomeScreen({
  navigation,
}: NativeStackScreenProps<SchedulingStackParamList, 'SchedulingHome'>) {
  return (
    <View style={styles.home}>
      <Text style={styles.title}>Plan your days</Text>
      <Text style={styles.sub}>
        Add your classes and tasks, then let Komore build your timetable.
      </Text>
      <Button title="My Classes" onPress={() => navigation.navigate('ClassList')} />
      <Button title="My Tasks" onPress={() => navigation.navigate('TaskList')} />
      <Button
        title="Timetable"
        variant="primary"
        onPress={() => navigation.navigate('Timetable')}
      />
    </View>
  );
}

/**
 * Steps 3, 4 and 5 as one stack. Mount it inside the app's NavigationContainer, for example
 * as a screen of the leader's main navigator.
 */
export default function SchedulingNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="SchedulingHome"
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="SchedulingHome" component={SchedulingHomeScreen} options={{ title: 'Schedule' }} />
      <Stack.Screen name="ClassList" component={ClassListScreen} options={{ title: 'My Classes' }} />
      <Stack.Screen name="ClassForm" component={ClassFormScreen} options={{ title: 'Class' }} />
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'My Tasks' }} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Task' }} />
      <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: 'Timetable' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  home: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { color: colors.accent, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  sub: { color: colors.muted, fontSize: 14, marginBottom: 20 },
});
