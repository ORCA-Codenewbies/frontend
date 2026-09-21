// src/components/common/LiveMarineAlert.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppState,
  AppStateStatus,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../config/backendConfig';
import { colors, shadows } from '../../theme/colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AlertData {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  source: string;
  distance_km: number | null;
  updated_at: string;
}

interface AlertResponse {
  status: 'CLEAR' | 'ALERT' | 'UNKNOWN';
  alerts: AlertData[];
  retrieved_at: string;
  cache_ttl_seconds: number;
}

export const LiveMarineAlert: React.FC = () => {
  const { currentLocation, isAuthenticated } = useApp();
  const [alertResponse, setAlertResponse] = useState<AlertResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isFetchingRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated || !currentLocation || !currentLocation.coordinates) {
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { lat, lng } = currentLocation.coordinates;
      const url = `${BACKEND_URL}/api/v1/marine-alerts?lat=${lat}&lon=${lng}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data: AlertResponse = await response.json();
        setAlertResponse(data);
      } else {
        console.warn('[LiveMarineAlert] Failed to fetch alerts, status:', response.status);
      }
    } catch (error) {
      console.warn('[LiveMarineAlert] Network error fetching alerts:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, currentLocation]);

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 300000);
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchAlerts();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [fetchAlerts]);

  useEffect(() => {
    if (alertResponse) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [alertResponse, fadeAnim, slideAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  if (!isAuthenticated || !alertResponse) {
    return null;
  }

  const activeAlert = alertResponse.alerts?.[0];
  const locationName = currentLocation?.name || 'Local Waters';

  let statusColor = '#94A3B8';
  let cardBg = '#F8FAFC';
  let cardBorder = '#F1F5F9';
  let collapsedTitle = 'Marine alert status unavailable';
  let expandedTitle = 'Unavailable';
  let description = 'ORCA could not verify the current live alert status.';
  let icon = 'ℹ️';

  if (alertResponse.status === 'ALERT' && activeAlert) {
    statusColor = '#DC2626';
    cardBg = '#FFF5F5';
    cardBorder = '#FEE2E2';
    collapsedTitle = `${activeAlert.title} – ${locationName}`;
    expandedTitle = activeAlert.title;
    description = activeAlert.message;
    icon = '⚠️';
  } else if (alertResponse.status === 'CLEAR') {
    statusColor = '#16A34A';
    cardBg = '#F0FDF4';
    cardBorder = '#DCFCE7';
    collapsedTitle = 'No active marine alerts';
    expandedTitle = 'Clear';
    description = "No active marine or catastrophic alerts detected for your current location.\n\nThis status means no active alert has been detected by ORCA's live alert monitoring layer. For a complete voyage-safety assessment, use ORCA's marine safety analysis.";
    icon = '✅';
  }

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    const diffMins = Math.round((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${Math.floor(diffHrs / 24)} days ago`;
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], zIndex: 100 }}>
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleExpand}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.card, shadows.sm, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          {!isExpanded ? (
            // COLLAPSED STATE
            <View style={styles.collapsedContent}>
              <View style={styles.liveSection}>
                <Animated.View style={[styles.liveDot, { backgroundColor: statusColor, opacity: pulseAnim }]} />
                <Text style={[styles.liveLabelText, { color: statusColor }]}>LIVE</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.collapsedTitle} numberOfLines={1}>
                {collapsedTitle}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          ) : (
            // EXPANDED STATE
            <View style={styles.expandedContent}>
              <View style={styles.expandedHeader}>
                <View style={[styles.warningIconContainer, { backgroundColor: statusColor }]}>
                  <Text style={styles.warningIcon}>{icon}</Text>
                </View>
                <View style={styles.expandedHeaderMiddle}>
                  <View style={styles.expandedLiveRow}>
                    <View style={styles.liveSection}>
                      <Animated.View style={[styles.liveDot, { backgroundColor: statusColor, opacity: pulseAnim }]} />
                      <Text style={[styles.liveLabelText, { color: statusColor }]}>LIVE</Text>
                    </View>
                    <Text style={styles.timeText}>
                      {activeAlert?.updated_at 
                        ? getRelativeTime(activeAlert.updated_at) 
                        : alertResponse.retrieved_at 
                          ? getRelativeTime(alertResponse.retrieved_at) 
                          : ''}
                    </Text>
                  </View>
                  <Text style={styles.expandedTitle}>{expandedTitle}</Text>
                  <Text style={styles.locationText}>{locationName}</Text>
                </View>
                <View style={styles.chevronUpContainer}>
                  <Text style={styles.chevronUp}>^</Text>
                </View>
              </View>

              <Text style={styles.descriptionText}>{description}</Text>

              {alertResponse.status === 'ALERT' && activeAlert && (
                <>
                  <View style={styles.pillsContainer}>
                    <View style={[styles.pill, styles.pillRed]}>
                      <Text style={[styles.pillText, styles.pillTextRed]}>{activeAlert.type.replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={[styles.pill, styles.pillRed]}>
                      <Text style={[styles.pillText, styles.pillTextRed]}>{activeAlert.severity}</Text>
                    </View>
                    {activeAlert.distance_km != null && (
                      <View style={[styles.pill, styles.pillBlue]}>
                        <Text style={[styles.pillText, styles.pillTextBlue]}>{activeAlert.distance_km} KM</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.sourceContainer}>
                    <Text style={styles.sourceText}>ⓘ Source: {activeAlert.source}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingLeft: 14,
    paddingRight: 12,
  },
  expandedContent: {
    padding: 16,
  },
  liveSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  liveLabelText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#FECACA',
    marginHorizontal: 12,
  },
  collapsedTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  chevron: {
    fontSize: 20,
    color: '#94A3B8',
    marginLeft: 8,
    marginBottom: 2,
  },
  expandedHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  warningIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warningIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  expandedHeaderMiddle: {
    flex: 1,
  },
  expandedLiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  expandedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  chevronUpContainer: {
    paddingLeft: 8,
  },
  chevronUp: {
    fontSize: 24,
    color: '#94A3B8',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillRed: {
    backgroundColor: '#FEE2E2',
  },
  pillBlue: {
    backgroundColor: '#E0F2FE',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextRed: {
    color: '#B91C1C',
  },
  pillTextBlue: {
    color: '#0369A1',
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    paddingTop: 12,
  },
  sourceText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});