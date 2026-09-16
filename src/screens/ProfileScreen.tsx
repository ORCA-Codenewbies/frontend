import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';

export const ProfileScreen: React.FC = () => {
  const { user, updateUser } = useApp();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Edit form state
  const [name, setName] = useState(user.name);
  const [boatName, setBoatName] = useState(user.boatName);
  const [boatReg, setBoatReg] = useState(user.boatRegistration);
  const [engineHp, setEngineHp] = useState(user.engineHp);
  const [baseLoc, setBaseLoc] = useState(user.baseLocation);
  const [fishingType, setFishingType] = useState(user.fishingType);
  const [lang, setLang] = useState(user.preferredLanguage);

  const handleSave = () => {
    updateUser({
      name,
      boatName,
      boatRegistration: boatReg,
      engineHp,
      baseLocation: baseLoc,
      fishingType,
      preferredLanguage: lang,
    });
    setIsEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBackButton={true} title="Fisher Profile" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Fisherman Name Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Base Harbor & Operational Location */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>BASE HARBOR</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Home Base Port</Text>
                <Text style={styles.infoValue}>{user.baseLocation}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🧭</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Current Active Location</Text>
                <Text style={styles.infoValue}>{user.currentFishingLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Boat Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>BOAT INFORMATION</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⛵</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Vessel Name</Text>
                <Text style={styles.infoValue}>{user.boatName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📋</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Registration No.</Text>
                <Text style={styles.infoValue}>{user.boatRegistration}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⚙️</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Engine Power & Hull</Text>
                <Text style={styles.infoValue}>
                  {user.engineHp} · {user.vesselType}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fishing Type & Language */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎣</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Fishing Type</Text>
                <Text style={styles.infoValue}>{user.fishingType}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🌐</Text>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Preferred Language</Text>
                <Text style={styles.infoValue}>{user.preferredLanguage}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.editModalTitle}>Edit Fisherman Profile</Text>

            <ScrollView style={styles.editForm}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Boat Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={boatName}
                onChangeText={setBoatName}
              />

              <Text style={styles.fieldLabel}>Registration Number</Text>
              <TextInput
                style={styles.fieldInput}
                value={boatReg}
                onChangeText={setBoatReg}
              />

              <Text style={styles.fieldLabel}>Engine Power</Text>
              <TextInput
                style={styles.fieldInput}
                value={engineHp}
                onChangeText={setEngineHp}
              />

              <Text style={styles.fieldLabel}>Base Location</Text>
              <TextInput
                style={styles.fieldInput}
                value={baseLoc}
                onChangeText={setBaseLoc}
              />

              <Text style={styles.fieldLabel}>Fishing Type</Text>
              <TextInput
                style={styles.fieldInput}
                value={fishingType}
                onChangeText={setFishingType}
              />

              <Text style={styles.fieldLabel}>Preferred Language</Text>
              <TextInput
                style={styles.fieldInput}
                value={lang}
                onChangeText={setLang}
              />
            </ScrollView>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accentNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userPhone: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  editBtn: {
    backgroundColor: colors.accentBlueLight,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  editBtnText: {
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 26,
    textAlign: 'center',
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 45, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  editCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  editForm: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
