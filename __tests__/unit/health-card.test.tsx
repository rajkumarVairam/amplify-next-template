// Feature: dashboard-and-profile, Property 1: HealthCard status-to-display mapping

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HealthCard from '@/app/components/HealthCard';

type HealthStatus = 'checking' | 'healthy' | 'unavailable';

const STATUS_TEXT: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  unavailable: 'Unavailable',
  checking: 'Checking…',
};

const STATUS_CSS_SUFFIX: Record<HealthStatus, string> = {
  healthy: 'statusHealthy',
  unavailable: 'statusUnavailable',
  checking: 'statusChecking',
};

/**
 * Property 1: HealthCard status-to-display mapping
 *
 * For any HealthStatus value, the rendered HealthCard SHALL display the correct
 * label text and apply the correct indicator CSS class.
 *
 * Validates: Requirements 3.3, 3.4, 3.5
 */
describe('HealthCard', () => {
  it('Property 1: renders correct status text and indicator class for any status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<HealthStatus>('healthy', 'unavailable', 'checking'),
        (status) => {
          const label = 'Test Service';
          const { container, unmount } = render(
            React.createElement(HealthCard, { label, status })
          );

          // Verify the status text is displayed
          const statusText = screen.getByText(STATUS_TEXT[status]);
          const statusTextVisible = statusText !== null;

          // Verify the indicator element has the correct CSS class suffix
          const indicator = container.querySelector('[aria-hidden="true"]');
          const hasCorrectClass =
            indicator !== null &&
            indicator.className.includes(STATUS_CSS_SUFFIX[status]);

          unmount();
          return statusTextVisible && hasCorrectClass;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders the label text', () => {
    const { getByText } = render(
      React.createElement(HealthCard, { label: 'Auth Connectivity', status: 'healthy' })
    );
    expect(getByText('Auth Connectivity')).toBeTruthy();
  });

  it('renders detail text when provided', () => {
    const { getByText } = render(
      React.createElement(HealthCard, {
        label: 'Auth Session',
        status: 'healthy',
        detail: 'Expires in 45 min',
      })
    );
    expect(getByText('Expires in 45 min')).toBeTruthy();
  });

  it('does not render detail element when detail is not provided', () => {
    const { queryByText } = render(
      React.createElement(HealthCard, { label: 'Data Layer', status: 'checking' })
    );
    // No detail paragraph should be present
    expect(queryByText(/Expires/)).toBeNull();
  });
});
