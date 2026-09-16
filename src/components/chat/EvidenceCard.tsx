import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { EvidenceItem } from '../../types/orca';

interface EvidenceCardProps {
  evidence: EvidenceItem[];
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  // If no evidence provided, do not render empty card
  if (!evidence || evidence.length === 0) {
    return null;
  }

  const getParameterEmoji = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('wind')) return '💨';
    if (l.includes('wave') || l.includes('swell')) return '🌊';
    if (l.includes('warning') || l.includes('alert')) return '⚠️';
    if (l.includes('sst') || l.includes('temp')) return '🌡️';
    if (l.includes('chloro') || l.includes('plankton')) return '🌱';
    if (l.includes('current') || l.includes('drift')) return '🧭';
    if (l.includes('depth') || l.includes('pfz')) return '🐟';
    if (l.includes('heading')) return '🧭';
    if (l.includes('gear')) return '🕸️';
    if (l.includes('tide')) return '⏱️';
    return '📊';
  };

  const getSeverityStyle = (severity?: 'normal' | 'caution' | 'danger') => {
    switch (severity) {
      case 'danger':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: colors.statusDanger,
        };
      case 'caution':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: colors.statusCaution,
        };
      default:
        return {
          bg: colors.surfaceAlt,
          border: colors.surfaceBorder,
          text: colors.textPrimary,
        };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Why this assessment?</Text>
      <View style={styles.grid}>
        {evidence.map((item) => {
          const sev = getSeverityStyle(item.severity);
          const emoji = item.icon || getParameterEmoji(item.label);

          return (
            <View
              key={item.id}
              style={[
                styles.evidenceTile,
                { backgroundColor: sev.bg, borderColor: sev.border },
              ]}
            >
              <View style={styles.labelRow}>
                <Text style={styles.tileEmoji}>{emoji}</Text>
                <Text style={styles.tileLabel}>{item.label}</Text>
              </View>

              <Text style={[styles.tileValue, { color: sev.text }]}>
                {item.value}
              </Text>

              {item.subValue && (
                <Text style={styles.tileSubValue} numberOfLines={1}>
                  {item.subValue}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evidenceTile: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 78,
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tileEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tileValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tileSubValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
