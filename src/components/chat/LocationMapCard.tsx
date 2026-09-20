import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import Mapbox, {
  Camera,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
} from '@rnmapbox/maps';

import { colors } from '../../theme/colors';
import { LocationMapData, MapCandidate } from '../../types/orca';

interface LocationMapCardProps {
  data: LocationMapData;
}

type Coordinate = {
  latitude: number;
  longitude: number;
};

const toPosition = (coordinate: Coordinate): [number, number] => [
  coordinate.longitude,
  coordinate.latitude,
];

export const LocationMapCard: React.FC<LocationMapCardProps> = ({ data }) => {
  const initialSelected =
    data?.candidates?.length > 0 ? data.candidates[0] : null;

  const [selectedCandidate, setSelectedCandidate] =
    useState<MapCandidate | null>(initialSelected);

  if (!data || data.candidates.length === 0) {
    return null;
  }

  const allCoordinates = useMemo<Coordinate[]>(() => {
    const coordinates: Coordinate[] = [];

    if (data.origin) {
      coordinates.push({
        latitude: data.origin.latitude,
        longitude: data.origin.longitude,
      });
    }

    data.candidates.forEach((candidate) => {
      coordinates.push({
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      });
    });

    return coordinates;
  }, [data]);

  const cameraBounds = useMemo(() => {
    if (allCoordinates.length === 0) {
      return undefined;
    }

    const longitudes = allCoordinates.map((point) => point.longitude);
    const latitudes = allCoordinates.map((point) => point.latitude);

    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);

    // Add a small geographic margin so markers are not directly
    // against the edge of the map.
    const lngPadding = Math.max((maxLng - minLng) * 0.15, 0.03);
    const latPadding = Math.max((maxLat - minLat) * 0.15, 0.03);

    return {
      ne: [maxLng + lngPadding, maxLat + latPadding] as [number, number],
      sw: [minLng - lngPadding, minLat - latPadding] as [number, number],
    };
  }, [allCoordinates]);

  const routeLine = useMemo(() => {
    if (!data.origin || !selectedCandidate) {
      return null;
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          toPosition(data.origin),
          toPosition({
            latitude: selectedCandidate.latitude,
            longitude: selectedCandidate.longitude,
          }),
        ],
      },
    };
  }, [data.origin, selectedCandidate]);

  const handleOpenMaps = () => {
    if (!selectedCandidate) {
      return;
    }

    const lat = selectedCandidate.latitude;
    const lng = selectedCandidate.longitude;

    const googleMapsUrl =
      Platform.OS === 'android'
        ? `geo:0,0?q=${lat},${lng}(PFZ Candidate)`
        : `comgooglemaps://?q=${lat},${lng}`;

    const webFallback =
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(googleMapsUrl);
        }

        return Linking.openURL(webFallback);
      })
      .catch(() => Linking.openURL(webFallback));
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          logoEnabled={false}
          attributionEnabled={true}
          compassEnabled={true}
          scaleBarEnabled={false}
        >
          {cameraBounds ? (
            <Camera
              bounds={cameraBounds}
              padding={{
                paddingTop: 45,
                paddingRight: 45,
                paddingBottom: 45,
                paddingLeft: 45,
              }}
              animationDuration={500}
              animationMode="easeTo"
            />
          ) : null}

          {data.origin ? (
            <PointAnnotation
              id="orca-origin"
              coordinate={toPosition(data.origin)}
              title={data.origin.name || 'Origin'}
            >
              <View style={styles.originMarker}>
                <View style={styles.originMarkerInner} />
              </View>
            </PointAnnotation>
          ) : null}

          {data.candidates.map((candidate, index) => {
            const isSelected =
              selectedCandidate?.latitude === candidate.latitude &&
              selectedCandidate?.longitude === candidate.longitude;

            return (
              <PointAnnotation
                key={`candidate-${index}`}
                id={`candidate-${index}`}
                coordinate={toPosition(candidate)}
                title={
                  candidate.rank
                    ? `Candidate #${candidate.rank}`
                    : 'Fishing Area'
                }
                snippet={`Dist: ${candidate.distance_km ?? '?'
                  } km | Depth: ${candidate.depth_m ?? '?'} m`}
                selected={isSelected}
                onSelected={() => setSelectedCandidate(candidate)}
              >
                <View
                  style={[
                    styles.candidateMarker,
                    isSelected && styles.selectedCandidateMarker,
                  ]}
                >
                  <View
                    style={[
                      styles.candidateMarkerInner,
                      isSelected && styles.selectedCandidateMarkerInner,
                    ]}
                  />
                </View>
              </PointAnnotation>
            );
          })}

          {routeLine ? (
            <ShapeSource id="orca-origin-route" shape={routeLine}>
              <LineLayer
                id="orca-origin-route-line"
                style={{
                  lineColor: colors.accentBlue,
                  lineWidth: 2,
                  lineOpacity: 0.85,
                  lineDasharray: [2, 2],
                }}
              />
            </ShapeSource>
          ) : null}
        </MapView>
      </View>

      {selectedCandidate ? (
        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataTitle}>
              {data.candidates.length > 1 && selectedCandidate.rank
                ? `Option #${selectedCandidate.rank}`
                : 'Nearest PFZ'}
            </Text>

            {selectedCandidate.source ? (
              <Text style={styles.sourceBadge}>
                {selectedCandidate.source}
              </Text>
            ) : null}
          </View>

          <Text style={styles.metadataDetails}>
            {selectedCandidate.distance_km !== undefined
              ? `${selectedCandidate.distance_km.toFixed(1)} km`
              : ''}
            {selectedCandidate.bearing
              ? ` • ${selectedCandidate.bearing}`
              : ''}
            {selectedCandidate.depth_m !== undefined
              ? ` • Depth: ${selectedCandidate.depth_m}m`
              : ''}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleOpenMaps}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          Open in Google Maps
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  mapContainer: {
    height: 220,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },

  map: {
    flex: 1,
  },

  originMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  originMarkerInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  candidateMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  candidateMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  selectedCandidateMarker: {
    backgroundColor: colors.statusCaution,
    transform: [{ scale: 1.15 }],
  },

  selectedCandidateMarkerInner: {
    backgroundColor: '#FFFFFF',
  },

  metadataContainer: {
    padding: 12,
  },

  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  metadataTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  sourceBadge: {
    fontSize: 10,
    backgroundColor: colors.surfaceAlt,
    color: colors.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  metadataDetails: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  actionButton: {
    backgroundColor: colors.accentBlueLight,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },

  actionButtonText: {
    color: colors.accentBlueDark,
    fontSize: 14,
    fontWeight: '600',
  },
});