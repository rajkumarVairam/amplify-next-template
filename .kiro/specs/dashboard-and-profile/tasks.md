# Implementation Plan: Dashboard and Profile

## Overview

Implement two authenticated routes (`/dashboard` and `/profile`) on top of the existing Next.js 14 + Amplify Gen 2 project. The work is ordered so the project compiles and runs at every step: backend resources first, then shared infrastructure (CSS, lib utilities, authenticated layout, Nav), then the two pages, then tests.

## Tasks

- [x] 1. Install dependencies and configure test runner
  - Run `npm install --save-dev fast-check` to add the property-based testing library
  - Run `npm install --save-dev jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest` (or confirm Vitest is preferred and install `vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom` instead)
  - Add a `jest.config.ts` (or `vitest.config.ts`) at the project root that resolves the `@/*` path alias and uses `jsdom` as the test environment
  - Add a `test` script to `package.json` (e.g., `"test": "jest --passWithNoTests"` or `"test": "vitest run"`)
  - _Requirements: all (test infrastructure)_

- [x] 2. Extend Amplify backend — data model and storage
  - [x] 2.1 Create `amplify/data/resource.ts` with the `UserProfile` schema
    - Define `UserProfile` model with fields: `displayName` (string, required), `bio` (string), `avatarUrl` (string), `themePreference` (enum `['light','dark']`), `notificationsEnabled` (boolean)
    - Apply `.authorization((allow) => [allow.owner()])` so only the record owner can read/write
    - Export `Schema` type and `data` constant
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_
  - [x] 2.2 Create `amplify/storage/resource.ts` with the avatar S3 bucket
    - Use `defineStorage` with `name: 'avatarStorage'`
    - Grant `allow.entity('identity').to(['read','write','delete'])` on the `avatars/{entity_id}/*` path
    - Export `storage` constant
    - _Requirements: 6.4_
  - [x] 2.3 Update `amplify/backend.ts` to wire in `data` and `storage`
    - Import `data` from `./data/resource.js` and `storage` from `./storage/resource.js`
    - Pass both to `defineBackend({ auth, data, storage })`
    - _Requirements: 9.1, 6.4_

- [x] 3. Add theme CSS custom properties to `app/globals.css`
  - Replace the existing `:root` / `@media (prefers-color-scheme: dark)` block with explicit `[data-theme="light"]` and `[data-theme="dark"]` selectors
  - Define at minimum: `--bg`, `--fg`, `--surface`, `--accent`, `--border`, `--text-muted` for both themes
  - Light values: `--bg: #ffffff`, `--fg: #0a0a0a`, `--surface: #f5f5f5`, `--accent: #6649ae`
  - Dark values: `--bg: #0a0a0a`, `--fg: #ededed`, `--surface: #1a1a1a`, `--accent: #cbbeff`
  - Keep the existing reset rules (`box-sizing`, `overflow-x`, etc.)
  - _Requirements: 7.3, 7.4, 7.5_

- [x] 4. Implement `lib/theme-utils.ts`
  - Export `type Theme = 'light' | 'dark'`
  - Implement `applyTheme(theme: Theme): void` — sets `document.documentElement.setAttribute('data-theme', theme)`
  - Implement `getAppliedTheme(): Theme` — reads `data-theme` from `document.documentElement`; returns `'light'` if absent
  - Implement `getDefaultTheme(): Theme` — returns `'light'`
  - _Requirements: 7.3, 7.4, 7.5_
  - [x] 4.1 Write property test for theme-utils (Property 11)
    - **Property 11: Theme application is immediate and correct**
    - For any `Theme` value, `applyTheme(theme)` followed immediately by `getAppliedTheme()` SHALL return the same value
    - Use `fc.constantFrom('light', 'dark')` as the arbitrary
    - Mock `document.documentElement` in jsdom
    - **Validates: Requirements 7.4**

