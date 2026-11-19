import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  testID?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  testID,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        placeholderTextColor="#64748B"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {helperText && !error ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
});
