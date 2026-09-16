import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { MapData } from '../../types/orca';

interface MapCardProps {
  mapData?: MapData | null;
}

export const MapCard: React.FC<MapCardProps> = ({ mapData }) => {
  const [mapLayer, setMapLayer] = useState<'nautical' | 'satellite'>('nautical');

  // Strict rule: Show map ONLY when geographical info is relevant. Do not show for every response.
  if (!mapData) {
    return null;
  }

  const { title, userLocation, targetZone, distanceKm, direction, bearingDegrees } =
    mapData;

  const handleOpenInMaps = () => {
    const lat = targetZone.lat;
    const lng = targetZone.lng;
    const label = encodeURIComponent(targetZone.name);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}+(${label})`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Open Maps', `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
        }
      })
      .catch(() => {
        Alert.alert('Open Maps', `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
      });
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.titleIcon}>🗺️</Text>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Interactive Marine Chart Visualizer Canvas */}
      <View
        style={[
          styles.mapCanvas,
          mapLayer === 'satellite' ? styles.canvasSatellite : styles.canvasNautical,
        ]}
      >
        {/* Layer Switcher */}
        <View style={styles.layerSwitchRow}>
          <TouchableOpacity
            style={[
              styles.layerBtn,
              mapLayer === 'nautical' && styles.layerBtnActive,
            ]}
            onPress={() => setMapLayer('nautical')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.layerBtnText,
                mapLayer === 'nautical' && styles.layerBtnTextActive,
              ]}
            >
              Nautical Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.layerBtn,
              mapLayer === 'satellite' && styles.layerBtnActive,
            ]}
            onPress={() => setMapLayer('satellite')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.layerBtnText,
                mapLayer === 'satellite' && styles.layerBtnTextActive,
              ]}
            >
              Bathymetry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bathymetry / Depth contour visual rings */}
        <View style={styles.contourCircle1} />
        <View style={styles.contourCircle2} />
        <View style={styles.contourCircle3} />

        {/* Coastal boundary indicator */}
        <View style={styles.coastlineIndicator}>
          <Text style={styles.coastlineText}>◄ COASTAL SHORELINE</Text>
        </View>

        {/* Visual Nautical Grid Lines */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />

        {/* User Marker (Harbor Base) */}
        <View style={styles.userPin}>
          <View style={styles.pinCircleUser}>
            <Text style={styles.pinEmoji}>📍</Text>
          </View>
          <View style={styles.pinLabelBox}>
            <Text style={styles.pinLabelText} numberOfLines={1}>
              {userLocation.name}
            </Text>
          </View>
        </View>

        {/* Route Bearing Line with Heading vector */}
        <View style={styles.vectorContainer}>
          <View style={styles.vectorDashedLine} />
          <View style={styles.vectorDirectionPill}>
            <Text style={styles.vectorDirectionText}>
              {direction} {bearingDegrees}° · {distanceKm} km
            </Text>
          </View>
        </View>

        {/* Target Zone Marker (PFZ Hotspot) */}
        <View style={styles.targetPin}>
          <View style={styles.pfzPulseRing} />
          <View style={styles.pinCircleTarget}>
            <Text style={styles.pinEmoji}>🐟</Text>
          </View>
          <View style={styles.targetLabelBox}>
            <Text style={styles.targetLabelText} numberOfLines={1}>
              {targetZone.name}
            </Text>
            <Text style={styles.targetDepthText}>Depth: 26m</Text>
          </View>
        </View>

        {/* Compass Rose Mini Overlay */}
        <View style={styles.compassOverlay}>
          <Text style={styles.compassN}>N</Text>
          <Text style={styles.compassArrow}>↑</Text>
        </View>

        {/* Coordinate Readout */}
        <View style={styles.coordsOverlay}>
          <Text style={styles.coordsText}>
            PFZ: {targetZone.lat.toFixed(3)}°N, {targetZone.lng.toFixed(3)}°E
          </Text>
        </View>
      </View>

      {/* Distance & Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.routeSummary}>
          <Text style={styles.routePoints}>📍 You ─────→ 🐟 PFZ</Text>
          <Text style={styles.routeMetrics}>
            {distanceKm} km · Heading {direction} ({bearingDegrees}°)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.openMapsBtn}
          onPress={handleOpenInMaps}
          activeOpacity={0.7}
        >
          <Text style={styles.openMapsText}>Open in Maps ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginVertical: 6,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mapCanvas: {
    height: 190,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  canvasNautical: {
    backgroundColor: '#0F2B48',
    borderColor: '#1E3A5F',
  },
  canvasSatellite: {
    backgroundColor: '#0A1E32',
    borderColor: '#163350',
  },
  layerSwitchRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(10, 25, 45, 0.75)',
    borderRadius: 8,
    padding: 2,
  },
  layerBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  layerBtnActive: {
    backgroundColor: colors.accentBlue,
  },
  layerBtnText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  layerBtnTextActive: {
    color: '#FFFFFF',
  },
  contourCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.12)',
    right: -20,
    top: -20,
  },
  contourCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    right: 15,
    top: 15,
  },
  contourCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    right: 50,
    top: 50,
  },
  coastlineIndicator: {
    position: 'absolute',
    left: 6,
    bottom: 8,
    backgroundColor: 'rgba(10, 25, 45, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coastlineText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridLineHorizontal1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  userPin: {
    position: 'absolute',
    left: 28,
    bottom: 32,
    alignItems: 'center',
    zIndex: 5,
  },
  pinCircleUser: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  pinEmoji: {
    fontSize: 14,
  },
  pinLabelBox: {
    backgroundColor: 'rgba(10, 25, 45, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  pinLabelText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  vectorContainer: {
    position: 'absolute',
    width: 130,
    height: 60,
    transform: [{ rotate: '-35deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  vectorDashedLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#38BDF8',
  },
  vectorDirectionPill: {
    position: 'absolute',
    backgroundColor: colors.accentNavy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  vectorDirectionText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
  },
  targetPin: {
    position: 'absolute',
    right: 42,
    top: 36,
    alignItems: 'center',
    zIndex: 5,
  },
  pfzPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 165, 233, 0.35)',
    top: -5,
  },
  pinCircleTarget: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  targetLabelBox: {
    backgroundColor: 'rgba(10, 25, 45, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
  },
  targetLabelText: {
    fontSize: 9,
    color: '#34D399',
    fontWeight: '700',
  },
  targetDepthText: {
    fontSize: 8,
    color: '#CBD5E1',
  },
  compassOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 28,
    backgroundColor: 'rgba(10, 25, 45, 0.75)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassN: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
  },
  compassArrow: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: -3,
  },
  coordsOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    backgroundColor: 'rgba(10, 25, 45, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordsText: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  routeSummary: {
    flex: 1,
  },
  routePoints: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  routeMetrics: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  openMapsBtn: {
    backgroundColor: colors.accentBlueLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  openMapsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
