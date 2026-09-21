import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, BackHandler } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { NavigationDrawer } from '../components/common/NavigationDrawer';
import { LiveMarineAlert } from '../components/common/LiveMarineAlert';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { LocationSetupScreen } from '../screens/LocationSetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { AboutScreen } from '../screens/AboutScreen';

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isAuthLoading, isAuthenticated, hasCompletedLocationSetup, currentScreen, goBack } = useApp();

  useEffect(() => {
    const onHardwareBackPress = () => {
      // If we are unauthenticated or at the root dashboard, let default OS back behavior happen (exit app)
      if (!isAuthenticated || currentScreen === 'AUTH' || currentScreen === 'DASHBOARD') {
        return false; 
      }
      // Otherwise, we have screens in history. Intercept back press and go back in history.
      goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => backHandler.remove();
  }, [isAuthenticated, currentScreen, goBack]);

  useEffect(() => {
    console.log(`[ORCA-AUTH-DEBUG] AppNavigator:\n{\n  isAuthLoading: ${isAuthLoading},\n  isAuthenticated: ${isAuthenticated},\n  currentScreen: ${currentScreen}\n}`);
  }, [isAuthLoading, isAuthenticated, currentScreen]);

  if (isAuthLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.accentBlue} />
      </View>
    );
  }

  const renderActiveScreen = () => {
    if (!isAuthenticated || currentScreen === 'AUTH') {
      return <AuthScreen />;
    }

    if (!hasCompletedLocationSetup || currentScreen === 'LOCATION_SETUP') {
      return <LocationSetupScreen />;
    }

    switch (currentScreen) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'CHAT':
        return <ChatScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      case 'HISTORY':
        return <HistoryScreen />;
      case 'SAVED':
        return <SavedScreen />;
      case 'HELP_SUPPORT':
        return <HelpSupportScreen />;
      case 'ABOUT':
        return <AboutScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const isAuthOrSetup = !isAuthenticated || currentScreen === 'AUTH' || !hasCompletedLocationSetup || currentScreen === 'LOCATION_SETUP';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      {!isAuthOrSetup && <LiveMarineAlert />}
      {renderActiveScreen()}
      {/* Drawer overlay */}
      <NavigationDrawer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
