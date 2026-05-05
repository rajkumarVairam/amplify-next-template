export type Theme = 'light' | 'dark';

/**
 * Applies the given theme by setting the `data-theme` attribute on the
 * `<html>` element. The change is synchronous and takes effect immediately.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Reads the current theme from the `data-theme` attribute on the `<html>`
 * element. Returns `'light'` when the attribute is absent or holds any value
 * other than `'dark'`.
 */
export function getAppliedTheme(): Theme {
  const value = document.documentElement.getAttribute('data-theme');
  return value === 'dark' ? 'dark' : 'light';
}

/**
 * Returns the application default theme, which is `'light'`.
 */
export function getDefaultTheme(): Theme {
  return 'light';
}
