import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { OrcaLogo } from '../components/common/OrcaLogo';

export const AboutScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBackButton={true} title="About ORCA" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandCard}>
          <OrcaLogo size="large" showSubtitle={true} />
          <Text style={styles.versionBadge}>Version 1.0.0 (Beta Prototype)</Text>
          <Text style={styles.missionText}>
            ORCA is a dedicated marine decision assistant designed specifically
            for artisanal and mechanized coastal fishers across India.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>CORE PHILOSOPHY</Text>
          <Text style={styles.quote}>
            "What is the current situation, what does ORCA decide, and what should
            the fisherman do?"
          </Text>
          <Text style={styles.bodyText}>
            ORCA strips away technical jargon, complex raw radar models, and generic
            AI chattiness to deliver fast, life-saving nautical clarity at sea.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>DATA SOURCES & PARTNERSHIPS</Text>
          <View style={styles.partnerRow}>
            <Text style={styles.partnerDot}>•</Text>
            <Text style={styles.partnerText}>
              <Text style={styles.bold}>INCOIS:</Text> Potential Fishing Zones (PFZ) & Ocean State Forecast
            </Text>
          </View>
          <View style={styles.partnerRow}>
            <Text style={styles.partnerDot}>•</Text>
            <Text style={styles.partnerText}>
              <Text style={styles.bold}>IMD:</Text> Coastal Weather Warnings, Tropical Cyclones & Squalls
            </Text>
          </View>
          <View style={styles.partnerRow}>
            <Text style={styles.partnerDot}>•</Text>
            <Text style={styles.partnerText}>
              <Text style={styles.bold}>Indian Coast Guard:</Text> Search & Rescue Integration
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Designed with respect for India's seafaring fishing communities.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  brandCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  versionBadge: {
    backgroundColor: colors.accentBlueLight,
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  quote: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '700',
    color: colors.accentNavy,
    lineHeight: 21,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  partnerRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  partnerDot: {
    fontSize: 16,
    color: colors.accentBlue,
    marginRight: 8,
    lineHeight: 18,
  },
  partnerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
