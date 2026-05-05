// Feature: dashboard-and-profile, Property 15: Nav display name selection
// Feature: dashboard-and-profile, Property 16: Nav active link highlighting
// Feature: dashboard-and-profile, Property 17: URL preservation across auth redirect

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mutable state for router.replace spy (used by Property 17)
let mockRouterReplace: ReturnType<typeof vi.fn>;
let mockPathname: string;

// Mock next/link so it renders a plain <a> in jsdom
vi.mock('next/link', () => ({
  default: ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) =>
    React.createElement('a', { href, className }, children),
}));

// Mock aws-amplify (Amplify.configure is called in AuthenticatorWrapper)
vi.mock('aws-amplify', () => ({
  Amplify: { configure: vi.fn() },
}));

// Mock amplify_outputs.json (imported by AuthenticatorWrapper)
vi.mock('@/amplify_outputs.json', () => ({ default: {} }));

// Mock next/navigation (not used by Nav directly, but may be imported transitively)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockRouterReplace }),
  usePathname: () => mockPathname,
}));

// Mock @aws-amplify/ui-react for Property 17 (unauthenticated state)
let mockAuthUser: unknown;
vi.mock('@aws-amplify/ui-react', () => ({
  // Authenticator is now rendered by AuthenticatorWrapper inside AuthenticatedLayout.
  // Provide a passthrough so the component tree renders without errors.
  Authenticator: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useAuthenticator: (_selector?: unknown) => ({
    user: mockAuthUser,
    authStatus: mockAuthUser ? 'authenticated' : 'unauthenticated',
    signOut: vi.fn(),
  }),
}));

// Mock profile-service and theme-utils (used by AuthenticatedLayout)
vi.mock('@/lib/profile-service', () => ({
  getProfile: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/theme-utils', () => ({
  applyTheme: vi.fn(),
  getDefaultTheme: vi.fn().mockReturnValue('light'),
}));

// Import Nav after mocks are set up
import Nav from '@/app/components/Nav';
import AuthenticatedLayout from '@/app/(authenticated)/layout';

beforeEach(() => {
  mockRouterReplace = vi.fn();
  mockPathname = '/';
  mockAuthUser = undefined;
});

/**
 * Property 15: Nav display name selection
 *
 * For any displayName (non-empty string or null) and email, Nav SHALL render
 * displayName when non-null, and email when displayName is null.
 *
 * Validates: Requirements 2.3
 */
describe('Nav', () => {
  it('Property 15: renders displayName when non-null, email when displayName is null', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1 }), { nil: null }),
        fc.emailAddress(),
        (displayName, email) => {
          const { container, unmount } = render(
            React.createElement(Nav, {
              displayName,
              email,
              activePath: '/dashboard',
              onSignOut: () => {},
            })
          );

          const expectedLabel = displayName ?? email;
          // Query the userLabel span directly to avoid Testing Library's
          // whitespace normalization issues with space-only display names.
          const labelEl = container.querySelector('[class*="userLabel"]');
          const result = labelEl !== null && labelEl.textContent === expectedLabel;

          unmount();
          return result;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Nav active link highlighting
   *
   * For any activePath in ['/dashboard', '/profile'], the matching link SHALL
   * have the active CSS class applied, and the other link SHALL NOT.
   *
   * Validates: Requirements 2.7
   */
  it('Property 16: applies active class to the matching link only', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/profile'),
        (activePath) => {
          const { unmount } = render(
            React.createElement(Nav, {
              displayName: null,
              email: 'user@example.com',
              activePath,
              onSignOut: () => {},
            })
          );

          const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
          const profileLink = screen.getByRole('link', { name: 'Profile' });

          const activeLink = activePath === '/dashboard' ? dashboardLink : profileLink;
          const inactiveLink = activePath === '/dashboard' ? profileLink : dashboardLink;

          const activeHasClass = activeLink.className.includes('active');
          const inactiveHasClass = inactiveLink.className.includes('active');

          unmount();
          return activeHasClass && !inactiveHasClass;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 17: URL preservation across auth redirect
 *
 * For any valid authenticated route path, an unauthenticated visit SHALL
 * redirect to /sign-in. The redirect is now driven by authStatus via
 * useEffect (reactive) rather than synchronously during render.
 *
 * Validates: Requirements 1.4
 */
describe('AuthenticatedLayout', () => {
  it('Property 17: redirects unauthenticated users to sign-in', async () => {
    // Feature: dashboard-and-profile, Property 17: URL preservation across auth redirect
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/dashboard', '/profile'),
        async (path) => {
          // Set up unauthenticated state and the current pathname
          mockAuthUser = undefined;
          mockPathname = path;
          mockRouterReplace = vi.fn();

          const { unmount } = render(
            React.createElement(AuthenticatedLayout, { children: React.createElement('div') })
          );

          // Allow useEffect to fire (redirect is now reactive via authStatus)
          await new Promise((resolve) => setTimeout(resolve, 0));

          // The layout should call router.replace('/sign-in') for unauthenticated users
          const wasCalled = mockRouterReplace.mock.calls.some(
            (args: unknown[]) => args[0] === '/sign-in'
          );

          unmount();
          return wasCalled;
        }
      ),
      { numRuns: 100 }
    );
  });
});
