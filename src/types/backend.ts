export interface DataFreshnessMetadata {
  status: 'fresh' | 'stale' | 'expired' | 'unknown' | string;
  data_timestamp?: string | null;
  checked_at: string;
  source?: string | null;
  offline_cacheable: boolean;
  valid_until?: string | null;
}

export interface BackendAgentResult {
  agent: string;
  status: 'success' | 'error' | string;
  location?: any | null;
  timestamp: string;
  data: Record<string, any>;
  confidence: number;
  sources: string[];
  warnings: string[];
}

export interface Recommendation {
  decision: 'SAFE' | 'CAUTION' | 'RESTRICTED' | 'DANGER' | 'UNKNOWN' | 'VERIFICATION_REQUIRED' | string;
  risk_level?: string;
  reasoning?: string;
  facilities?: any[];
  safety_rules?: any[];
}

export interface BackendExecution {
  context: Record<string, BackendAgentResult | any>;
  recommendation?: Recommendation | null;
  stage_timings?: Record<string, number>;
  agent_timings?: Record<string, number>;
}

/** A response segment with backend-provided agent attribution. */
export interface BackendResponseSegment {
  id: string;
  text: string;
  agents: string[];
}

/** An agent that actually executed, as reported by the backend. */
export interface BackendAgentCalled {
  agent: string;
  status: string;
  reason_called?: string;
  inputs_used?: Record<string, any>;
  outputs?: Record<string, any>;
  output_reason?: string;
  sources?: string[];
  confidence?: number | null;
  score_source?: string | null;
  score_reason?: string | null;
  used_by?: any[];
}

/** The agent_execution block from the backend response. */
export interface BackendAgentExecution {
  planned_agents?: string[];
  execution_order?: string[];
  agents_called?: BackendAgentCalled[];
}

export interface BackendOrcaResponse {
  query: string;
  action: string;
  response: string | null;
  segments?: BackendResponseSegment[];
  plan: any | null;
  extraction: any | null;
  execution: BackendExecution | null;
  agent_execution?: BackendAgentExecution | null;
  route_timings: Record<string, number>;
  total_latency_ms: number;
  data_freshness?: DataFreshnessMetadata | null;
}
