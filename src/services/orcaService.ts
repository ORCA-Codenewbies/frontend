import { AnalysisStep, OrcaResponse } from '../types/orca';
import { BackendOrcaResponse } from '../types/backend';
import { supabase } from './supabaseClient';
import { BACKEND_URL } from '../config/backendConfig';
import { adaptBackendOrcaResponse } from './orcaAdapter';

export class OrcaService {
  /**
   * Main query processor that hits the real backend.
   * Uses the authenticated /api/v1/orca/query endpoint with Supabase JWT.
   */
  public static async queryOrca(
    rawQuery: string,
    currentLocationName: string,
    sessionId: string | null,
    onAnalysisStep?: (step: AnalysisStep) => void
  ): Promise<OrcaResponse> {
    if (onAnalysisStep) {
      onAnalysisStep({
        step: 1,
        totalSteps: 1,
        label: 'ORCA is analysing on backend...',
        progressPercent: 50,
      });
    }

    try {
      // 1. Get Supabase session to extract JWT
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session?.access_token) {
        return this.createErrorResponse('auth_error', 'Authentication failed. Please log in again.');
      }

      // 2. Prepare request payload
      const payload = {
        query: rawQuery,
        session_id: sessionId,
        location: currentLocationName,
      };

      // 3. Make HTTP POST request to the authenticated ORCA endpoint
      const endpointUrl = `${BACKEND_URL}/api/v1/orca/query`;
      console.log(`[ORCA API] Endpoint: ${endpointUrl}`);
      console.log(`[ORCA API] Query: ${rawQuery}, Session: ${sessionId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[ORCA API] Response status: ${response.status}`);

      // 4. Handle HTTP errors
      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 403) {
          return this.createErrorResponse('auth_error', 'Not authorized to access ORCA.');
        } else if (status === 429) {
          return this.createErrorResponse('rate_limit', 'Too many requests. Please try again later.');
        } else if (status >= 500) {
          return this.createErrorResponse('server_error', 'ORCA backend is experiencing issues.');
        } else {
          return this.createErrorResponse('technical_failure', `Backend returned status ${status}`);
        }
      }

      // 5. Parse JSON
      const json = await response.json() as BackendOrcaResponse;
      console.log('[ORCA API] Response received');

      // 6. Return mapped response using adapter
      return adaptBackendOrcaResponse(json, currentLocationName);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return this.createErrorResponse('timeout', 'Request to ORCA timed out.');
      }
      console.error('[ORCA API] Network error:', error.message);
      return this.createErrorResponse('network_error', 'Failed to connect to ORCA backend.');
    }
  }

  private static createErrorResponse(type: string, message: string): OrcaResponse {
    return {
      id: `err-${Date.now()}`,
      timestamp: Date.now(),
      status: 'CAUTION',
      isError: true,
      errorType: 'technical_failure',
      errorMessage: message,
      context: { location: 'Unknown' },
      message: message,
      explanation: 'ORCA system error.',
      evidence: [],
      recommendation: 'Please try again later.',
      map: null,
      followUps: ['Try Again ↻'],
    };
  }
}
