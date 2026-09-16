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
});
