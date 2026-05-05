# Design Document

## app-cleanup-and-auth

---

## Overview

This design covers the cleanup of a Next.js + AWS Amplify Gen 2 project that was bootstrapped from the Amplify todo quickstart template. The project previously used Amplify Hosting CI/CD (now reversed), leaving stale configuration and todo-specific code throughout. The work is purely subtractive and corrective: remove the AppSync/DynamoDB data layer, strip todo-specific code and styles, fix the stale `amplify_outputs.json`, centralise `Amplify.configure()`, and leave a clean, working Authenticator as the foundation for future development.

No new infrastructure is introduced. The backend shrinks from `{ auth, data }` to `{ auth }` only.

---

## Architecture

The target architecture is intentionally minimal:

```
┌─────────────────────────────────────────────────────┐
│  Next.js App Router                                  │
│                                                      │
│  app/layout.tsx  (Server Component)                  │
│    └─ imports AuthenticatorWrapper                   │
│         └─ "use client"                              │
│              ├─ Amplify.configure(outputs)  [once]   │
│              └─ <Authenticator>                      │
│                   └─ {children}  (all routes)        │
│                                                      │
│  app/page.tsx  (Client Component)                    │
│    └─ useAuthenticator() → user email + sign-out     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Amplify Gen 2 Backend  (amplify/)                   │
│                                                      │
│  backend.ts                                          │
│    └─ defineBackend({ auth })                        │
│                                                      │
│  auth/resource.ts                                    │
│    └─ defineAuth({ loginWith: { email: true } })     │
│                                                      │
│  [data/resource.ts — DELETED]                        │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- `Amplify.configure()` lives exclusively in `AuthenticatorWrapper` (the only `"use client"` boundary that wraps the whole tree). This is the standard pattern for Next.js App Router with Amplify — server components cannot call `Amplify.configure()`, so it must happen in a client component that is rendered before any protected content.
- `app/layout.tsx` remains a Server Component (no `"use client"` directive), which is the correct Next.js App Router pattern. It imports `AuthenticatorWrapper` which handles the client-side boundary.
- The `<Authenticator>` component from `@aws-amplify/ui-react` handles all auth UI (sign-in, sign-up, sign-out) without any custom implementation needed.

---

## Components and Interfaces

### `app/AuthenticatorWrapper.tsx` (modified)

**Responsibility:** Client-side boundary that configures Amplify once and wraps the entire app in the Authenticator context.

```tsx
"use client";

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Authenticator>{children}</Authenticator>;
}
```

**Design rationale:** Calling `Amplify.configure(outputs)` at module scope (outside the component function) ensures it runs exactly once when the module is first loaded, before any render. This is the recommended pattern for Amplify + Next.js App Router.

---

### `app/layout.tsx` (unchanged structure, minor cleanup)

**Responsibility:** Root layout — Server Component that imports `AuthenticatorWrapper` and the global stylesheets.

The existing structure is already correct. The only change needed is removing the `inter` font variable from the `<body>` className if it was applied there (currently it is defined but not applied to `<body>` — no change needed). The layout already wraps children in `AuthenticatorWrapper`.

---

### `app/page.tsx` (replaced)

**Responsibility:** Minimal authenticated home page. Displays the signed-in user's email and a sign-out button to confirm authentication is working.

```tsx
"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";

