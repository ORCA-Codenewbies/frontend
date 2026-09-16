import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { LocationModal } from './LocationModal';

export const LocationSelector: React.FC = () => {
  const { currentLocation } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const isInland = currentLocation.type === 'inland';

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.selectorPill}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Selected location: ${currentLocation.name}, ${currentLocation.state}. Tap to change.`}
        >
          <Text style={styles.pinIcon}>{isInland ? '🏞️' : '📍'}</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {currentLocation.name}, {currentLocation.state}
          </Text>
          <Text style={styles.chevron}>˅</Text>
        </TouchableOpacity>
      </View>

      <LocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: 240,
  },
  chevron: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
    marginLeft: 6,
    marginTop: -2,
  },
});
