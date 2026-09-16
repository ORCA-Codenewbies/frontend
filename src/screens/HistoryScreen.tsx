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
import { SAMPLE_HISTORY, HistorySession } from '../data/sampleHistory';

export const HistoryScreen: React.FC = () => {
  const { loadHistorySession } = useApp();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DANGER':
        return { text: 'DANGER', bg: '#FEF2F2', color: colors.statusDanger };
      case 'CAUTION':
        return { text: 'CAUTION', bg: '#FFFBEB', color: colors.statusCaution };
      default:
        return { text: 'SAFE', bg: '#ECFDF5', color: colors.statusSafe };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBackButton={true} title="Chat History" />

      <FlatList
        data={SAMPLE_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: HistorySession }) => {
          const badge = getStatusBadge(item.status);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => loadHistorySession(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.locDate}>
                  <Text style={styles.locationText}>📍 {item.location}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>
                    {badge.text}
                  </Text>
                </View>
              </View>

              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.summaryText} numberOfLines={2}>
                {item.summary}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.reopenText}>Open conversation thread ›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No previous chat history found.</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  reopenText: {
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
