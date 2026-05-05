// Feature: dashboard-and-profile, Property 2: Health check timeout enforcement
// Feature: dashboard-and-profile, Property 3: ISO 8601 timestamp formatting
// Feature: dashboard-and-profile, Property 4: Session expiry human-readable formatting

import * as fc from 'fast-check';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  runHealthChecks,
  checkAuthSession,
  checkAmplifyApi,
  checkDataLayer,
  formatExpiryDetail,
  type HealthCheckResult,
} from '@/lib/health-service';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
}));

vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(),
}));

import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

const mockFetchAuthSession = vi.mocked(fetchAuthSession);
const mockGenerateClient = vi.mocked(generateClient);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a mock Amplify Data client whose list() resolves immediately. */
function makeHealthyDataClient() {
  return {
    models: {
      UserProfile: {
        list: vi.fn().mockResolvedValue({ data: [], errors: null }),
      },
    },
  };
}

/** Returns a mock Amplify Data client whose list() rejects. */
function makeUnhealthyDataClient() {
  return {
    models: {
      UserProfile: {
        list: vi.fn().mockRejectedValue(new Error('Network error')),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Property 2: Health check timeout enforcement
// Validates: Requirements 3.8
// ---------------------------------------------------------------------------

describe('Property 2: Health check timeout enforcement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it(
    'resolves timed-out checks as unavailable for any timeoutMs in [1, 500]',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 500 }),
          async (timeoutMs) => {
            // Mock the Amplify dependencies so that each individual check
            // hangs indefinitely (resolves only after timeoutMs * 2, well
            // beyond the cutoff enforced by runHealthChecks).
            mockFetchAuthSession.mockImplementation(
              () =>
                new Promise<never>((resolve) => {
                  // Delayed resolve — will not fire before the timeout races it.
                  setTimeout(() => {
                    (resolve as unknown as (v: HealthCheckResult) => void)({
                      name: 'Auth Session',
                      status: 'healthy',
                      checkedAt: new Date().toISOString(),
                    });
                  }, timeoutMs * 2);
                }) as unknown as ReturnType<typeof fetchAuthSession>
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mockGenerateClient as any).mockReturnValue({
              models: {
                UserProfile: {
                  list: () =>
                    new Promise<never>((resolve) => {
                      setTimeout(() => {
                        (resolve as unknown as (v: object) => void)({
                          data: [],
                          errors: null,
                        });
                      }, timeoutMs * 2);
                    }),
                },
              },
            });

            const promise = runHealthChecks({ timeoutMs });

            // Advance fake timers past the timeout so the race resolves.
            await vi.advanceTimersByTimeAsync(timeoutMs + 10);

            const results = await promise;

            // Every result must be unavailable because none resolved in time.
            return results.every((r) => r.status === 'unavailable');
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 3: ISO 8601 timestamp formatting
// Validates: Requirements 3.6
// ---------------------------------------------------------------------------

describe('Property 3: ISO 8601 timestamp formatting', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it(
    'checkedAt in checkAuthSession result is parseable by new Date() without NaN',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null), // run 100 times with the same healthy mock
          async () => {
            // Mock a healthy auth session with a future expiry.
            const futureExp = Math.floor(Date.now() / 1000) + 3600;
            mockFetchAuthSession.mockResolvedValueOnce({
              tokens: {
                accessToken: {
                  payload: { exp: futureExp },
                },
              },
            } as unknown as Awaited<ReturnType<typeof fetchAuthSession>>);

            const result = await checkAuthSession();
            const parsed = new Date(result.checkedAt);
            return !isNaN(parsed.getTime());
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    'checkedAt in checkAmplifyApi result is parseable by new Date() without NaN',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mockGenerateClient as any).mockReturnValue(makeHealthyDataClient());
            const result = await checkAmplifyApi();
            const parsed = new Date(result.checkedAt);
            return !isNaN(parsed.getTime());
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    'checkedAt in checkDataLayer result is parseable by new Date() without NaN',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mockGenerateClient as any).mockReturnValue(makeHealthyDataClient());
            const result = await checkDataLayer();
            const parsed = new Date(result.checkedAt);
            return !isNaN(parsed.getTime());
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 4: Session expiry human-readable formatting
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------

describe('Property 4: Session expiry human-readable formatting', () => {
  it(
    'formatExpiryDetail returns "Expires in N min" where N is a non-negative integer for any remainingMs in [0, 1_000_000]',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1_000_000 }),
          (remainingMs) => {
            const detail = formatExpiryDetail(remainingMs);
            // Must match "Expires in N min" where N is a non-negative integer.
            const match = detail.match(/^Expires in (\d+) min$/);
            if (!match) return false;
            const n = parseInt(match[1], 10);
            return n >= 0;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
