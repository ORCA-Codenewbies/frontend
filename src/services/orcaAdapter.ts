import { OrcaResponse, StatusLevel, EvidenceItem, MapData, LocationMapData, MapCandidate } from '../types/orca';
import { BackendOrcaResponse } from '../types/backend';

export function adaptBackendOrcaResponse(
  backendResponse: BackendOrcaResponse,
  currentLocationName: string
): OrcaResponse {
  const action = backendResponse.action;
  if (action === 'GIVE_UP' || action === 'CLARIFY') {
    return {
      id: `resp-${Date.now()}`,
      timestamp: Date.now(),
      status: 'CAUTION',
      isError: true,
      errorType: 'location_needed',
      errorMessage: backendResponse.response || 'Location clarification needed',
      context: { location: currentLocationName },
      message: backendResponse.response || 'Could you please specify your location?',
      explanation: 'ORCA requires more specific location information.',
      evidence: [],
      followUps: [],
    };
  }

  let status: StatusLevel = 'CAUTION';
  const decision = backendResponse.execution?.recommendation?.decision?.toUpperCase();

  if (decision === 'SAFE' || decision === 'RECOMMEND') {
    status = 'SAFE';
  } else if (decision === 'CAUTION' || decision === 'EXERCISE_CAUTION') {
    status = 'CAUTION';
  } else if (decision === 'RESTRICTED' || decision === 'DANGER' || decision === 'CANCEL_VOYAGE') {
    status = 'DANGER';
  }

  const riskLevel = backendResponse.execution?.context?.risk?.data?.risk_level;
  const safetyClearance = backendResponse.execution?.context?.safety_rules?.data?.safety_clearance;

  if (status === 'SAFE') {
    if (riskLevel === 'UNKNOWN' || safetyClearance === 'UNKNOWN' || !riskLevel || !safetyClearance) {
      status = 'CAUTION';
    }
    if (riskLevel === 'DANGER' || safetyClearance === 'RESTRICTED') {
      status = 'DANGER';
    }
  }

  let contextTime = 'Current';
  const freshness = backendResponse.data_freshness;
  if (freshness) {
    if (freshness.status === 'stale') contextTime = 'Stale Data';
    else if (freshness.status === 'expired') contextTime = 'Expired Data';
    else if (freshness.status === 'fresh') contextTime = 'Live';
    else if (freshness.status === 'unknown') contextTime = 'Unknown Freshness';
  }

  const recommendationData = backendResponse.execution?.recommendation as any;
  let explanation = recommendationData?.reasoning || recommendationData?.reason || '';
  if (!explanation) {
    explanation = status === 'SAFE'
      ? 'Conditions have been verified as safe.'
      : 'Complete verification is currently unavailable.';
  }

  const evidence: EvidenceItem[] = [];
  const context = backendResponse.execution?.context || {};

  if (context.weather && context.weather.status === 'success' && context.weather.data) {
    const weatherReading = context.weather.data.provider_data?.weather;
    const windSpeedMs = weatherReading?.wind_speed_ms;
    if (windSpeedMs !== undefined) {
      evidence.push({
        id: 'ev-weather-wind',
        label: 'Wind Speed',
        value: `${windSpeedMs} m/s`,
        severity: windSpeedMs > 17 ? 'danger' : (windSpeedMs > 10.8 ? 'caution' : 'normal'),
      });
    }
    const mlRiskLevel = context.weather.data.orca_xgboost?.risk_level;
    if (mlRiskLevel) {
      evidence.push({
        id: 'ev-weather-risk',
        label: 'Weather Risk',
        value: mlRiskLevel,
        severity: mlRiskLevel === 'DANGEROUS' ? 'danger' : mlRiskLevel === 'CAUTION' ? 'caution' : 'normal',
      });
    }
  }

  if (context.ocean && context.ocean.status === 'success' && context.ocean.data) {
    const oceanState = context.ocean.data.incois_ocean_state;
    const waveHeight = oceanState?.wave_height;
    if (waveHeight !== undefined) {
      evidence.push({
        id: 'ev-ocean-wave',
        label: 'Wave Height',
        value: `${waveHeight} m`,
        severity: waveHeight > 2 ? 'danger' : (waveHeight > 1 ? 'caution' : 'normal'),
      });
    }
    if (oceanState?.sst !== undefined) {
      evidence.push({
        id: 'ev-ocean-sst',
        label: 'Sea Surface Temp',
        value: `${oceanState.sst}°C`,
        severity: 'normal',
      });
    }
  }

  let extractedLocation: string | undefined = undefined;
  if (backendResponse.plan) {
    extractedLocation = backendResponse.plan.target_location?.name || backendResponse.plan.reference_location?.name;
  }
  if (!extractedLocation && backendResponse.extraction?.locations && Array.isArray(backendResponse.extraction.locations)) {
    const targetLoc = backendResponse.extraction.locations.find((l: any) => l.role === 'TARGET' || l.role === 'REFERENCE');
    if (targetLoc) extractedLocation = targetLoc.text;
  }
  if (!extractedLocation) {
    extractedLocation = backendResponse.extraction?.target_location || backendResponse.extraction?.reference_location;
  }
  const resolvedLocation = extractedLocation || backendResponse.execution?.context?.geospatial?.data?.zone_name || currentLocationName;

  if (context.risk && context.risk.status === 'success' && context.risk.data) {
    const rData = context.risk.data;
    if (rData.risk_level) {
      evidence.push({
        id: 'ev-risk-level',
        label: 'Overall Risk',
        value: rData.risk_level,
        severity: rData.risk_level === 'HIGH' || rData.risk_level === 'CRITICAL' || rData.risk_level === 'DANGER' ? 'danger' : (rData.risk_level === 'MEDIUM' || rData.risk_level === 'UNKNOWN' ? 'caution' : 'normal'),
      });
    }
  }

  let map: MapData | null = null;
  if (context.geospatial && context.geospatial.status === 'success' && context.geospatial.data) {
    const gData = context.geospatial.data;
    if (gData.latitude !== undefined && gData.longitude !== undefined) {
      map = {
        title: gData.zone_name || resolvedLocation,
        userLocation: { name: currentLocationName, lat: 0, lng: 0 },
        targetZone: {
          name: gData.zone_name || resolvedLocation,
          lat: gData.latitude,
          lng: gData.longitude,
          type: gData.zone_type === 'PFZ' ? 'PFZ' : 'CAUTION_ZONE',
        },
        distanceKm: gData.distance_km || 0,
        direction: gData.direction || 'Unknown',
        bearingDegrees: gData.bearing_deg || 0,
      };
    }
  }

  let locationMap: LocationMapData | null = null;
  const recommendation = backendResponse.execution?.recommendation as any;
  if (recommendation) {
    const candidates: MapCandidate[] = [];

    // Case A: nearest PFZ
    if (recommendation.candidate && typeof recommendation.candidate.latitude === 'number') {
      candidates.push(recommendation.candidate as MapCandidate);
    }

    // Case B: ranked candidates
    if (Array.isArray(recommendation.ranked_candidate_spots)) {
      recommendation.ranked_candidate_spots.forEach((c: any, index: number) => {
        if (typeof c.latitude === 'number') {
          candidates.push({
            ...c,
            rank: index + 1
          } as MapCandidate);
        }
      });
    }

    if (candidates.length > 0) {
      const planLoc = backendResponse.plan?.location as any;
      locationMap = {
        candidates,
        origin: planLoc && typeof planLoc.latitude === 'number' ? planLoc : undefined
      };
    }
  }

  // Safely extract agents called from multiple possible backend locations
  const agentsCalled = (backendResponse as any).agents_called ||
    (backendResponse as any).agent_execution?.agents_called ||
    (backendResponse.execution as any)?.agents_called ||
    [];

  return {
    id: `resp-${Date.now()}`,
    timestamp: Date.now(),
    status: status,
    context: {
      location: resolvedLocation,
      time: contextTime,
    },
    message: backendResponse.response || 'ORCA Analysis Complete',
    explanation: explanation,
    evidence: evidence,
    recommendation: undefined,
    map: map,
    locationMap: locationMap,
    followUps: [],
    officialWarnings: backendResponse.execution?.context?.marine_safety?.data?.imd_warnings || [],
    analyticsData: {
      plan: backendResponse.plan,
      extraction: backendResponse.extraction,
      execution: backendResponse.execution,
      routeTimings: backendResponse.route_timings,
      totalLatencyMs: backendResponse.total_latency_ms,
      dataFreshness: backendResponse.data_freshness,
      segments: backendResponse.segments || [],
      agentsCalled: agentsCalled,
    }
  };
}