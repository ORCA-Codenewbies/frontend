import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { MarineLocation } from '../../types/user';
import { useApp } from '../../context/AppContext';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
}) => {
  const { availableLocations, currentLocation, setCurrentLocation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = availableLocations.filter((loc) => {
    const term = searchQuery.toLowerCase().trim();
    return (
      loc.name.toLowerCase().includes(term) ||
      loc.state.toLowerCase().includes(term)
    );
  });

  const handleSelect = (loc: MarineLocation) => {
    setCurrentLocation(loc);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Select Fishing Location</Text>
              <Text style={styles.sheetSubtitle}>
                Choose your active coastal port or harbor
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search coastal harbor or district..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Locations List */}
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === currentLocation.id;
              const isInland = item.type === 'inland';

              return (
                <TouchableOpacity
                  style={[
                    styles.locationCard,
                    isSelected && styles.locationCardSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.locationIconContainer}>
                    <Text style={styles.locationPinIcon}>
                      {isInland ? '🏞️' : '📍'}
                    </Text>
                  </View>

                  <View style={styles.locationInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.locationName}>{item.name}</Text>
                      {item.hasActiveAlert && (
                        <View style={styles.alertTag}>
                          <Text style={styles.alertTagText}>
                            {item.alertSeverity === 'danger' ? '🚨 Risk' : '⚠️ Alert'}
                          </Text>
                        </View>
                      )}
                      {isInland && (
                        <View style={styles.inlandTag}>
                          <Text style={styles.inlandTagText}>Inland</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.locationState}>{item.state}</Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 25, 45, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceBorderStrong,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 6,
  },
  listContent: {
    paddingBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  locationCardSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.accentBlue,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationPinIcon: {
    fontSize: 18,
  },
  locationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  locationState: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  alertTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.statusDanger,
  },
  inlandTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inlandTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  checkmarkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
