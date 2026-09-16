import React from 'react';
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
import { Header } from '../components/common/Header';
import { SavedItem } from '../data/sampleHistory';

export const SavedScreen: React.FC = () => {
  const { savedItems, toggleSaveItem, sendMessage } = useApp();

  const handleOpenItem = (item: SavedItem) => {
    if (item.type === 'PFZ') {
      sendMessage(`Show coordinates and details for ${item.title}`);
    } else if (item.type === 'ALERT') {
      sendMessage(`What is the status of ${item.title}?`);
    } else {
      sendMessage(`Show notes for ${item.location}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBackButton={true} title="Saved Items" />

      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: SavedItem }) => {
          const isPFZ = item.type === 'PFZ';
          const isAlert = item.type === 'ALERT';

          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {isPFZ ? '🐟 PFZ HOTSPOT' : isAlert ? '🚨 ADVISORY' : '📝 NOTE'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSaveItem(item)}
                  style={styles.bookmarkBtn}
                >
                  <Text style={styles.bookmarkIcon}>🔖</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLocation}>📍 {item.location}</Text>
                {item.distance && (
                  <Text style={styles.metaDistance}>
                    🧭 {item.distance} · {item.direction}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleOpenItem(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnText}>
                  {isPFZ ? 'Query PFZ Hotspot ›' : 'Check Updates ›'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No saved fishing zones or alerts yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    padding: 4,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  metaLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaDistance: {
    fontSize: 12,
    color: colors.accentBlue,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: colors.accentBlueLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
