import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { OrcaLogo } from './OrcaLogo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

export const NavigationDrawer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    isDrawerOpen,
    closeDrawer,
    navigateTo,
    startNewChat,
    logout,
    user,
  } = useApp();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDrawerOpen, slideAnim, fadeAnim]);

  if (!isDrawerOpen) return null;

  const handleNav = (screen: any) => {
    closeDrawer();
    navigateTo(screen);
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      </Animated.View>

      {/* Sliding Drawer Panel */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateX: slideAnim }],
            width: DRAWER_WIDTH,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Brand */}
            <View style={styles.drawerHeader}>
              <OrcaLogo size="medium" showSubtitle={true} />
              
              {/* User Mini Card */}
              <View style={styles.userBadge}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.userBoat} numberOfLines={1}>
                    ⛵ {user.boatName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Group 1: Chat & Saved */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={[styles.menuItem, styles.newChatButton]}
                onPress={handleNewChat}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIconAccent}>＋</Text>
                <Text style={styles.menuTextAccent}>New Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNav('HISTORY')}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>💬</Text>
                <Text style={styles.menuText}>Chat History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNav('SAVED')}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>🔖</Text>
                <Text style={styles.menuText}>Saved</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Menu Group 2: Account & Settings */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNav('PROFILE')}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>👤</Text>
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNav('SETTINGS')}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>⚙️</Text>
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNav('HELP_SUPPORT')}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>❓</Text>
                <Text style={styles.menuText}>Help & Support</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Menu Group 3: Logout (ONLY in drawer!) */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* Footer note */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerVersion}>ORCA Marine v1.0.0 (Beta)</Text>
              <Text style={styles.footerAgency}>Built for Indian Coastal Fishers</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayDim,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  drawerHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userBoat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  newChatButton: {
    backgroundColor: colors.accentBlueLight,
  },
  menuIconAccent: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentBlue,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuTextAccent: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 12,
    marginHorizontal: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.statusDanger,
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  footerAgency: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
