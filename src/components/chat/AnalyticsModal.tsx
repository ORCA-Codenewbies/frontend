import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AnalyticsData, AnalyticsAgentResult, ResponseSegment } from '../../types/orca';

interface AnalyticsModalProps {
    visible: boolean;
    analytics: AnalyticsData | null;
    onClose: () => void;
}

type MainTab = 'agents' | 'breakdown' | 'raw';
type DetailTab = 'overview' | 'contribution' | 'raw';
type ViewState = 'list' | 'detail';

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ visible, analytics, onClose }) => {
    const [viewState, setViewState] = useState<ViewState>('list');
    const [mainTab, setMainTab] = useState<MainTab>('agents');
    const [detailTab, setDetailTab] = useState<DetailTab>('overview');
    const [selectedAgent, setSelectedAgent] = useState<AnalyticsAgentResult | null>(null);

    if (!analytics) return null;

    const agentsCalled = analytics.agentsCalled || [];
    const segments = analytics.segments || [];

    // ============================================================
    // NAVIGATION LOGIC
    // ============================================================

    // Fully closes the modal and returns to the Chat Screen.
    // Resets internal state so it opens fresh next time.
    const handleClose = () => {
        setViewState('list');
        setMainTab('agents');
        setSelectedAgent(null);
        onClose();
    };

    // Handles the "← Back" button and Android's hardware back button
    const handleBack = () => {
        if (viewState === 'detail') {
            // Return to Analytics list, preserving tab state
            setViewState('list');
        } else {
            // Return to Chat screen
            handleClose();
        }
    };

    const openAgentDetails = (agent: AnalyticsAgentResult) => {
        setSelectedAgent(agent);
        setDetailTab('overview');
        setViewState('detail');
    };

    // ============================================================
    // UI HELPERS
    // ============================================================

    const getAgentDetails = (agentName: string) => {
        const name = agentName.toLowerCase();
        if (name.includes('ocean')) return { icon: '🌊', label: 'Ocean Agent', color: '#3B82F6' };
        if (name.includes('pfz')) return { icon: '📍', label: 'PFZ Agent', color: '#F59E0B' };
        if (name.includes('weather')) return { icon: '☁️', label: 'Weather Agent', color: '#10B981' };
        if (name.includes('tide')) return { icon: '🌊', label: 'Tide Agent', color: '#0EA5E9' };
        return { icon: '⚙️', label: `${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent`, color: '#6B7280' };
    };

    const formatStatus = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'SUCCESS') return { label: 'Success', bg: '#D1FAE5', text: '#065F46' };
        if (s === 'MOCKED') return { label: 'Mocked', bg: '#FEF3C7', text: '#92400E' };
        if (s === 'ERROR' || s === 'FAILED') return { label: 'Error', bg: '#FEE2E2', text: '#991B1B' };
        return { label: status, bg: '#F3F4F6', text: '#374151' };
    };

    const calculateContributions = (agentName: string) => {
        return segments.filter(s => s.agents && s.agents.includes(agentName)).length;
    };

    // ============================================================
    // RENDER SECTIONS
    // ============================================================

    const renderHeader = () => (
        <View style={styles.header}>
            {/* 
        BACK BUTTON (←) 
        Returns to Analytics if in Agent Details, or Chat if in Analytics 
      */}
            <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleBack}
                accessibilityLabel={viewState === 'detail' ? "Back to analytics" : "Back to chat"}
                accessibilityRole="button"
            >
                <Text style={styles.headerBtnText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Analytics</Text>

            {/* 
        CLOSE BUTTON (X) 
        Always returns directly to Chat, regardless of current view 
      */}
            <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleClose}
                accessibilityLabel="Close analytics"
                accessibilityRole="button"
            >
                <Text style={styles.headerBtnText}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTabs = (tabs: { key: string, label: string }[], activeKey: string, onSelect: (key: any) => void) => (
        <View style={styles.tabContainer}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeKey === tab.key && styles.activeTab]}
                    onPress={() => onSelect(tab.key)}
                >
                    <Text style={[styles.tabText, activeKey === tab.key && styles.activeTabText]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderAgentList = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
            <Text style={styles.sectionTitle}>Agents Involved</Text>
            <Text style={styles.sectionSubtitle}>{agentsCalled.length} agents were used to generate this response</Text>

            {agentsCalled.map((agent, index) => {
                const details = getAgentDetails(agent.agent);
                const status = formatStatus(agent.status);
                const contributions = calculateContributions(agent.agent);
                const confidenceStr = agent.confidence !== null && agent.confidence !== undefined
                    ? `${Math.round(agent.confidence <= 1 ? agent.confidence * 100 : agent.confidence)}%`
                    : 'N/A';

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.agentCard}
                        onPress={() => openAgentDetails(agent)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Open ${details.label} details`}
                        accessibilityRole="button"
                    >
                        <View style={styles.agentCardHeader}>
                            <View style={styles.agentCardTitleRow}>
                                <View style={[styles.agentIconWrap, { backgroundColor: `${details.color}15` }]}>
                                    <Text style={styles.agentIcon}>{details.icon}</Text>
                                </View>
                                <Text style={styles.agentName}>{details.label}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                                </View>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </View>

                        <Text style={styles.agentDesc} numberOfLines={2}>
                            {agent.reason_called || 'Provided specific domain intelligence.'}
                        </Text>

                        <View style={styles.agentMetrics}>
                            <View style={styles.metricCol}>
                                <Text style={styles.metricLabel}>Confidence</Text>
                                <View style={styles.confidenceRow}>
                                    <Text style={styles.metricValue}>{confidenceStr}</Text>
                                    {agent.confidence != null && (
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: confidenceStr, backgroundColor: details.color }]} />
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={styles.metricCol}>
                                <Text style={styles.metricLabel}>Contributions</Text>
                                <Text style={styles.metricValue}>{contributions} part{contributions !== 1 ? 's' : ''}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}

            <View style={styles.infoBox}>
                <Text style={styles.infoBoxIcon}>ⓘ</Text>
                <Text style={styles.infoBoxText}>
                    Tap on any agent to see detailed information and the exact parts of the response they contributed to.
                </Text>
            </View>

            {analytics.totalLatencyMs && (
                <View style={styles.performanceBox}>
                    <Text style={styles.perfTitle}>Performance</Text>
                    <View style={styles.perfRow}>
                        <Text style={styles.perfLabel}>Total Response Time</Text>
                        <Text style={styles.perfValue}>{(analytics.totalLatencyMs / 1000).toFixed(2)}s</Text>
                    </View>
                    {analytics.routeTimings && Object.entries(analytics.routeTimings).map(([k, v]) => (
                        <View key={k} style={styles.perfRow}>
                            <Text style={styles.perfLabel}>{k.replace(/_/g, ' ')}</Text>
                            <Text style={styles.perfValue}>{(v / 1000).toFixed(2)}s</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderResponseBreakdown = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
            <View style={styles.infoBox}>
                <Text style={styles.infoBoxIcon}>ⓘ</Text>
                <Text style={styles.infoBoxText}>
                    Shows how the final response was constructed from different agents.
                </Text>
            </View>

            {segments.map((segment, index) => (
                <View key={segment.id || index} style={styles.segmentBlock}>
                    <Text style={styles.segmentLabel}>Segment {index + 1}</Text>
                    <View style={styles.segmentTextBox}>
                        <Text style={styles.segmentText}>"{segment.text}"</Text>
                    </View>
                    <View style={styles.segmentAgents}>
                        {segment.agents && segment.agents.length > 0 ? (
                            segment.agents.map(a => {
                                const d = getAgentDetails(a);
                                return (
                                    <View key={a} style={[styles.segmentAgentChip, { backgroundColor: `${d.color}15` }]}>
                                        <Text style={[styles.segmentAgentChipText, { color: d.color }]}>{d.label}</Text>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.noAgentsText}>No specific agent attribution</Text>
                        )}
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderRawData = (data: any) => (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
            <View style={styles.rawBox}>
                <Text style={styles.rawText}>{JSON.stringify(data, null, 2)}</Text>
            </View>
        </ScrollView>
    );

    const renderKeyValueTable = (title: string, icon: string, data?: Record<string, any>) => {
        if (!data || Object.keys(data).length === 0) return null;
        return (
            <View style={styles.tableSection}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderIcon}>{icon}</Text>
                    <Text style={styles.tableHeaderTitle}>{title}</Text>
                </View>
                <View style={styles.tableBody}>
                    {Object.entries(data).map(([key, value], i) => (
                        <View key={key} style={[styles.tableRow, i !== 0 && styles.tableRowBorder]}>
                            <Text style={styles.tableKey}>{key.replace(/_/g, ' ')}</Text>
                            <Text style={styles.tableVal}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderAgentDetails = () => {
        if (!selectedAgent) return null;
        const details = getAgentDetails(selectedAgent.agent);
        const status = formatStatus(selectedAgent.status);

        return (
            <>
                <View style={styles.agentDetailHeader}>
                    <View style={styles.agentCardTitleRow}>
                        <View style={[styles.agentIconWrap, { backgroundColor: `${details.color}15` }]}>
                            <Text style={styles.agentIcon}>{details.icon}</Text>
                        </View>
                        <Text style={styles.agentDetailName}>{details.label}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                        </View>
                    </View>
                    <Text style={styles.agentDetailDesc}>{selectedAgent.reason_called || 'Detailed view of the selected agent.'}</Text>
                </View>

                {renderTabs(
                    [
                        { key: 'overview', label: 'Overview' },
                        { key: 'contribution', label: 'Response Contribution' },
                        { key: 'raw', label: 'Raw Data' }
                    ],
                    detailTab,
                    setDetailTab
                )}

                <ScrollView style={styles.content} contentContainerStyle={styles.contentPad}>
                    {detailTab === 'overview' && (
                        <>
                            <Text style={styles.sectionTitle}>Contribution to Response</Text>
                            <View style={styles.contributionQuoteBox}>
                                {segments.filter(s => s.agents.includes(selectedAgent.agent)).map((s, i) => (
                                    <Text key={i} style={styles.contributionQuoteText}>"{s.text}"</Text>
                                ))}
                                {segments.filter(s => s.agents.includes(selectedAgent.agent)).length === 0 && (
                                    <Text style={styles.contributionQuoteText}>No direct text contribution.</Text>
                                )}
                            </View>

                            <Text style={styles.sectionTitle}>Why was it called?</Text>
                            <Text style={styles.regularText}>{selectedAgent.reason_called || 'Automated planner selection.'}</Text>

                            {renderKeyValueTable('Inputs', '📍', selectedAgent.inputs_used)}
                            {renderKeyValueTable('Outputs', '⚙️', selectedAgent.outputs)}

                            <View style={styles.tableSection}>
                                <View style={styles.tableBody}>
                                    {selectedAgent.sources && (
                                        <View style={styles.tableRow}>
                                            <Text style={styles.tableKey}>Data Source</Text>
                                            <Text style={styles.tableVal}>{selectedAgent.sources.join(', ')}</Text>
                                        </View>
                                    )}
                                    {selectedAgent.score_source && (
                                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                                            <Text style={styles.tableKey}>Score Source</Text>
                                            <Text style={styles.tableVal}>{selectedAgent.score_source}</Text>
                                        </View>
                                    )}
                                    {selectedAgent.confidence != null && (
                                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                                            <Text style={styles.tableKey}>Confidence</Text>
                                            <Text style={styles.tableVal}>{Math.round(selectedAgent.confidence <= 1 ? selectedAgent.confidence * 100 : selectedAgent.confidence)}%</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </>
                    )}

                    {detailTab === 'contribution' && (
                        <View>
                            <Text style={styles.sectionTitle}>Exact Text Attributed</Text>
                            {segments.filter(s => s.agents.includes(selectedAgent.agent)).map((s, i) => (
                                <View key={i} style={styles.segmentTextBox}>
                                    <Text style={styles.segmentText}>"{s.text}"</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {detailTab === 'raw' && renderRawData(selectedAgent)}
                </ScrollView>
            </>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleBack}
        >
            <SafeAreaView style={styles.safeArea}>
                {renderHeader()}

                {viewState === 'list' ? (
                    <>
                        {renderTabs(
                            [
                                { key: 'agents', label: 'Agents' },
                                { key: 'breakdown', label: 'Response Breakdown' },
                                { key: 'raw', label: 'Raw Data' }
                            ],
                            mainTab,
                            setMainTab
                        )}
                        {mainTab === 'agents' && renderAgentList()}
                        {mainTab === 'breakdown' && renderResponseBreakdown()}
                        {mainTab === 'raw' && renderRawData(analytics)}
                    </>
                ) : (
                    renderAgentDetails()
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8, // Reduced to accommodate larger touch targets
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    headerBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerBtnText: {
        fontSize: 22,
        color: colors.textPrimary,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.accentBlue,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.accentBlue,
    },
    content: {
        flex: 1,
    },
    contentPad: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    agentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    agentCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    agentCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agentIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    agentIcon: {
        fontSize: 16,
    },
    agentName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    chevron: {
        fontSize: 20,
        color: colors.textMuted,
    },
    agentDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: 12,
    },
    agentMetrics: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
        paddingTop: 12,
    },
    metricCol: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    confidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginLeft: 8,
        marginRight: 16,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    infoBoxIcon: {
        color: '#3B82F6',
        fontSize: 16,
        marginRight: 8,
    },
    infoBoxText: {
        flex: 1,
        fontSize: 12,
        color: '#1D4ED8',
        lineHeight: 18,
    },
    rawBox: {
        backgroundColor: '#1F2937',
        padding: 16,
        borderRadius: 10,
    },
    rawText: {
        color: '#D1D5DB',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 11,
    },
    agentDetailHeader: {
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    agentDetailName: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        marginRight: 10,
    },
    agentDetailDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        lineHeight: 20,
    },
    contributionQuoteBox: {
        backgroundColor: '#F3F4F6',
        borderLeftWidth: 3,
        borderLeftColor: colors.accentBlue,
        padding: 14,
        borderRadius: 6,
        marginBottom: 20,
    },
    contributionQuoteText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 22,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    regularText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 20,
    },
    tableSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        marginBottom: 16,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    tableHeaderIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    tableHeaderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    tableBody: {
        paddingHorizontal: 14,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    tableRowBorder: {
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
    },
    tableKey: {
        fontSize: 13,
        color: colors.textSecondary,
        flex: 1,
        textTransform: 'capitalize',
    },
    tableVal: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'right',
    },
    segmentBlock: {
        marginBottom: 16,
    },
    segmentLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    segmentTextBox: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        marginBottom: 8,
    },
    segmentText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    segmentAgents: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    segmentAgentChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    segmentAgentChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    noAgentsText: {
        fontSize: 12,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    performanceBox: {
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    perfTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    perfRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    perfLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    perfValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
    }
});