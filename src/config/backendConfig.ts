/**
 * Backend API Configuration
 */

// Ambient declaration for React Native runtime environment
declare const process: { env?: Record<string, string | undefined> } | undefined;

// SIH Demo: Use teammate's ngrok backend.
// Override with BACKEND_URL env var if needed for local development.
export const BACKEND_URL: string =
  (typeof process !== 'undefined' && process?.env?.BACKEND_URL) ||
  'https://mckenna-appeasable-dayna.ngrok-free.dev';