export default function Home() {
  const { user, signOut } = useAuthenticator();

  return (
    <main>
      <p>Signed in as: {user?.signInDetails?.loginId}</p>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
```

**Removed from page.tsx:**
- `Amplify.configure(outputs)` call
- `generateClient` import and usage
- `Schema` type import
- `useState` / `useEffect` todo list logic
- All todo UI elements (list, create button, delete buttons, tutorial link)
- Duplicate CSS and Amplify UI stylesheet imports (already imported in `layout.tsx`)

---

### `amplify/backend.ts` (modified)

**Responsibility:** Defines the Amplify Gen 2 backend. Remove the `data` resource.

```ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';

defineBackend({
  auth,
});
```

---

### `amplify/data/resource.ts` (deleted)

This file defines the Todo schema and AppSync data resource. It is deleted entirely. No other file will reference it after the cleanup.

---

### `amplify_outputs.json` (replaced)

The current file contains a stale `data` section pointing to a decommissioned AppSync endpoint. It must be replaced with an auth-only version. The correct values come from running `npx ampx sandbox`.

**Target structure (auth-only):**

```json
{
  "auth": {
    "user_pool_id": "<sandbox-generated>",
    "aws_region": "<region>",
    "user_pool_client_id": "<sandbox-generated>",
    "identity_pool_id": "<sandbox-generated>",
    "mfa_methods": [],
    "standard_required_attributes": ["email"],
    "username_attributes": ["email"],
    "user_verification_types": ["email"],
    "groups": [],
    "mfa_configuration": "NONE",
    "password_policy": {
      "min_length": 8,
      "require_lowercase": true,
      "require_numbers": true,
      "require_symbols": true,
      "require_uppercase": true
    },
    "unauthenticated_identities_enabled": true
  },
  "version": "1.3"
}
```

The `data` key is absent entirely.

---

### `app/app.css` (modified)

**Responsibility:** Base layout styles for the Authenticator to render correctly.

**Retained styles:**
- `body` — centering, font family, background gradient, viewport sizing
- `main` — flex column layout
- `button` — base button styles (used by the sign-out button on the home page)

**Removed styles (todo-specific):**
- `ul` — todo list container styles
- `li` — todo list item styles
- `li:hover` — todo list item hover styles
- `a` — todo tutorial link styles

---

### `amplify.yml` (deleted)

This file configures Amplify Hosting CI/CD pipelines. Since the project is no longer using Amplify Hosting, the file serves no purpose and should be deleted to avoid confusion.

---

### `.gitignore` (verified, no change needed)

The existing `.gitignore` already contains:

```
# amplify
.amplify
amplify_outputs*
amplifyconfiguration*
```

The `amplify_outputs*` glob covers `amplify_outputs.json`, so Requirement 3.4 is already satisfied. No change needed.

---

## Data Models

After this cleanup, the project has no application-level data models. The only data structure is the Amplify auth configuration in `amplify_outputs.json`, which is generated by the Amplify sandbox and not manually maintained.

The `Schema` type from `amplify/data/resource.ts` is deleted along with the file. No frontend code will reference it.

---

## Error Handling

### Missing or stale `amplify_outputs.json`

If `amplify_outputs.json` is missing or contains stale data (e.g., the `data` section pointing to a decommissioned endpoint), the app will fail at runtime when `Amplify.configure(outputs)` is called. The fix is to run `npx ampx sandbox` to regenerate the file.

**Mitigation:** The design ensures `amplify_outputs.json` is in `.gitignore` (already the case) and documents that developers must run `npx ampx sandbox` to generate a valid local copy.

### TypeScript compilation errors after data resource deletion

Deleting `amplify/data/resource.ts` and removing its import from `amplify/backend.ts` will cause TypeScript errors if any other file still imports from it. The cleanup of `app/page.tsx` (removing the `Schema` import and `generateClient` usage) must happen in the same change set to keep the project in a compilable state.

**Mitigation:** All changes are applied together. After the cleanup, `tsc --noEmit` (or `next build`) should pass with no errors.

### Authenticator rendering without configuration

If `Amplify.configure()` is not called before `<Authenticator>` renders, the component will throw a runtime error about missing configuration. The design places `Amplify.configure(outputs)` at module scope in `AuthenticatorWrapper.tsx`, which guarantees it runs before the component tree renders.

---

## Testing Strategy

Property-based testing is not applicable to this feature. The changes are:

- **File deletions** — verified by checking the file no longer exists
- **Code removal** — verified by checking imports and references are absent
- **Configuration updates** — verified by inspecting the JSON structure
- **CSS cleanup** — verified by checking specific rule selectors are absent
- **Component rewrites** — verified by rendering the component and checking output

These are all deterministic, structural checks. There is no logic with a meaningful input space to explore with randomised inputs. Running the same check 100 times would not find additional bugs.

**Recommended test approach:**

1. **Build verification** — Run `next build` (or `tsc --noEmit`) after all changes. A clean build with no TypeScript errors confirms:
   - No dangling imports to deleted files
   - No type errors from removed `Schema` type
   - No duplicate `Amplify.configure()` calls causing type conflicts

2. **Manual smoke test** — Start the dev server (`npm run dev`) with a freshly generated `amplify_outputs.json` from `npx ampx sandbox` and verify:
   - Unauthenticated visit to `/` shows the Amplify sign-in UI
   - Signing in with a valid Cognito user shows the home page with the user's email
   - Clicking "Sign out" returns to the sign-in UI

3. **Structural checks (can be scripted):**
   - `amplify/data/resource.ts` does not exist
   - `amplify.yml` does not exist (or is empty)
   - `amplify_outputs.json` does not contain a `data` key
   - `app/page.tsx` does not import from `aws-amplify/data` or `@/amplify/data/resource`
   - `app/page.tsx` does not call `Amplify.configure`
   - `app/app.css` does not contain `ul`, `li`, or `a` selectors

These checks are straightforward and best handled as part of a code review checklist or a simple CI lint script rather than a property-based test suite.
