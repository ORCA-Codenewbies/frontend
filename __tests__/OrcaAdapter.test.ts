import { adaptBackendOrcaResponse } from '../src/services/orcaAdapter';
import { BackendOrcaResponse } from '../src/types/backend';

describe('OrcaAdapter', () => {
  const baseResponse: BackendOrcaResponse = {
    query: 'test',
    action: 'ORCA_QUERY',
    response: 'Hello',
    plan: null,
    extraction: null,
    execution: {
      context: {},
      recommendation: { decision: 'UNKNOWN' },
    },
    route_timings: {},
    total_latency_ms: 100,
  };

  it('maps Verified SAFE to SAFE', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {
          risk: { data: { risk_level: 'LOW' } } as any,
          safety_rules: { data: { safety_clearance: 'CLEAR' } } as any,
        },
        recommendation: { decision: 'SAFE' },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.status).toBe('SAFE');
  });

  it('maps CAUTION to CAUTION', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {},
        recommendation: { decision: 'CAUTION' },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.status).toBe('CAUTION');
  });

  it('maps DANGER to DANGER', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {},
        recommendation: { decision: 'DANGER' },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.status).toBe('DANGER');
  });

  it('maps RESTRICTED to DANGER', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {},
        recommendation: { decision: 'RESTRICTED' },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.status).toBe('DANGER');
  });

  it('maps UNKNOWN and VERIFICATION_REQUIRED to CAUTION (never SAFE)', () => {
    let res = adaptBackendOrcaResponse(
      { ...baseResponse, execution: { context: {}, recommendation: { decision: 'UNKNOWN' } } },
      'Digha'
    );
    expect(res.status).toBe('CAUTION');

    res = adaptBackendOrcaResponse(
      { ...baseResponse, execution: { context: {}, recommendation: { decision: 'VERIFICATION_REQUIRED' } } },
      'Digha'
    );
    expect(res.status).toBe('CAUTION');
  });

  it('maps missing recommendation to CAUTION', () => {
    const res = adaptBackendOrcaResponse(
      { ...baseResponse, execution: { context: {}, recommendation: null } },
      'Digha'
    );
    expect(res.status).toBe('CAUTION');
  });

  it('maps missing weather evidence without fabrication', () => {
    const res = adaptBackendOrcaResponse(baseResponse, 'Digha');
    const weatherEv = res.evidence.find((e: any) => e.label === 'Wind Speed');
    expect(weatherEv).toBeUndefined();
  });

  it('maps missing ocean evidence without fabrication', () => {
    const res = adaptBackendOrcaResponse(baseResponse, 'Digha');
    const oceanEv = res.evidence.find((e: any) => e.label === 'Wave Height');
    expect(oceanEv).toBeUndefined();
  });

  it('maps agent error without creating fake evidence', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {
          weather: {
            agent: 'weather',
            status: 'error',
            timestamp: '',
            data: {},
            confidence: 0,
            sources: [],
            warnings: [],
          },
        },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.evidence.length).toBe(0);
  });

  it('maps missing geospatial data to null map', () => {
    const res = adaptBackendOrcaResponse(baseResponse, 'Digha');
    expect(res.map).toBeNull();
  });

  it('maps populated geospatial data to MapData', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      execution: {
        context: {
          geospatial: {
            agent: 'geospatial',
            status: 'success',
            timestamp: '',
            confidence: 1,
            sources: [],
            warnings: [],
            data: {
              latitude: 21.6,
              longitude: 87.5,
              zone_name: 'Digha Offshore',
              distance_km: 15,
            },
          },
        },
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.map).toBeDefined();
    expect(res.map?.targetZone.lat).toBe(21.6);
    expect(res.map?.distanceKm).toBe(15);
  });

  it('maps CLARIFY to location_needed error', () => {
    const backend: BackendOrcaResponse = { ...baseResponse, action: 'CLARIFY', response: 'Where?' };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorType).toBe('location_needed');
    expect(res.message).toBe('Where?');
  });

  it('maps GIVE_UP to location_needed error', () => {
    const backend: BackendOrcaResponse = { ...baseResponse, action: 'GIVE_UP', response: 'I give up.' };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorType).toBe('location_needed');
    expect(res.message).toBe('I give up.');
  });

  it('maps stale freshness metadata', () => {
    const backend: BackendOrcaResponse = {
      ...baseResponse,
      data_freshness: {
        status: 'stale',
        checked_at: 'now',
        offline_cacheable: true,
      },
    };
    const res = adaptBackendOrcaResponse(backend, 'Digha');
    expect(res.context.time).toBe('Stale Data');
  });

  describe('Focused Regression Tests', () => {
    it('maps CANDIDATE_SEARCH_COMPLETE + risk_level SAFE to status SAFE', () => {
      const backend: BackendOrcaResponse = {
        ...baseResponse,
        execution: {
          context: {},
          recommendation: {
            decision: 'CANDIDATE_SEARCH_COMPLETE',
            risk_level: 'SAFE',
            action_code: 'CANDIDATE_SEARCH_COMPLETE',
            action_title: 'FISHING CANDIDATE SEARCH RESULTS',
            recommendation_text: 'Geospatial candidate search complete. Ranked 3 safe reachability paths from origin.',
          } as any,
        },
      };
      const res = adaptBackendOrcaResponse(backend, 'Kochi');
      expect(res.status).toBe('SAFE');
    });

    it('preserves recommendation_text into response.recommendation for CANDIDATE_SEARCH_COMPLETE', () => {
      const recText = 'Geospatial candidate search complete. Ranked 3 safe reachability paths from origin.';
      const backend: BackendOrcaResponse = {
        ...baseResponse,
        execution: {
          context: {},
          recommendation: {
            decision: 'CANDIDATE_SEARCH_COMPLETE',
            risk_level: 'SAFE',
            recommendation_text: recText,
          } as any,
        },
      };
      const res = adaptBackendOrcaResponse(backend, 'Kochi');
      expect(res.recommendation).toBe(recText);
    });

    it('maps ranked_candidate_spots query_distance_km to distance_km and bearing_from_landmark to bearing', () => {
      const backend: BackendOrcaResponse = {
        ...baseResponse,
        plan: { location: { latitude: 9.9312, longitude: 76.2673, name: 'Kochi' } } as any,
        execution: {
          context: {},
          recommendation: {
            decision: 'CANDIDATE_SEARCH_COMPLETE',
            risk_level: 'SAFE',
            ranked_candidate_spots: [
              {
                candidate_id: 'cand_1',
                latitude: 9.5265,
                longitude: 76.2673,
                query_distance_km: 45.0,
                bearing_from_landmark: 'W',
                display_name: '8.5 km W of Alappuzha',
                rank: 1,
              },
            ],
          } as any,
        },
      };
      const res = adaptBackendOrcaResponse(backend, 'Kochi');
      expect(res.locationMap).toBeDefined();
      expect(res.locationMap?.candidates.length).toBe(1);
      const cand = res.locationMap?.candidates[0] as any;
      expect(cand.distance_km).toBe(45.0);
      expect(cand.bearing).toBe('W');
      expect(cand.display_name).toBe('8.5 km W of Alappuzha');
      expect(cand.latitude).toBe(9.5265);
      expect(cand.longitude).toBe(76.2673);
    });

    it('handles safe_route / ROUTE_GENERATED correctly', () => {
      const backend: BackendOrcaResponse = {
        ...baseResponse,
        execution: {
          context: {},
          recommendation: {
            decision: 'ROUTE_GENERATED',
            risk_level: 'SAFE',
            recommendation_text: 'Successfully generated a safe route avoiding land and geofences.',
          } as any,
        },
      };
      const res = adaptBackendOrcaResponse(backend, 'Kochi');
      expect(res.status).toBe('SAFE');
      expect(res.recommendation).toBe('Successfully generated a safe route avoiding land and geofences.');
    });

    it('handles hazardous_zone_filter / SAFE_ALTERNATIVE_ZONE correctly', () => {
      const backendSafe: BackendOrcaResponse = {
        ...baseResponse,
        execution: {
          context: {},
          recommendation: {
            decision: 'SAFE_ALTERNATIVE_ZONE',
            risk_level: 'SAFE',
            recommendation_text: 'No specific hazardous zones identified.',
          } as any,
        },
      };
      const resSafe = adaptBackendOrcaResponse(backendSafe, 'Digha');
      expect(resSafe.status).toBe('SAFE');
      expect(resSafe.recommendation).toBe('No specific hazardous zones identified.');

      const backendCaution: BackendOrcaResponse = {
        ...baseResponse,
        execution: {
          context: {},
          recommendation: {
            decision: 'SAFE_ALTERNATIVE_ZONE',
            risk_level: 'CAUTION',
            recommendation_text: 'Found 2 hazardous or restricted zones in the evaluated area.',
          } as any,
        },
      };
      const resCaution = adaptBackendOrcaResponse(backendCaution, 'Digha');
      expect(resCaution.status).toBe('CAUTION');
    });

    it('handles nearest_pfz with candidate mapping and recommendation', () => {
      const backend: BackendOrcaResponse = {
        ...baseResponse,
        plan: { location: { latitude: 21.6, longitude: 87.5, name: 'Digha' } } as any,
        execution: {
          context: {},
          recommendation: {
            decision: 'RECOMMEND',
            risk_level: 'SAFE',
            recommendation_text: 'High Potential Fishing Zone identified under safe weather conditions.',
            candidate: {
              latitude: 21.4,
              longitude: 87.8,
              distance_from_landmark_km: 25.0,
              bearing_from_landmark: 'SE',
            },
          } as any,
        },
      };
      const res = adaptBackendOrcaResponse(backend, 'Digha');
      expect(res.status).toBe('SAFE');
      expect(res.recommendation).toBe('High Potential Fishing Zone identified under safe weather conditions.');
      expect(res.locationMap).toBeDefined();
      expect(res.locationMap?.candidates[0].distance_km).toBe(25.0);
      expect(res.locationMap?.candidates[0].bearing).toBe('SE');
    });
  });
});