- [x] 5. Implement `lib/health-service.ts`
  - Export `HealthCheckResult` and `HealthServiceConfig` interfaces as defined in the design
  - Implement `checkAuthSession()` — calls `fetchAuthSession()` from `aws-amplify/auth`; returns `{ name: 'Auth Session', status: 'healthy', detail: 'Expires in N min', checkedAt }` on success, `{ status: 'unavailable' }` on error
  - Implement `checkAmplifyApi()` — performs a lightweight Amplify API reachability check; returns healthy/unavailable
  - Implement `checkDataLayer()` — performs a lightweight Amplify Data list query; returns healthy/unavailable
  - Implement `runHealthChecks(config?)` — runs all three checks concurrently via `Promise.allSettled`; wraps each in a `Promise.race` against a `setTimeout(config.timeoutMs ?? 10_000)` that resolves to `{ status: 'unavailable' }`
  - Each check sets `checkedAt` to `new Date().toISOString()`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3_
  - [x] 5.1 Write property test for health check timeout enforcement (Property 2)
    - **Property 2: Health check timeout enforcement**
    - For any check function that does not resolve within `timeoutMs`, `runHealthChecks` SHALL resolve that check as `'unavailable'`
    - Use `fc.integer({ min: 1, max: 500 })` for `timeoutMs` and mock a delayed promise
    - **Validates: Requirements 3.8**
  - [x] 5.2 Write property test for ISO 8601 timestamp formatting (Property 3)
    - **Property 3: ISO 8601 timestamp formatting**
    - For any `Date` object, the `checkedAt` field in `HealthCheckResult` SHALL be parseable by `new Date()` without producing `NaN`
    - Use `fc.date()` as the arbitrary; mock `Date` constructor in the check functions
    - **Validates: Requirements 3.6**
  - [x] 5.3 Write property test for session expiry formatting (Property 4)
    - **Property 4: Session expiry human-readable formatting**
    - For any future expiry timestamp, the formatted string SHALL match `"Expires in N min"` where N is a non-negative integer
    - Use `fc.integer({ min: 0, max: 1_000_000 })` for remaining milliseconds
    - **Validates: Requirements 4.2**

- [x] 6. Implement `lib/profile-service.ts`
  - Export `UserProfile` interface as defined in the design
  - Implement `getProfile(userId: string): Promise<UserProfile | null>` — queries the Amplify Data `UserProfile` model; returns `null` if no record found
  - Implement `saveProfile(profile: UserProfile): Promise<UserProfile>` — uses an upsert pattern: tries to update an existing record first; creates a new one if none exists; throws `ProfileSaveError` on failure
  - Import the generated `Schema` type from `amplify/data/resource` and use the typed Amplify Data client
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [x] 6.1 Write property test for profile upsert — one record per user (Property 13)
    - **Property 13: Profile upsert — one record per user**
    - For any `userId` and N ≥ 1 saves, exactly one profile record SHALL exist with the most recently saved values
    - Use `fc.string()` for `userId` and `fc.integer({ min: 1, max: 10 })` for N; mock the Amplify Data client
    - **Validates: Requirements 9.1, 9.2, 9.3**
  - [x] 6.2 Write property test for profile data round-trip (Property 14)
    - **Property 14: Profile data round-trip**
    - For any valid `UserProfile`, saving then reading back SHALL return equal field values
    - Use `fc.record({ displayName: fc.string({minLength:1,maxLength:64}), bio: fc.string({maxLength:280}), themePreference: fc.constantFrom('light','dark'), notificationsEnabled: fc.boolean() })` as the arbitrary; mock the Amplify Data client
    - **Validates: Requirements 9.4**

