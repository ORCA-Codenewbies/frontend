import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { StatusLevel } from '../../types/orca';

interface DecisionCardProps {
  status: StatusLevel;
  location: string;
  time?: string;
  message: string;
  explanation?: string;
  isInland?: boolean;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  status,
  location,
  time,
  isInland = false,
}) => {
  const getStatusBadge = () => {
    if (isInland) {
      return {
        label: 'INLAND REGION',
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        borderColor: '#FDE68A',
      };
    }

    switch (status) {
      case 'SAFE':
        return {
          label: 'SAFE CONDITIONS',
          bgColor: colors.statusSafeBg,
          textColor: colors.statusSafe,
          borderColor: colors.statusSafeBorder,
        };
      case 'CAUTION':
        return {
          label: 'EXERCISE CAUTION',
          bgColor: colors.statusCautionBg,
          textColor: colors.statusCaution,
          borderColor: colors.statusCautionBorder,
        };
      case 'DANGER':
        return {
          label: 'DANGER WARNING',
          bgColor: colors.statusDangerBg,
          textColor: colors.statusDanger,
          borderColor: colors.statusDangerBorder,
        };
      case 'BIPOD':
        return {
          label: 'EXTREME RISK (BIPOD)',
          bgColor: colors.statusBipodBg,
          textColor: colors.statusBipod,
          borderColor: colors.statusBipodBorder,
        };
      default:
        return {
          label: status,
          bgColor: colors.surfaceAlt,
          textColor: colors.textPrimary,
          borderColor: colors.surfaceBorder,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={[styles.compactBar, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
      <Text style={[styles.statusText, { color: badge.textColor }]}>{badge.label}</Text>
      <Text style={[styles.locationText, { color: badge.textColor }]}>
        📍 {location} {time ? `· ${time}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
});