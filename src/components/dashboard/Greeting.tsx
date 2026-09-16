import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const Greeting: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi, how can I help you today?</Text>
      <Text style={styles.subtitle}>
        Ask about the sea, fishing areas, weather, or marine risks.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 6,
  },
});