- [x] 7. Create the authenticated route group layout `app/(authenticated)/layout.tsx`
  - Create the directory `app/(authenticated)/`
  - Implement `layout.tsx` as a `"use client"` component
  - Use `useAuthenticator` to get the current user; if no user, call `router.replace('/?redirect=' + encodeURIComponent(pathname))` and return `null`
  - On mount, call `getProfile(user.userId)` and `applyTheme(profile?.themePreference ?? getDefaultTheme())`
  - Render `<Nav displayName={profile?.displayName ?? null} email={user.signInDetails.loginId} activePath={pathname} onSignOut={signOut} />` alongside `{children}`
  - Apply a CSS layout class that positions the Nav as a sidebar on ≥768 px and as a top bar on <768 px
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 7.3, 7.5_
  - [x] 7.1 Write property test for URL preservation across auth redirect (Property 17)
    - **Property 17: URL preservation across auth redirect**
    - For any valid authenticated route path, an unauthenticated visit SHALL store the path and redirect to it after sign-in
    - Use `fc.constantFrom('/dashboard', '/profile')` as the arbitrary; mock `useAuthenticator` and `useRouter`
    - **Validates: Requirements 1.4**

- [x] 8. Implement `app/components/Nav.tsx` and `Nav.module.css`
  - Create `app/components/` directory
  - Implement `Nav` as a `"use client"` component accepting `NavProps` (displayName, email, activePath, onSignOut)
  - Render a `<nav>` with links to `/dashboard` and `/profile` using Next.js `<Link>`
  - Display `displayName ?? email` as the user identity label
  - Apply an `active` CSS module class to the link whose `href` matches `activePath`
  - Include a sign-out button that calls `onSignOut`
  - In `Nav.module.css`, use a `@media (min-width: 768px)` breakpoint to switch between sidebar (`position: fixed; left: 0; height: 100vh`) and top bar (`position: sticky; top: 0; width: 100%`) layouts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 10.1, 10.2_
  - [x] 8.1 Write property test for Nav display name selection (Property 15)
    - **Property 15: Nav display name selection**
    - For any `displayName` and `email`, Nav SHALL render `displayName` when it is a non-empty string, and `email` when `displayName` is null
    - Use `fc.option(fc.string({minLength:1}))` for displayName and `fc.emailAddress()` for email
    - **Validates: Requirements 2.3**
  - [x] 8.2 Write property test for Nav active link highlighting (Property 16)
    - **Property 16: Nav active link highlighting**
    - For any `activePath` in `['/dashboard', '/profile']`, the matching link SHALL have the active CSS class and the other SHALL NOT
    - Use `fc.constantFrom('/dashboard', '/profile')` as the arbitrary
    - **Validates: Requirements 2.7**

- [x] 9. Implement `app/components/HealthCard.tsx` and `HealthCard.module.css`
  - Implement `HealthCard` as a functional component accepting `HealthCardProps` (label, status, detail)
  - Render the label, a status text ("Healthy" / "Unavailable" / "Checking…"), and an indicator element
  - Apply CSS module classes `statusHealthy` (green), `statusUnavailable` (red), `statusChecking` (neutral) based on `status`
  - Show `detail` as a secondary line when provided
  - _Requirements: 3.3, 3.4, 3.5_
  - [x] 9.1 Write property test for HealthCard status-to-display mapping (Property 1)
    - **Property 1: HealthCard status-to-display mapping**
    - For any `HealthStatus` value, the rendered component SHALL display the correct label text and apply the correct indicator CSS class
    - Use `fc.constantFrom('healthy', 'unavailable', 'checking')` as the arbitrary; render with `@testing-library/react`
    - **Validates: Requirements 3.3, 3.4, 3.5**

