import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unavailable';
  detail?: string;
  checkedAt: string; // ISO 8601
}

export interface HealthServiceConfig {
  timeoutMs: number; // default 10_000
}

/**
 * Formats a remaining-milliseconds value into a human-readable expiry string.
 * Exported as a pure helper so it can be tested independently.
 */
export function formatExpiryDetail(remainingMs: number): string {
  const remainingMin = Math.floor(remainingMs / 60_000);
  return `Expires in ${remainingMin} min`;
}

/**
 * Checks whether the current Amplify auth session is active.
 * Returns the session expiry in a human-readable format on success.
 */
export async function checkAuthSession(): Promise<HealthCheckResult> {
  const checkedAt = new Date().toISOString();
  try {
    const session = await fetchAuthSession();
    const tokens = session.tokens;
    if (!tokens) {
      return { name: 'Auth Session', status: 'unavailable', checkedAt };
    }
    const accessToken = tokens.accessToken;
    const expiry = accessToken?.payload?.exp;
    if (typeof expiry === 'number') {
      const remainingMs = expiry * 1000 - Date.now();
      const detail = formatExpiryDetail(Math.max(0, remainingMs));
      return { name: 'Auth Session', status: 'healthy', detail, checkedAt };
    }
    return { name: 'Auth Session', status: 'healthy', checkedAt };
  } catch {
    return { name: 'Auth Session', status: 'unavailable', checkedAt };
  }
}

/**
 * Checks whether the Amplify API (AppSync) is reachable by performing a
 * lightweight list query on the UserProfile model.
 */
export async function checkAmplifyApi(): Promise<HealthCheckResult> {
  const checkedAt = new Date().toISOString();
  try {
    const client = generateClient<Schema>();
    await client.models.UserProfile.list({ limit: 1 });
    return { name: 'Amplify API', status: 'healthy', checkedAt };
  } catch {
    return { name: 'Amplify API', status: 'unavailable', checkedAt };
  }
}

/**
 * Checks whether the Amplify Data layer (DynamoDB via AppSync) is reachable
 * by performing a lightweight list query on the UserProfile model.
 */
export async function checkDataLayer(): Promise<HealthCheckResult> {
  const checkedAt = new Date().toISOString();
  try {
    const client = generateClient<Schema>();
    await client.models.UserProfile.list({ limit: 1 });
    return { name: 'Data Layer', status: 'healthy', checkedAt };
  } catch {
    return { name: 'Data Layer', status: 'unavailable', checkedAt };
  }
}

/**
 * Runs all three health checks concurrently. Each check is wrapped in a
 * Promise.race against a timeout so that slow or hanging checks resolve as
 * 'unavailable' after `config.timeoutMs` (default 10 000 ms).
 */
export async function runHealthChecks(
  config?: HealthServiceConfig
): Promise<HealthCheckResult[]> {
  const timeoutMs = config?.timeoutMs ?? 10_000;

  const withTimeout = (
    checkFn: () => Promise<HealthCheckResult>,
    name: string
  ): Promise<HealthCheckResult> => {
    const timeoutPromise = new Promise<HealthCheckResult>((resolve) => {
      setTimeout(() => {
        resolve({ name, status: 'unavailable', checkedAt: new Date().toISOString() });
      }, timeoutMs);
    });
    return Promise.race([checkFn(), timeoutPromise]);
  };

  const results = await Promise.allSettled([
    withTimeout(checkAuthSession, 'Auth Session'),
    withTimeout(checkAmplifyApi, 'Amplify API'),
    withTimeout(checkDataLayer, 'Data Layer'),
  ]);

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Promise.allSettled should not reject since withTimeout never rejects,
    // but handle it defensively.
    return {
      name: 'Unknown',
      status: 'unavailable' as const,
      checkedAt: new Date().toISOString(),
    };
  });
}
