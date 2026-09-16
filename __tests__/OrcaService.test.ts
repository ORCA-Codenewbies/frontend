import { OrcaService } from '../src/services/orcaService';
import { supabase } from '../src/services/supabaseClient';

// Mock Supabase
jest.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock fetch
globalThis.fetch = jest.fn();

describe('OrcaService Real Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles successful API request', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Mock backend response', action: 'Respond' }),
    });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.message).toBe('Mock backend response');
    expect(res.isError).toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/orca/query'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_token',
        },
        body: JSON.stringify({ query: 'hello', session_id: null }),
      })
    );
  });

  it('returns auth_error if no session', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorType).toBe('technical_failure');
    expect(res.errorMessage).toContain('Authentication failed');
  });

  it('handles 401 Unauthorized', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Not authorized to access ORCA.');
  });

  it('handles 403 Forbidden', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Not authorized to access ORCA.');
  });

  it('handles 429 Too Many Requests', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429 });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Too many requests. Please try again later.');
  });

  it('handles 500 Server Error', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('ORCA backend is experiencing issues.');
  });

  it('handles network error', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Failed to connect to ORCA backend.');
  });

  it('handles timeout error', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    (globalThis.fetch as jest.Mock).mockRejectedValue(abortError);

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Request to ORCA timed out.');
  });

  it('handles malformed JSON', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'valid_token' } },
      error: null,
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => { throw new SyntaxError('Malformed JSON'); },
    });

    const res = await OrcaService.queryOrca('hello', 'Digha');
    expect(res.isError).toBe(true);
    expect(res.errorMessage).toBe('Failed to connect to ORCA backend.');
  });
});