- [x] 10. Implement `app/(authenticated)/dashboard/page.tsx`
  - Create `app/(authenticated)/dashboard/` directory
  - Implement the Dashboard page as a `"use client"` component
  - On mount, call `runHealthChecks()` and store results in state; set `lastRefreshed` to `new Date().toISOString()`
  - Render a greeting: `"Hello, {user.signInDetails.loginId}"`
  - Render one `<HealthCard>` per result from `runHealthChecks` (Auth Session, Amplify API, Data Layer)
  - Display `lastRefreshed` timestamp
  - Render a "Refresh" button that re-invokes `runHealthChecks()` and updates state
  - Arrange cards in a CSS grid: multi-column on ≥768 px, single-column on <768 px
  - If `notificationsEnabled` is true and any card transitions from healthy → unavailable, trigger a browser `alert()` or in-app notification
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.1, 4.2, 4.3, 8.3, 8.4, 10.3_
  - [x] 10.1 Write property test for Dashboard greeting (Property 18)
    - **Property 18: Dashboard greeting contains user email**
    - For any authenticated user email string, the Dashboard SHALL render a greeting whose text content contains that email
    - Use `fc.emailAddress()` as the arbitrary; mock `useAuthenticator` and `runHealthChecks`
    - **Validates: Requirements 3.9**
  - [x] 10.2 Write property test for notification alert behavior (Property 12)
    - **Property 12: Notification alert behavior**
    - When `notificationsEnabled` is true and a check transitions healthy→unavailable, an alert SHALL fire; when false, no alert SHALL fire
    - Use `fc.boolean()` for `notificationsEnabled` and `fc.array(fc.constantFrom('healthy','unavailable'), {minLength:1})` for status sequences
    - **Validates: Requirements 8.3, 8.4**

- [x] 11. Implement `app/components/AvatarUpload.tsx`
  - Implement `AvatarUpload` as a `"use client"` component accepting `{ currentAvatarUrl, userId, onUploadComplete }`
  - Render a file `<input accept="image/jpeg,image/png,image/webp">`
  - On file selection: validate `file.size ≤ 5_242_880`; if invalid, set an error state and return without uploading
  - On valid file: generate a preview URL via `URL.createObjectURL(file)` and display it in an `<img>`
  - On confirm: call `uploadData({ path: \`avatars/\${userId}/\${file.name}\`, data: file })` from `aws-amplify/storage`; on success call `onUploadComplete(storageKey)`
  - Display error messages for size violations and upload failures
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 11.1 Write property test for avatar file size validation (Property 8)
    - **Property 8: Avatar file size validation**
    - For any file with `size > 5_242_880`, the upload SHALL be blocked and an error shown; for any valid file (size ≤ 5 MB, correct MIME type), no size error SHALL appear
    - Use `fc.integer({ min: 5_242_881, max: 20_000_000 })` for oversized and `fc.integer({ min: 1, max: 5_242_880 })` for valid sizes; mock `File`
    - **Validates: Requirements 6.2**
  - [x] 11.2 Write property test for avatar preview URL generation (Property 9)
    - **Property 9: Avatar preview URL generation**
    - For any valid image file, selecting it SHALL produce a non-empty preview URL usable as `<img src>`
    - Use `fc.integer({ min: 1, max: 5_242_880 })` for size and `fc.constantFrom('image/jpeg','image/png','image/webp')` for MIME type; mock `URL.createObjectURL`
    - **Validates: Requirements 6.3**
  - [x] 11.3 Write property test for avatar storage path owner-scoping (Property 10)
    - **Property 10: Avatar storage path owner-scoping**
    - For any `userId` and valid image file, the storage key SHALL contain `userId` as a path segment matching `avatars/{userId}/...`
    - Use `fc.string({minLength:1})` for `userId`; mock `uploadData` and capture the `path` argument
    - **Validates: Requirements 6.4**

