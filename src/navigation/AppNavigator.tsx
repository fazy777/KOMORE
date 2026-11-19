import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ProfileRepository } from '../services/profileRepository';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { RoutineLoggerScreen } from '../features/routine/screens/RoutineLoggerScreen';
import { RoutineAnalyticsScreen } from '../features/routine/screens/RoutineAnalyticsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const KomoreTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#090D16',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1E293B',
    primary: '#38BDF8',
  },
};

export const AppNavigator: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const onboarded = await ProfileRepository.isOnboarded();
        setIsOnboarded(onboarded);
      } catch (e) {
        setIsOnboarded(false);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={KomoreTheme}>
      <Stack.Navigator
        initialRouteName={isOnboarded ? 'Dashboard' : 'Onboarding'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#38BDF8',
          headerTitleStyle: {
            fontWeight: '700',
            color: '#F8FAFC',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Komore Focus Hub',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="RoutineLog"
          component={RoutineLoggerScreen}
          options={{
            title: 'Log Study Session',
          }}
        />
        <Stack.Screen
          name="RoutineAnalytics"
          component={RoutineAnalyticsScreen}
          options={{
            title: 'Focus Analytics & Bottlenecks',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
