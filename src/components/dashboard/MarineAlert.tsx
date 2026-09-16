import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

export const MarineAlert: React.FC = () => {
  const { currentLocation, messages, sendMessage } = useApp();
  const [detailVisible, setDetailVisible] = useState(false);

  // Extract the most recent Orca response for the current location from existing chat history
  const locationResponses = messages
    .filter(
      (m) =>
        m.sender === 'orca' &&
        m.response &&
        !m.isAnalyzing &&
        m.response.context.location === currentLocation.name
    )
    .map((m) => m.response);

  const lastResponse = locationResponses[locationResponses.length - 1];
  const officialWarnings = lastResponse?.officialWarnings || [];

  if (officialWarnings.length === 0) {
    return null;
  }

  const handleAskAboutAlert = () => {
    setDetailVisible(false);
    sendMessage(`Tell me more about this warning in ${currentLocation.name}: ${officialWarnings[0]}`);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.banner,
            styles.bannerDanger,
          ]}
          onPress={() => setDetailVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Marine warning: ${officialWarnings[0]}`}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.alertEmoji}>🚨</Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.headline,
                styles.headlineDanger,
              ]}
              numberOfLines={1}
            >
              OFFICIAL MARINE ALERT
            </Text>
            <Text style={styles.subtext} numberOfLines={1}>
              {officialWarnings[0]}
            </Text>
            <Text style={styles.actionText} numberOfLines={1}>
              {officialWarnings.length > 1 ? `+${officialWarnings.length - 1} more alerts` : 'Tap for details'}
            </Text>
          </View>

          <View style={styles.chevronContainer}>
            <Text
              style={[
                styles.chevron,
                styles.chevronDanger,
              ]}
            >
              ›
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Alert Details Modal */}
      <Modal
        visible={detailVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>🚨</Text>
              <View style={styles.modalTitleBox}>
                <Text style={styles.modalSeverity}>
                  Official Marine Advisory
                </Text>
                <Text style={styles.modalPort}>{currentLocation.name} Coast</Text>
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionLabel}>WHAT IS HAPPENING</Text>
              {officialWarnings.map((warning, index) => (
                <Text key={index} style={styles.modalHeadlineText}>
                  • {warning}
                </Text>
              ))}

              <Text style={[styles.modalSectionLabel, styles.modalSectionLabelAction]}>
                WHAT YOU SHOULD DO
              </Text>
              <Text style={styles.modalActionText}>
                Exercise extreme caution and adhere to official advisories.
              </Text>

              <View style={styles.telemetryBox}>
                <Text style={styles.telemetryTitle}>Advisory Parameters</Text>
                <View style={styles.telemetryRow}>
                  <Text style={styles.telemetryKey}>Wave Height:</Text>
                  <Text style={styles.telemetryVal}>
                    See ORCA
                  </Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={styles.telemetryKey}>Wind Gusts:</Text>
                  <Text style={styles.telemetryVal}>
                    See ORCA
                  </Text>
                </View>
                <View style={styles.telemetryRow}>
                  <Text style={styles.telemetryKey}>Advisory Source:</Text>
                  <Text style={styles.telemetryVal}>INCOIS / IMD Marine Bulletin</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.askOrcaBtn}
                onPress={handleAskAboutAlert}
              >
                <Text style={styles.askOrcaBtnText}>Ask ORCA for Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setDetailVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  bannerDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  bannerCaution: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  iconContainer: {
    marginRight: 10,
    alignSelf: 'center',
  },
  alertEmoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  headline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headlineDanger: {
    color: colors.statusDanger,
  },
  headlineCaution: {
    color: colors.statusCaution,
  },
  subtext: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 6,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
  },
  chevronDanger: {
    color: colors.statusDanger,
  },
  chevronCaution: {
    color: colors.statusCaution,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 45, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalSeverity: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalPort: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  modalSectionLabelAction: {
    marginTop: 12,
  },
  modalHeadlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 3,
  },
  modalActionText: {
    fontSize: 14,
    color: colors.statusDanger,
    fontWeight: '600',
    marginTop: 3,
  },
  telemetryBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  telemetryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  telemetryKey: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  telemetryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'column',
    gap: 8,
  },
  askOrcaBtn: {
    backgroundColor: colors.accentBlue,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  askOrcaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  modalCloseBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
