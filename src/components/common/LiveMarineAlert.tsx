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
  LayoutChangeEvent,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { BACKEND_URL } from '../../config/backendConfig';
import { colors, shadows } from '../../theme/colors';

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

// Pixels per second for the marquee scroll speed.
const MARQUEE_SPEED_PX_PER_SEC = 32;
// Gap (in px) inserted between repeated copies of the ticker content.
const MARQUEE_GAP = 40;

export const LiveMarineAlert: React.FC = () => {
  const { currentLocation, isAuthenticated, navigateTo } = useApp();
  const [alertResponse, setAlertResponse] = useState<AlertResponse | null>(null);
  const isFetchingRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // --- Marquee state/refs ---
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const marqueeX = useRef(new Animated.Value(0)).current;
  const marqueeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // --- Live pulse dot ---
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated || !currentLocation || !currentLocation.coordinates) {
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { lat, lng } = currentLocation.coordinates;
      // TEMPORARY DEVELOPMENT TEST: appended &test_alert=true
      const url = `${BACKEND_URL}/api/v1/marine-alerts?lat=${lat}&lon=${lng}&test_alert=true`;

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

    // Refresh every 5 minutes (300000 ms)
    const intervalId = setInterval(fetchAlerts, 300000);

    // Refresh on return from background
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
    if (alertResponse && alertResponse.status === 'ALERT' && alertResponse.alerts.length > 0) {
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

  // Subtle pulsing "LIVE" dot — loops for the lifetime of the component.
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

  // Drive the marquee once we know both the content width (one copy of the
  // repeated text block) and the visible container width. We render two
  // back-to-back copies of the content and translate by exactly one copy's
  // width so the loop restarts with zero visible jump.
  useEffect(() => {
    marqueeAnimationRef.current?.stop();
    marqueeX.setValue(0);

    if (contentWidth <= 0 || containerWidth <= 0) {
      return;
    }

    const distance = contentWidth + MARQUEE_GAP;
    const duration = (distance / MARQUEE_SPEED_PX_PER_SEC) * 1000;

    const loop = Animated.loop(
      Animated.timing(marqueeX, {
        toValue: -distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    marqueeAnimationRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      marqueeAnimationRef.current = null;
    };
  }, [contentWidth, containerWidth, marqueeX]);

  if (!isAuthenticated || !alertResponse || alertResponse.status !== 'ALERT' || alertResponse.alerts.length === 0) {
    return null;
  }

  const activeAlert = alertResponse.alerts[0];

  const getSeverityAccent = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return colors.statusDanger;
      case 'HIGH':
        return colors.statusDanger;
      case 'WARNING':
        return colors.statusCaution;
      default:
        return colors.statusCaution;
    }
  };

  const accent = getSeverityAccent(activeAlert.severity);

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

  const handleTap = () => {
    navigateTo('CHAT');
  };

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const onContentLayout = (e: LayoutChangeEvent) => {
    setContentWidth(e.nativeEvent.layout.width);
  };

  // Build the compact ticker string, e.g.
  // "CYCLONE · HIGH · 42.5 KM · ORCA_TEST · Test Marine Alert"
  const tickerParts = [
    activeAlert.type?.replace(/_/g, ' '),
    activeAlert.severity,
    activeAlert.distance_km != null ? `${activeAlert.distance_km} KM` : null,
    activeAlert.source,
    activeAlert.title,
  ].filter(Boolean);
  const tickerText = tickerParts.join('   ·   ');

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], zIndex: 100 }}
    >
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.card,
            shadows.sm ?? shadows.md,
            { borderColor: `${accent}33`, borderLeftColor: accent },
          ]}
        >
          {/* Fixed, non-scrolling LIVE indicator */}
          <View style={styles.liveSection}>
            <Animated.View
              style={[
                styles.liveDot,
                { backgroundColor: accent, opacity: pulseAnim },
              ]}
            />
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>

          <View style={styles.divider} />

          {/* Scrolling ticker */}
          <View style={styles.tickerViewport} onLayout={onContainerLayout}>
            <Animated.View
              style={[
                styles.tickerTrack,
                { transform: [{ translateX: marqueeX }] },
              ]}
            >
              <Text
                style={styles.tickerText}
                numberOfLines={1}
                onLayout={onContentLayout}
              >
                {tickerText}
              </Text>
              <View style={{ width: MARQUEE_GAP }} />
              <Text style={styles.tickerText} numberOfLines={1}>
                {tickerText}
              </Text>
              <View style={{ width: MARQUEE_GAP }} />
              <Text style={styles.tickerText} numberOfLines={1}>
                {tickerText}
              </Text>
            </Animated.View>
          </View>

          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    height: 60,
    overflow: 'hidden',
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
  liveLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 10,
  },
  tickerViewport: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
    marginLeft: 6,
  },
});