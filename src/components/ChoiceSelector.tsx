import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
}

interface ChoiceSelectorProps<T extends string | number> {
  label?: string;
  options: ChoiceOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  testIDPrefix?: string;
}

export function ChoiceSelector<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  testIDPrefix = 'choice',
}: ChoiceSelectorProps<T>) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              testID={`${testIDPrefix}-${option.value}`}
              onPress={() => onSelect(option.value)}
              style={[styles.optionItem, isSelected && styles.optionItemSelected]}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
              {option.sublabel ? (
                <Text
                  style={[
                    styles.optionSublabel,
                    isSelected && styles.optionSublabelSelected,
                  ]}
                >
                  {option.sublabel}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionItem: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: '47%',
    flexGrow: 1,
  },
  optionItemSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  optionTextSelected: {
    color: '#38BDF8',
  },
  optionSublabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  optionSublabelSelected: {
    color: '#BAE6FD',
  },
});