- [x] 12. Implement `app/components/ProfileForm.tsx` and `ProfileForm.module.css`
  - Implement `ProfileForm` as a `"use client"` component accepting `ProfileFormProps` (initialValues, onSubmit, isSaving)
  - Render controlled inputs for `displayName` (text, maxLength 64), `bio` (textarea, maxLength 280), `themePreference` (radio or select with "Light"/"Dark"), `notificationsEnabled` (checkbox/toggle)
  - Pre-populate all fields from `initialValues` on mount
  - On submit: validate `displayName` is non-empty, non-whitespace-only, and ≤64 chars; validate `bio` is ≤280 chars; show inline error messages on failure without calling `onSubmit`
  - On valid submit: call `onSubmit(values)` and disable the submit button while `isSaving` is true
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2, 8.1, 8.2, 8.5_
  - [x] 12.1 Write property test for profile form pre-population (Property 5)
    - **Property 5: Profile form pre-population**
    - For any `ProfileFormValues` object, every form field SHALL be rendered with the corresponding value
    - Use `fc.record({ displayName: fc.string({minLength:1,maxLength:64}), bio: fc.string({maxLength:280}), themePreference: fc.constantFrom('light','dark'), notificationsEnabled: fc.boolean() })` as the arbitrary
    - **Validates: Requirements 5.6, 8.5**
  - [x] 12.2 Write property test for profile form validation — invalid inputs rejected (Property 6)
    - **Property 6: Profile form validation — invalid inputs rejected**
    - For any empty/whitespace-only/>64-char displayName or >280-char bio, submit SHALL show a validation error and NOT call `onSubmit`
    - Use `fc.oneof(fc.constant(''), fc.string({minLength:65}), fc.string().map(s => s.replace(/\S/g,' ')))` for invalid displayName; `fc.string({minLength:281})` for invalid bio
    - **Validates: Requirements 5.3, 5.4, 5.5**
  - [x] 12.3 Write property test for profile form submission — valid inputs accepted (Property 7)
    - **Property 7: Profile form submission — valid inputs accepted**
    - For any displayName with 1–64 non-whitespace-only chars and any bio with 0–280 chars, submit SHALL call `onSubmit` with exactly those values
    - Use `fc.string({minLength:1,maxLength:64}).filter(s => s.trim().length > 0)` for displayName and `fc.string({maxLength:280})` for bio
    - **Validates: Requirements 5.2**

- [x] 13. Implement `app/(authenticated)/profile/page.tsx`
  - Create `app/(authenticated)/profile/` directory
  - Implement the Profile page as a `"use client"` component
  - On mount: call `getProfile(user.userId)`; pre-populate `ProfileForm` with loaded values (or defaults if no record)
  - Display the current avatar using `<AvatarUpload currentAvatarUrl={profile?.avatarUrl} userId={user.userId} onUploadComplete={handleAvatarUpload} />`
  - Wire `ProfileForm.onSubmit` to call `saveProfile(...)` then call `applyTheme(values.themePreference)` immediately after a successful save
  - Show a success message on save; show an error message if `saveProfile` throws
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Update `app/page.tsx` to redirect authenticated users
  - Modify the existing `app/page.tsx` so that when `useAuthenticator` returns an authenticated user, it calls `router.replace('/dashboard')` immediately
  - Unauthenticated users continue to see the sign-in UI (the existing `<Authenticator>` wrapper in `AuthenticatorWrapper.tsx` handles rendering)
  - Check for a `?redirect=` query parameter and use that path instead of `/dashboard` when present
  - _Requirements: 1.1, 1.4_

- [x] 15. Checkpoint — compile and smoke-test
  - Run `npm run build` (or `next build`) and confirm zero TypeScript errors and zero build errors
  - Verify the dev server starts and the sign-in page loads at `/`
  - Verify navigating to `/dashboard` while unauthenticated redirects to `/`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Run full test suite and verify all property tests pass
  - Run `npm test` (or `npx vitest run`) and confirm all property-based tests and unit tests pass
  - Fix any failing tests before proceeding
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property (`{ numRuns: 100 }`)
- Each property test file should include a comment referencing the design property number, e.g. `// Feature: dashboard-and-profile, Property 11: Theme application is immediate and correct`
- The Amplify sandbox (`npx ampx sandbox`) must be running for integration tests that touch DynamoDB or S3; unit tests mock the Amplify client
- `amplify_outputs.json` is regenerated by the sandbox — commit it after running the sandbox for the first time with the new data/storage resources
