import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeTone = 'info' | 'success' | 'warning' | 'purple' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'info' }) => {
  const getToneStyle = () => {
    switch (tone) {
      case 'success':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: '#22C55E' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: '#F59E0B' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: '#A855F7' };
      case 'neutral':
        return { bg: '#334155', text: '#CBD5E1', border: '#475569' };
      case 'info':
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: '#0284C7' };
    }
  };

  const currentTone = getToneStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: currentTone.bg, borderColor: currentTone.border },
      ]}
    >
      <Text style={[styles.text, { color: currentTone.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
