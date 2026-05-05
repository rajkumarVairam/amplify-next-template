# Implementation Plan: App Cleanup and Auth

## Overview

Remove all todo-app artifacts from the Amplify quickstart template, fix the stale `amplify_outputs.json`, centralise `Amplify.configure()`, and leave a clean, working Authenticator as the foundation for future development. All changes are subtractive or corrective — no new infrastructure is introduced.

## Tasks

- [x] 1. Remove the Amplify data resource from the backend
  - Delete `amplify/data/resource.ts` entirely
  - Remove the `data` import and `data` property from `amplify/backend.ts` so `defineBackend` only registers `auth`
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Rewrite `app/AuthenticatorWrapper.tsx` with centralised `Amplify.configure()`
  - Add `"use client"` directive (already present)
  - Import `Amplify` from `aws-amplify` and `outputs` from `@/amplify_outputs.json`
  - Call `Amplify.configure(outputs)` at module scope (outside the component function)
  - Import `Authenticator` from `@aws-amplify/ui-react` and wrap `{children}` in it
  - Remove any other imports not needed by this component
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.6_

- [x] 3. Rewrite `app/page.tsx` as a minimal authenticated placeholder
  - Replace the entire file content with a `"use client"` component
  - Use `useAuthenticator()` to obtain `user` and `signOut`
  - Render the signed-in user's email (`user?.signInDetails?.loginId`) and a sign-out button
  - Remove all imports and logic related to todos: `generateClient`, `Schema`, `useState`, `useEffect`, todo CRUD calls, todo UI elements, tutorial link
  - Remove the inline `Amplify.configure(outputs)` call and the duplicate `@aws-amplify/ui-react/styles.css` import (already imported in `layout.tsx`)
  - Remove the `app.css` import (already imported in `layout.tsx`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 5.5_

- [x] 4. Clean up `app/app.css` — remove todo-specific selectors
  - Delete the `ul` rule block (todo list container styles)
  - Delete the `li` rule block (todo list item styles)
  - Delete the `li:hover` rule block (todo list item hover styles)
  - Delete the `a` rule block (todo tutorial link styles)
  - Retain `body`, `main`, `button`, `button:hover`, `button:focus`, and `button:focus-visible` rules unchanged
  - _Requirements: 6.1, 6.2_

- [x] 5. Replace `amplify_outputs.json` with an auth-only structure
  - Remove the `data` key and its entire nested object from `amplify_outputs.json`
  - Retain the `auth` section and `version` field unchanged
  - _Requirements: 3.1, 3.2_

- [x] 6. Delete `amplify.yml`
  - Delete the file `amplify.yml` from the project root
  - _Requirements: 6.3_

- [x] 7. Verify `.gitignore` covers `amplify_outputs.json`
  - Confirm the `.gitignore` already contains `amplify_outputs*` (it does — no change needed)
  - _Requirements: 3.4_

- [x] 8. Build verification
  - Run `tsc --noEmit` (or `next build`) and confirm zero TypeScript errors
  - Confirm no dangling imports to deleted files (`amplify/data/resource.ts`)
  - Confirm no references to `Schema`, `generateClient`, or `Amplify.configure` outside `AuthenticatorWrapper.tsx`
  - _Requirements: 1.1, 1.2, 1.5, 2.2, 4.1_

## Notes

- Tasks 1–3 must be completed together before running a build, as deleting `amplify/data/resource.ts` will cause TypeScript errors until `amplify/backend.ts` and `app/page.tsx` are also updated.
- `amplify_outputs.json` is already covered by `.gitignore` via the `amplify_outputs*` glob — no `.gitignore` change is needed.
- After all changes, run `npx ampx sandbox` to regenerate `amplify_outputs.json` with correct local sandbox values before starting the dev server.
- No property-based tests are applicable — all changes are structural (file deletions, import removals, CSS rule removals) with no logic input space to explore.
