// Feature: dashboard-and-profile, Property 11: Theme application is immediate and correct

import * as fc from 'fast-check';
import { applyTheme, getAppliedTheme, getDefaultTheme, type Theme } from '@/lib/theme-utils';

/**
 * Property 11: Theme application is immediate and correct
 *
 * For any Theme value, applyTheme(theme) followed immediately by
 * getAppliedTheme() SHALL return the same value.
 *
 * Validates: Requirements 7.4
 */
describe('theme-utils', () => {
  beforeEach(() => {
    // Reset the data-theme attribute before each test so tests are isolated
    document.documentElement.removeAttribute('data-theme');
  });

  it('Property 11: applyTheme followed by getAppliedTheme returns the same theme value', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Theme>('light', 'dark'),
        (theme) => {
          applyTheme(theme);
          const applied = getAppliedTheme();
          return applied === theme;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getAppliedTheme returns "light" when data-theme attribute is absent', () => {
    document.documentElement.removeAttribute('data-theme');
    expect(getAppliedTheme()).toBe('light');
  });

  it('getAppliedTheme returns "light" when data-theme is set to an unrecognised value', () => {
    document.documentElement.setAttribute('data-theme', 'solarized');
    expect(getAppliedTheme()).toBe('light');
  });

  it('getDefaultTheme returns "light"', () => {
    expect(getDefaultTheme()).toBe('light');
  });
});
