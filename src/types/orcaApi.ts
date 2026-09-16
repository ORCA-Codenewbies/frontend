export interface OrcaLocation {
    latitude: number;
    longitude: number;
    name: string;
}

export interface OrcaPlanConstraint {
    type: string;
    value: string;
}

export interface OrcaResponseSegment {
    id: string;
    text: string;
    agents: string[];
}

export interface OrcaAgentResult {
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
    location?: OrcaLocation | any;
    timestamp?: string;
    data?: Record<string, any>;
    warnings?: string[];
}

export interface OrcaExecution {
    plan_id?: string;
    execution_order?: string[];
    context?: Record<string, any>;
    recommendation?: Record<string, any>;
    agent_timings?: Record<string, number>;
    stage_timings?: Record<string, number>;
    agents_called?: OrcaAgentResult[];
}

export function getMaxRisk(plan?: any): string | null {
    if (!plan?.constraints) return null;
    const constraint = (plan.constraints as OrcaPlanConstraint[]).find(
        c => c.type === 'max_risk'
    );
    return constraint ? constraint.value : null;
}

export function formatDecisionCode(raw?: string | null): string {
    if (!raw) return '';
    return raw
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
