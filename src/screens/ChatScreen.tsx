import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors, shadows } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { PromptInput } from '../components/common/PromptInput';
import { OrcaResponseBubble } from '../components/chat/OrcaResponseBubble';
import { DecisionCard } from '../components/chat/DecisionCard';
import { EvidenceCard } from '../components/chat/EvidenceCard';
import { MapCard } from '../components/chat/MapCard';
import { RecommendationCard } from '../components/chat/RecommendationCard';
import { FollowUpChips } from '../components/chat/FollowUpChips';
import { AnalysisIndicator } from '../components/chat/AnalysisIndicator';
import { ErrorState } from '../components/chat/ErrorState';
import { AnalyticsModal } from '../components/chat/AnalyticsModal'; // NEW IMPORT
import { ChatMessage, AnalyticsData } from '../types/orca';

export const ChatScreen: React.FC = () => {
  const { messages, currentLocation, startNewChat } = useApp();
  const flatListRef = useRef<FlatList>(null);

  // New state to manage the Analytics Modal
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const [selectedAnalytics, setSelectedAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleOpenAnalytics = (data: AnalyticsData) => {
    setSelectedAnalytics(data);
    setAnalyticsVisible(true);
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    if (item.sender === 'user') {
      return (
        <View style={styles.userBubbleContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{item.text}</Text>
          </View>
          <Text style={styles.timestampText}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    }

    if (item.isAnalyzing) {
      return <View style={styles.orcaResponseWrapper}><AnalysisIndicator step={item.activeAnalysisStep} /></View>;
    }

    const response = item.response;
    if (!response) return null;

    if (response.isInland) {
      return (
        <View style={styles.orcaResponseWrapper}>
          <ErrorState type="inland" locationName={response.context.location} customMessage={response.message} customExplanation={response.explanation} />
          {response.followUps?.length ? <FollowUpChips followUps={response.followUps} /> : null}
        </View>
      );
    }

    if (response.isError) {
      return (
        <View style={styles.orcaResponseWrapper}>
          <ErrorState type={response.errorType || 'technical_failure'} locationName={response.context.location} customMessage={response.message} customExplanation={response.explanation} />
        </View>
      );
    }

    const analytics = response.analyticsData;

    return (
      <View style={styles.orcaResponseWrapper}>
        <View style={styles.orcaAvatarRow}>
          <View style={styles.orcaAvatarBadge}><Text style={styles.orcaAvatarEmoji}>🐋</Text></View>
          <Text style={styles.orcaAvatarName}>ORCA</Text>
          <Text style={styles.orcaTimestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <OrcaResponseBubble
          text={response.message}
          segments={analytics?.segments}
        />

        {/* View Analytics Button perfectly aligned under the response */}
        {analytics ? (
          <TouchableOpacity
            style={styles.viewAnalyticsBtn}
            activeOpacity={0.7}
            onPress={() => handleOpenAnalytics(analytics)}
          >
            <Text style={styles.viewAnalyticsIcon}>📊</Text>
            <Text style={styles.viewAnalyticsBtnText}>View Analytics</Text>
          </TouchableOpacity>
        ) : null}

        <DecisionCard
          status={response.status}
          location={response.context.location}
          time={response.context.time}
          message={response.message}
          explanation={response.explanation}
        />

        {response.evidence?.length ? <EvidenceCard evidence={response.evidence} /> : null}
        {response.map ? <MapCard mapData={response.map} /> : null}

        {response.recommendation ? (
          <RecommendationCard recommendation={response.recommendation} status={response.status} />
        ) : null}

        {response.followUps?.length ? <FollowUpChips followUps={response.followUps} /> : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safeArea}>
      <SafeAreaView style={styles.flexContainer}>
        <Header showBackButton title="ORCA Assistant" />

        <View style={styles.subHeaderBar}>
          <View style={styles.locBadge}>
            <Text style={styles.locBadgePin}>📍</Text>
            <Text style={styles.locBadgeText} numberOfLines={1}>
              {currentLocation.name}, {currentLocation.state}
            </Text>
          </View>

          <TouchableOpacity style={styles.newChatBtn} onPress={startNewChat} activeOpacity={0.8}>
            <Text style={styles.newChatBtnIcon}>＋</Text>
            <Text style={styles.newChatBtnText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}><Text style={styles.emptyWhale}>🐋</Text></View>
              <Text style={styles.emptyTitle}>ORCA Marine Assistant</Text>
              <Text style={styles.emptySubtitle}>
                Get real-time ocean condition intelligence, navigational safety, and potential fishing zones for {currentLocation.name}.
              </Text>
            </View>
          }
        />

        <PromptInput placeholder="Ask ORCA anything…" />
      </SafeAreaView>

      {/* Full-Screen Analytics Modal overlay */}
      <AnalyticsModal
        visible={analyticsVisible}
        analytics={selectedAnalytics}
        onClose={() => setAnalyticsVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flexContainer: { flex: 1 },
  subHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  locBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.surfaceBorder },
  locBadgePin: { fontSize: 12, marginRight: 4 },
  locBadgeText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, maxWidth: 180 },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.accentBlueLight },
  newChatBtnIcon: { fontSize: 13, fontWeight: '700', color: colors.accentBlueDark, marginRight: 4 },
  newChatBtnText: { fontSize: 12, fontWeight: '600', color: colors.accentBlueDark },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, flexGrow: 1 },
  userBubbleContainer: { alignItems: 'flex-end', marginVertical: 6 },
  userBubble: { backgroundColor: colors.accentNavy, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '82%', ...shadows.sm },
  userBubbleText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, fontWeight: '400' },
  timestampText: { fontSize: 10, color: colors.textMuted, marginTop: 4, marginRight: 4 },
  orcaResponseWrapper: { marginVertical: 8, width: '100%' },
  orcaAvatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  orcaAvatarBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentBlueLight, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  orcaAvatarEmoji: { fontSize: 13 },
  orcaAvatarName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.3, flex: 1 },
  orcaTimestamp: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, paddingTop: 60 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentBlueLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyWhale: { fontSize: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 20 },

  // New Analytics Button Styles
  viewAnalyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  viewAnalyticsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  viewAnalyticsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentBlueDark,
  },
});