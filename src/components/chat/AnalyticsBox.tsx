import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { colors, shadows } from '../../theme/colors';
import { AnalyticsData } from '../../types/orca';
import { OrcaExecution, OrcaAgentResult } from '../../types/orcaApi';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnalyticsBoxProps {
  analytics?: AnalyticsData;
}

export const AnalyticsBox: React.FC<AnalyticsBoxProps> = ({ analytics }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  if (!analytics) return null;

  const execution: OrcaExecution | undefined = analytics.execution;
  const executionOrder: string[] = execution?.execution_order || [];
  const agentTimings: Record<string, number> = execution?.agent_timings || {};
  const agentContexts: Record<string, OrcaAgentResult> = execution?.context || {};
  const stageTimings: Record<string, number> = execution?.stage_timings || {};
  const routeTimings: Record<string, number> = analytics.routeTimings || {};
  const totalLatencyMs = analytics.totalLatencyMs;

  const agentCount = executionOrder.length;

  // Format latency helper (e.g., 27ms or 2.17s)
  const formatDuration = (ms?: number | null): string => {
    if (ms === undefined || ms === null || isNaN(ms)) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formattedTotalLatency = formatDuration(totalLatencyMs);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const chevronInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Dynamic status extraction
  const renderAgentStatus = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'success' || s === 'completed' || s === 'ok') {
      return (
        <View style={styles.statusRow}>
          <Text style={styles.statusSuccessIcon}>✓</Text>
          <Text style={styles.statusSuccessText}>Success</Text>
        </View>
      );
    }
    if (s === 'failed' || s === 'error') {
      return (
        <View style={styles.statusRow}>
          <Text style={styles.statusFailIcon}>✕</Text>
          <Text style={styles.statusFailText}>Failed</Text>
        </View>
      );
    }
    return (
      <View style={styles.statusRow}>
        <Text style={styles.statusUnknownIcon}>•</Text>
        <Text style={styles.statusUnknownText}>{status || 'Unknown'}</Text>
      </View>
    );
  };

  // Agent human-readable details extraction
  const renderAgentSubtitle = (ctx?: OrcaAgentResult) => {
    if (!ctx) return null;
    const parts: string[] = [];

    if (ctx.location?.name) {
      parts.push(ctx.location.name);
    }
    if (ctx.confidence !== undefined && ctx.confidence !== null) {
      const confPercent =
        ctx.confidence <= 1 ? Math.round(ctx.confidence * 100) : Math.round(ctx.confidence);
      parts.push(`${confPercent}% confidence`);
    }
    if (ctx.sources && ctx.sources.length > 0) {
      parts.push(`${ctx.sources.length} sources`);
    }
    if (ctx.warnings && ctx.warnings.length > 0) {
      parts.push(`${ctx.warnings.length} alerts`);
    }

    if (parts.length === 0) return null;

    return (
      <Text style={styles.agentMetaText} numberOfLines={1}>
        {parts.join(' · ')}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Collapsed Header Bar ── */}
      <TouchableOpacity
        style={styles.summaryBar}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.summaryLeft}>
          <Text style={styles.gearIcon}>⚙</Text>
          <View style={styles.summaryTitles}>
            <Text style={styles.summaryTitle}>Technical details</Text>
            <Text style={styles.summarySubtitle}>
              {agentCount > 0 ? `${agentCount} agent${agentCount === 1 ? '' : 's'}` : 'Direct response'}
              {totalLatencyMs ? ` · ${formattedTotalLatency}` : ''}
            </Text>
          </View>
        </View>
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: chevronInterpolate }] }]}
        >
          ›
        </Animated.Text>
      </TouchableOpacity>

      {/* ── Expanded Content ── */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Top overview */}
          <View style={styles.metaOverview}>
            <Text style={styles.metaOverviewText}>
              {agentCount} {agentCount === 1 ? 'agent' : 'agents'} activated
            </Text>
            {totalLatencyMs ? (
              <Text style={styles.metaOverviewSub}>
                Total response time: {formattedTotalLatency}
              </Text>
            ) : null}
          </View>

          {/* ── Agents Section ── */}
          {agentCount > 0 && (
            <View style={styles.section}>
              <View style={styles.divider} />
              <Text style={styles.sectionHeading}>AGENTS</Text>

              {executionOrder.map((agentName) => {
                const ctx = agentContexts[agentName];
                const timingMs = agentTimings[agentName];

                return (
                  <View key={agentName} style={styles.agentRow}>
                    <View style={styles.agentHeaderLine}>
                      <Text style={styles.agentName}>
                        {agentName.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.agentTiming}>{formatDuration(timingMs)}</Text>
                    </View>

                    {renderAgentStatus(ctx?.status)}
                    {renderAgentSubtitle(ctx)}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Performance Section ── */}
          <View style={styles.section}>
            <View style={styles.divider} />
            <Text style={styles.sectionHeading}>PERFORMANCE</Text>

            {/* Route / routing latency */}
            {(routeTimings.routing || routeTimings.router || stageTimings.routing) !== undefined && (
              <View style={styles.perfRow}>
                <Text style={styles.perfLabel}>Route processing</Text>
                <Text style={styles.perfValue}>
                  {formatDuration(routeTimings.routing || routeTimings.router || stageTimings.routing)}
                </Text>
              </View>
            )}

            {/* Domain agents duration */}
            {(stageTimings.domain_agents || stageTimings.agents) !== undefined && (
              <View style={styles.perfRow}>
                <Text style={styles.perfLabel}>Domain agents</Text>
                <Text style={styles.perfValue}>
                  {formatDuration(stageTimings.domain_agents || stageTimings.agents)}
                </Text>
              </View>
            )}

            {/* Total latency */}
            {totalLatencyMs !== undefined && (
              <View style={styles.perfRow}>
                <Text style={[styles.perfLabel, styles.perfLabelBold]}>Total response</Text>
                <Text style={[styles.perfValue, styles.perfValueBold]}>
                  {formattedTotalLatency}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gearIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 10,
  },
  summaryTitles: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '400',
    paddingHorizontal: 4,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  metaOverview: {
    paddingTop: 4,
    marginBottom: 6,
  },
  metaOverviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaOverviewSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 10,
  },
  section: {
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 8,
  },
  agentRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(13, 35, 58, 0.04)',
  },
  agentHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.4,
  },
  agentTiming: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusSuccessIcon: {
    fontSize: 11,
    color: colors.statusSafe,
    fontWeight: '800',
    marginRight: 4,
  },
  statusSuccessText: {
    fontSize: 11,
    color: colors.statusSafe,
    fontWeight: '600',
  },
  statusFailIcon: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '800',
    marginRight: 4,
  },
  statusFailText: {
    fontSize: 11,
    color: colors.statusDanger,
    fontWeight: '600',
  },
  statusUnknownIcon: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  statusUnknownText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  agentMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  perfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  perfLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  perfLabelBold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  perfValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  perfValueBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});