import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.base, getContainerStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#38BDF8' : '#FFFFFF'} size="small" />
      ) : (
        <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryContainer: {
    backgroundColor: '#38BDF8',
  },
  primaryText: {
    color: '#0F172A',
  },
  secondaryContainer: {
    backgroundColor: '#1E293B',
  },
  secondaryText: {
    color: '#F1F5F9',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  outlineText: {
    color: '#38BDF8',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
});
