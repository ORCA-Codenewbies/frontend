import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

interface FollowUpChipsProps {
  followUps: string[];
}

export const FollowUpChips: React.FC<FollowUpChipsProps> = ({ followUps }) => {
  const { sendMessage, isAnalyzing } = useApp();

  if (!followUps || followUps.length === 0) {
    return null;
  }

  const handleSelect = (question: string) => {
    if (isAnalyzing) return;
    sendMessage(question);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SUGGESTED FOLLOW-UPS</Text>
      <View style={styles.chipsContainer}>
        {followUps.map((question, index) => (
          <TouchableOpacity
            key={`fup-${index}`}
            style={styles.chip}
            onPress={() => handleSelect(question)}
            activeOpacity={0.7}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel={question}
          >
            <Text style={styles.chipText}>{question}</Text>
            <Text style={styles.chipArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentNavy,
    marginRight: 6,
  },
  chipArrow: {
    fontSize: 16,
    color: colors.accentBlue,
    fontWeight: '700',
    marginTop: -1,
  },
});
