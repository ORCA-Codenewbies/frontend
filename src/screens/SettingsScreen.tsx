import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';

export const SettingsScreen: React.FC = () => {
  const { user, currentLocation, navigateTo } = useApp();

  // Preferences toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unitsNautical, setUnitsNautical] = useState(false); // false = Metric (km/h), true = Nautical (knots)



  const handleAccountPress = () => {
    Alert.alert(
      'Account & Login',
      `Registered Mobile: ${user.phone}\nRole: Master Fisher / Boat Owner`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBackButton={true} title="Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleAccountPress}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📧</Text>
                <View>
                  <Text style={styles.rowTitle}>Account & Login</Text>
                  <Text style={styles.rowSubtitle}>{user.phone}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.card}>


            {/* Location */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigateTo('LOCATION_SETUP')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📍</Text>
                <View>
                  <Text style={styles.rowTitle}>Base Harbor Location</Text>
                  <Text style={styles.rowSubtitle}>
                    {currentLocation.name}, {currentLocation.state}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔔</Text>
                <View>
                  <Text style={styles.rowTitle}>Marine Risk Alerts</Text>
                  <Text style={styles.rowSubtitle}>Push high swell alerts</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.accentBlueLight }}
                thumbColor={notificationsEnabled ? colors.accentBlue : '#F1F5F9'}
              />
            </View>

            <View style={styles.divider} />

            {/* Units */}
            <View style={styles.settingRow}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📏</Text>
                <View>
                  <Text style={styles.rowTitle}>Marine Units</Text>
                  <Text style={styles.rowSubtitle}>
                    {unitsNautical ? 'Nautical (Knots, NM, Fathoms)' : 'Metric (km/hr, km, Meters)'}
                  </Text>
                </View>
              </View>
              <Switch
                value={unitsNautical}
                onValueChange={setUnitsNautical}
                trackColor={{ false: '#CBD5E1', true: colors.accentBlueLight }}
                thumbColor={unitsNautical ? colors.accentBlue : '#F1F5F9'}
              />
            </View>
          </View>
        </View>

        {/* APP SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigateTo('HELP_SUPPORT')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>❓</Text>
                <Text style={styles.rowTitle}>Help & Support</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigateTo('ABOUT')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>ℹ️</Text>
                <Text style={styles.rowTitle}>About ORCA</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note: Logout is strictly NOT here per specifications */}
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
});
