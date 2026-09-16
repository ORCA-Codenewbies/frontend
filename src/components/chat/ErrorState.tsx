import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

interface ErrorStateProps {
  type?: 'no_data' | 'location_needed' | 'technical_failure' | 'inland';
  locationName?: string;
  customMessage?: string;
  customExplanation?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'no_data',
  locationName,
  customMessage,
  customExplanation,
  onAction,
}) => {
  const { sendMessage, navigateTo } = useApp();

  // Case: Inland / Non-marine location
  if (type === 'inland') {
    return (
      <View style={[styles.container, styles.inlandBorder]}>
        <View style={styles.headerRow}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationPin}>🏞️</Text>
            <Text style={styles.locationName}>
              {locationName || 'Madhya Pradesh'}
            </Text>
          </View>
          <View style={styles.inlandTag}>
            <Text style={styles.inlandTagText}>Inland fishing area</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {customMessage || 'Inland fishing area'}
        </Text>
        <Text style={styles.explanation}>
          {customExplanation ||
            'Madhya Pradesh সমুদ্র উপকূলীয় এলাকা নয়। তাই ORCA-এর marine fishing intelligence এখানে প্রযোজ্য নয়। আমি কাছাকাছি freshwater fishing spots খুঁজে দেওয়ার মতো নির্ভরযোগ্য data পাচ্ছি না।'}
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onAction) onAction();
            else sendMessage('Show Digha marine forecast');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            উপকূলীয় বন্দর নির্বাচন করুন (দিঘা / পারাদ্বীপ) ›
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Case 2: Location needed
  if (type === 'location_needed') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>Location needed</Text>
        </View>
        <Text style={styles.explanation}>
          আপনার location সেট করুন যাতে কাছাকাছি fishing area খুঁজে দিতে পারি।
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onAction) onAction();
            else navigateTo('LOCATION_SETUP');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Set Location ›</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Case 3: Technical failure
  if (type === 'technical_failure') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Couldn't check</Text>
        </View>
        <Text style={styles.explanation}>
          {customExplanation || 'ORCA এখন এই তথ্যটি যাচাই করতে পারছে না।'}
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onAction) onAction();
            else sendMessage('Check ocean conditions again');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Try Again ↻</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Case 1: No data available
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>No Data</Text>
      </View>
      <Text style={styles.explanation}>
        {customExplanation ||
          'এই এলাকার জন্য এখন পর্যাপ্ত তথ্য পাওয়া যায়নি।'}
      </Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          if (onAction) onAction();
          else sendMessage('Check general marine weather');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>Try another location ›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    marginVertical: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inlandBorder: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFEF5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  locationPin: {
    fontSize: 12,
    marginRight: 4,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  inlandTag: {
    backgroundColor: '#FEF9C3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  inlandTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#854D0E',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  explanation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginVertical: 8,
  },
  actionButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentBlueLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
