import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  title,
}) => {
  const { openDrawer, goBack } = useApp();

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : (
        <Image
          source={require('../../assets/Images/orca-logo.jpg')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="ORCA Marine Ecosystem AI"
        />
      )}

      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.flexibleSpace} />
      )}

      <TouchableOpacity
        onPress={openDrawer}
        style={styles.hamburgerButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
      >
        <View style={styles.hamburgerLine} />
        <View style={[styles.hamburgerLine, styles.hamburgerLineMiddle]} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13, 35, 58, 0.05)',
  },
  logoImage: {
    width: 110,
    height: 34,
    borderRadius: 4,
  },
  flexibleSpace: {
    flex: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 28,
    color: colors.accentBlue,
    fontWeight: '300',
    marginRight: 4,
    marginTop: -2,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accentBlue,
  },
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  hamburgerLineMiddle: {
    marginVertical: 4,
    width: 14,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
});
