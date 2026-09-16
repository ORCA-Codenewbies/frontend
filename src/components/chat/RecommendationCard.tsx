import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { StatusLevel } from '../../types/orca';

interface RecommendationCardProps {
  recommendation?: string;
  status: StatusLevel;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  status,
}) => {
  // Show ONLY when ORCA has actionable advice
  if (!recommendation || !recommendation.trim()) {
    return null;
  }

  const isDanger = status === 'DANGER' || status === 'BIPOD';

  return (
    <View
      style={[
        styles.container,
        isDanger ? styles.containerDanger : styles.containerSafe,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.pointerEmoji}>👉</Text>
        <Text
          style={[
            styles.headerTitle,
            isDanger ? styles.headerTitleDanger : styles.headerTitleSafe,
          ]}
        >
          {isDanger ? 'WHAT TO DO' : 'RECOMMENDATION'}
        </Text>
      </View>

      <Text
        style={[
          styles.actionText,
          isDanger ? styles.actionTextDanger : styles.actionTextSafe,
        ]}
      >
        {recommendation}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1.5,
  },
  containerDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  containerSafe: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pointerEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitleDanger: {
    color: colors.statusDanger,
  },
  headerTitleSafe: {
    color: colors.statusSafe,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionTextDanger: {
    color: '#991B1B',
  },
  actionTextSafe: {
    color: '#14532D',
  },
});
