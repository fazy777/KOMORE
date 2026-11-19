// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

const mockAsyncStorage = {
  getItem: jest.fn(async (key: string) => {
    return mockStorage[key] !== undefined ? mockStorage[key] : null;
  }),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = value;
    return null;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
    return null;
  }),
  clear: jest.fn(async () => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    return null;
  }),
  getAllKeys: jest.fn(async () => Object.keys(mockStorage)),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native-safe-area-context
const mockSafeArea = require('react-native-safe-area-context/jest/mock');
jest.mock('react-native-safe-area-context', () => mockSafeArea.default || mockSafeArea);

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => false),
    compatibilityFlags: {},
    Screen: View,
    ScreenContainer: View,
    ScreenStack: View,
    ScreenStackItem: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
    FullWindowOverlay: View,
  };
});
