import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface OrcaLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export const OrcaLogo: React.FC<OrcaLogoProps> = ({
  size = 'small',
  showSubtitle = false,
}) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          isSmall && styles.badgeSmall,
          isLarge && styles.badgeLarge,
        ]}
      >
        <Text
          style={[
            styles.badgeIcon,
            isSmall && styles.badgeIconSmall,
            isLarge && styles.badgeIconLarge,
          ]}
        >
          🐋
        </Text>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.wordmarkRow}>
          <Text
            style={[
              styles.wordmark,
              isSmall && styles.wordmarkSmall,
              isLarge && styles.wordmarkLarge,
            ]}
          >
            ORCA
          </Text>
          <View style={styles.waveDot} />
        </View>
        {showSubtitle && (
          <Text style={styles.subtitle}>Marine Decision Assistant</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeSmall: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeLarge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 12,
  },
  badgeIcon: {
    fontSize: 18,
  },
  badgeIconSmall: {
    fontSize: 16,
  },
  badgeIconLarge: {
    fontSize: 26,
  },
  textContainer: {
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.2,
  },
  wordmarkSmall: {
    fontSize: 18,
    letterSpacing: 1,
  },
  wordmarkLarge: {
    fontSize: 28,
    letterSpacing: 1.8,
  },
  waveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentBlue,
    marginLeft: 3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: -2,
  },
});
