// Feature: dashboard-and-profile, Property 18: Dashboard greeting contains user email
// Feature: dashboard-and-profile, Property 12: Notification alert behavior

import * as fc from 'fast-check';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import type { HealthCheckResult } from '@/lib/health-service';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock @aws-amplify/ui-react so we can control the user object in tests.
vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: vi.fn(),
}));

// Mock runHealthChecks so the component never makes real network calls.
vi.mock('@/lib/health-service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/health-service')>();
  return {
    ...actual,
    runHealthChecks: vi.fn(),
  };
});

// Mock next/navigation (used transitively by the authenticated layout).
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}));

import { useAuthenticator } from '@aws-amplify/ui-react';
import { runHealthChecks } from '@/lib/health-service';
import { checkAndNotify } from '@/lib/notification-utils';
import DashboardPage from '@/app/(authenticated)/dashboard/page';

const mockUseAuthenticator = useAuthenticator as ReturnType<typeof vi.fn>;
const mockRunHealthChecks = runHealthChecks as ReturnType<typeof vi.fn>;

/** Helper: build a minimal HealthCheckResult */
function makeResult(
  name: string,
  status: 'healthy' | 'unavailable'
): HealthCheckResult {
  return { name, status, checkedAt: new Date().toISOString() };
}

/** Helper: set up useAuthenticator to return a user with the given email */
function mockUser(email: string) {
  mockUseAuthenticator.mockReturnValue({
    user: {
      userId: 'test-user-id',
      signInDetails: { loginId: email },
    },
  });
}

// ---------------------------------------------------------------------------
// Property 18: Dashboard greeting contains user email
// ---------------------------------------------------------------------------

/**
 * Property 18: Dashboard greeting contains user email
 *
 * For any authenticated user email string, the Dashboard SHALL render a
 * greeting element whose text content contains that email string.
 *
 * Validates: Requirements 3.9
 */
describe('DashboardPage', () => {
  beforeEach(() => {
    // Default: runHealthChecks resolves immediately with empty results so the
    // component doesn't hang.
    mockRunHealthChecks.mockResolvedValue([
      makeResult('Auth Session', 'healthy'),
      makeResult('Amplify API', 'healthy'),
      makeResult('Data Layer', 'healthy'),
    ]);
    // Stub localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 18: greeting contains the authenticated user email for any email', async () => {
    await fc.assert(
      fc.asyncProperty(fc.emailAddress(), async (email) => {
        mockUser(email);

        let container!: HTMLElement;
        await act(async () => {
          const result = render(React.createElement(DashboardPage));
          container = result.container;
        });

        // The greeting h1 should contain the email somewhere in its text.
        const h1 = container.querySelector('h1');
        const containsEmail = h1 !== null && h1.textContent?.includes(email) === true;

        // Clean up between iterations.
        act(() => {
          // unmount by re-rendering nothing into the same root is not
          // straightforward; instead we just check the assertion.
        });

        return containsEmail;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: Notification alert behavior
// ---------------------------------------------------------------------------

/**
 * Property 12: Notification alert behavior
 *
 * When notificationsEnabled is true and a check transitions healthy→unavailable,
 * an alert SHALL fire; when false, no alert SHALL fire.
 *
 * The notification logic is tested as a pure function (checkAndNotify) extracted
 * from the component.
 *
 * Validates: Requirements 8.3, 8.4
 */
describe('checkAndNotify (notification logic)', () => {
  it('Property 12: alerts on healthy→unavailable transitions iff notificationsEnabled', () => {
    fc.assert(
      fc.property(
        // Generate a set of service names (1–3 services)
        fc.array(
          fc.constantFrom('Auth Session', 'Amplify API', 'Data Layer'),
          { minLength: 1, maxLength: 3 }
        ).map((names) => [...new Set(names)]), // deduplicate
        // For each service, generate a previous status and a next status
        fc.array(
          fc.record({
            prev: fc.constantFrom<'healthy' | 'unavailable'>('healthy', 'unavailable'),
            next: fc.constantFrom<'healthy' | 'unavailable'>('healthy', 'unavailable'),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        fc.boolean(), // notificationsEnabled
        (names, transitions, notificationsEnabled) => {
          // Align names and transitions (zip up to the shorter length)
          const len = Math.min(names.length, transitions.length);
          const prevResults: HealthCheckResult[] = [];
          const nextResults: HealthCheckResult[] = [];

          for (let i = 0; i < len; i++) {
            prevResults.push(makeResult(names[i], transitions[i].prev));
            nextResults.push(makeResult(names[i], transitions[i].next));
          }

          const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

          checkAndNotify(prevResults, nextResults, notificationsEnabled);

          const alertCallCount = alertSpy.mock.calls.length;
          alertSpy.mockRestore();

          // Count expected transitions
          const expectedTransitions = prevResults.filter((prev, i) => {
            const next = nextResults[i];
            return prev.status === 'healthy' && next.status === 'unavailable';
          });

          if (notificationsEnabled) {
            // One alert per healthy→unavailable transition
            return alertCallCount === expectedTransitions.length;
          } else {
            // No alerts regardless of transitions
            return alertCallCount === 0;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
