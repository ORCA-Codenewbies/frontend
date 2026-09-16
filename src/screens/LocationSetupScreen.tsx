import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { MarineLocation } from '../types/user';

export const LocationSetupScreen: React.FC = () => {
  const { availableLocations, completeLocationSetup } = useApp();
  const [selectedLoc, setSelectedLoc] = useState<MarineLocation>(
    availableLocations[0]
  );

  const handleConfirm = () => {
    completeLocationSetup(selectedLoc);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.compassEmoji}>🧭</Text>
          </View>
          <Text style={styles.title}>Set Your Home Base Harbor</Text>
          <Text style={styles.subtitle}>
            ORCA needs your primary coastal harbor to calibrate marine forecasts,
            tidal charts, and nearby Potential Fishing Zones (PFZ).
          </Text>
        </View>

        <FlatList
          data={availableLocations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedLoc.id;
            const isInland = item.type === 'inland';

            return (
              <TouchableOpacity
                style={[
                  styles.locationCard,
                  isSelected && styles.locationCardSelected,
                ]}
                onPress={() => setSelectedLoc(item)}
                activeOpacity={0.7}
              >
                <View style={styles.pinIconBox}>
                  <Text style={styles.pinText}>
                    {isInland ? '🏞️' : '📍'}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.nameRow}>
                    <Text style={styles.locName}>{item.name}</Text>
                    {item.hasActiveAlert && (
                      <View style={styles.alertChip}>
                        <Text style={styles.alertChipText}>Active Advisory</Text>
                      </View>
                    )}
                    {isInland && (
                      <View style={styles.inlandChip}>
                        <Text style={styles.inlandChipText}>Inland</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.locState}>
                    {item.state} · Coastal Hub
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              Set {selectedLoc.name} & Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  compassEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  listContent: {
    paddingBottom: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  locationCardSelected: {
    borderColor: colors.accentBlue,
    backgroundColor: '#F0F9FF',
  },
  pinIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pinText: {
    fontSize: 18,
  },
  infoBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  alertChip: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.statusDanger,
  },
  inlandChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inlandChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  locState: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surfaceBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioOuterSelected: {
    borderColor: colors.accentBlue,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentBlue,
  },
  footer: {
    paddingVertical: 14,
  },
  confirmButton: {
    backgroundColor: colors.accentBlue,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
