import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { AnalysisStep } from '../../types/orca';

interface AnalysisIndicatorProps {
  step?: AnalysisStep;
}

export const AnalysisIndicator: React.FC<AnalysisIndicatorProps> = ({ step }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentLabel = step?.label || 'ORCA is analysing...';
  const progress = step?.progressPercent ?? 30;

  useEffect(() => {
    // Fade in text on step update
    fadeAnim.setValue(0.4);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Continuous pulse/spin for active task
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [currentLabel, fadeAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.brandBadge}>
          <Text style={styles.whaleIcon}>🐋</Text>
        </View>
        <Text style={styles.headerTitle}>ORCA Marine Analysis</Text>
      </View>

      {/* Prominently visible CURRENT active task (no checklist) */}
      <Animated.View style={[styles.activeTaskCard, { opacity: fadeAnim }]}>
        <View style={styles.taskRow}>
          <Animated.Text
            style={[
              styles.spinnerIcon,
              { transform: [{ rotate: spin }] },
            ]}
          >
            ◌
          </Animated.Text>
          <Text style={styles.taskLabel} numberOfLines={2}>
            {currentLabel}
          </Text>
        </View>

        {/* Minimal fluid progress bar */}
        {step?.progressPercent !== undefined && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.2)',
    marginVertical: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  whaleIcon: {
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeTaskCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spinnerIcon: {
    fontSize: 18,
    color: colors.accentBlue,
    fontWeight: '700',
    marginRight: 10,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accentBlue,
    borderRadius: 2,
  },
});
