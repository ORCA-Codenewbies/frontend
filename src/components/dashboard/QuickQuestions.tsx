import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { QUICK_QUESTIONS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const QuickQuestions: React.FC = () => {
  const { sendMessage, isAnalyzing } = useApp();

  const handleSelectQuestion = (questionText: string) => {
    if (isAnalyzing) return;
    sendMessage(questionText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>QUICK QUESTIONS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_QUESTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.chip}
            onPress={() => handleSelectQuestion(item.text)}
            activeOpacity={0.7}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel={item.text}
          >
            <Text style={styles.chipText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
