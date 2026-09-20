export type StatusLevel = 'SAFE' | 'CAUTION' | 'DANGER' | 'BIPOD';

export interface EvidenceItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  icon?: string;
  severity?: 'normal' | 'caution' | 'danger';
}

export interface MapData {
  title: string;
  userLocation: { name: string; lat: number; lng: number };
  targetZone: { name: string; lat: number; lng: number; type: 'PFZ' | 'CAUTION_ZONE' | 'SHELTER_PORT' };
  distanceKm: number;
  direction: string;
  bearingDegrees: number;
}

export type MapCandidate = {
  latitude: number;
  longitude: number;
  distance_km?: number;
  bearing?: string;
  depth_m?: number;
  source?: string;
  landing_center?: string;
  rank?: number;
};

export type LocationMapData = {
  origin?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  candidates: MapCandidate[];
};

/**
 * Backend response attribution. The backend already returns response segments
 * and the agent names responsible for each segment.
 */
export interface ResponseSegment {
  id: string;
  text: string;
  agents: string[];
}

export interface AnalyticsAgentResult {
  agent: string;
  status: 'SUCCESS' | 'DEGRADED' | 'MOCKED' | 'NOT_AVAILABLE' | 'ERROR' | string;
  reason_called?: string;
  inputs_used?: Record<string, any>;
  outputs?: Record<string, any>;
  output_reason?: string;
  sources?: string[];
  confidence?: number | null;
  score_source?: string | null;
  score_reason?: string | null;
  used_by?: any[];
  location?: any;
  timestamp?: string;
  data?: Record<string, any>;
  warnings?: string[];
}

export interface AnalyticsData {
  plan?: any;
  extraction?: any;
  execution?: any;
  routeTimings?: Record<string, number>;
  totalLatencyMs?: number;
  dataFreshness?: any;

  // New backend provenance fields.
  segments?: ResponseSegment[];
  agentsCalled?: AnalyticsAgentResult[];
  executionOrder?: string[];
}

export interface OrcaResponse {
  id: string;
  timestamp: number;
  status: StatusLevel;
  context: { location: string; time?: string };
  message: string;
  explanation: string;
  evidence: EvidenceItem[];
  recommendation?: string;
  map?: MapData | null;
  locationMap?: LocationMapData | null;
  followUps: string[];
  officialWarnings?: string[];
  isInland?: boolean;
  isError?: boolean;
  errorType?: 'no_data' | 'location_needed' | 'technical_failure';
  errorMessage?: string;
  analyticsData?: AnalyticsData;
}

export interface AnalysisStep {
  step: number;
  totalSteps: number;
  label: string;
  progressPercent?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'orca';
  text?: string;
  timestamp: number;
  response?: OrcaResponse;
  isAnalyzing?: boolean;
  activeAnalysisStep?: AnalysisStep;
}

