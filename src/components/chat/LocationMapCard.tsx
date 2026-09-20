import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../../theme/colors';
import { LocationMapData, MapCandidate } from '../../types/orca';

interface LocationMapCardProps {
  data: LocationMapData;
}

export const LocationMapCard: React.FC<LocationMapCardProps> = ({ data }) => {
  const mapRef = useRef<MapView>(null);

  // Default to the first candidate as selected
  const initialSelected = data.candidates.length > 0 ? data.candidates[0] : null;
  const [selectedCandidate, setSelectedCandidate] = useState<MapCandidate | null>(initialSelected);

  if (!data || data.candidates.length === 0) {
    return null;
  }

  const handleMapReady = () => {
    if (mapRef.current) {
      const coordinates = [];
      if (data.origin) {
        coordinates.push({ latitude: data.origin.latitude, longitude: data.origin.longitude });
      }
      data.candidates.forEach(c => {
        coordinates.push({ latitude: c.latitude, longitude: c.longitude });
      });

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!selectedCandidate) return;

    const lat = selectedCandidate.latitude;
    const lng = selectedCandidate.longitude;

    // Explicitly target Google Maps
    const scheme = Platform.select({ ios: 'comgooglemaps://?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${latLng}`,
      android: `${scheme}${latLng}(PFZ Candidate)`
    });

    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(fallbackUrl);
        }
      }).catch(() => {
        Linking.openURL(fallbackUrl);
      });
    } else {
       Linking.openURL(fallbackUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          onMapReady={handleMapReady}
          initialRegion={{
            latitude: selectedCandidate?.latitude || 0,
            longitude: selectedCandidate?.longitude || 0,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {/* Origin Marker */}
          {data.origin && (
            <Marker
              coordinate={{ latitude: data.origin.latitude, longitude: data.origin.longitude }}
              title={data.origin.name || "Origin"}
              pinColor={colors.accentBlue}
            />
          )}

          {/* Candidate Markers */}
          {data.candidates.map((candidate, index) => {
            const isSelected = selectedCandidate?.latitude === candidate.latitude &&
                               selectedCandidate?.longitude === candidate.longitude;
            return (
              <Marker
                key={`candidate-${index}`}
                coordinate={{ latitude: candidate.latitude, longitude: candidate.longitude }}
                title={candidate.rank ? `Candidate #${candidate.rank}` : "Fishing Area"}
                description={`Dist: ${candidate.distance_km || '?'}km | Depth: ${candidate.depth_m || '?'}m`}
                pinColor={isSelected ? colors.statusCaution : colors.accentNavy}
                onPress={() => setSelectedCandidate(candidate)}
              />
            );
          })}

          {/* Draw a line from origin to selected candidate if origin exists */}
          {data.origin && selectedCandidate && (
            <Polyline
              coordinates={[
                { latitude: data.origin.latitude, longitude: data.origin.longitude },
                { latitude: selectedCandidate.latitude, longitude: selectedCandidate.longitude }
              ]}
              strokeColor={colors.accentBlue}
              strokeWidth={2}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Selected Candidate Metadata */}
      {selectedCandidate && (
        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataTitle}>
              {data.candidates.length > 1 && selectedCandidate.rank
                ? `Option #${selectedCandidate.rank}`
                : 'Nearest PFZ'}
            </Text>
            {selectedCandidate.source && (
              <Text style={styles.sourceBadge}>{selectedCandidate.source}</Text>
            )}
          </View>
          <Text style={styles.metadataDetails}>
            {selectedCandidate.distance_km ? `${selectedCandidate.distance_km.toFixed(1)} km` : ''}
            {selectedCandidate.bearing ? ` • ${selectedCandidate.bearing}` : ''}
            {selectedCandidate.depth_m ? ` • Depth: ${selectedCandidate.depth_m}m` : ''}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleOpenGoogleMaps}>
        <Text style={styles.actionButtonText}>Open in Google Maps</Text>
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
    ...StyleSheet.absoluteFill,
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
