---
inclusion: always
---

# AWS Amplify Gen 2 — Project Standards

This project uses **AWS Amplify Gen 2** (TypeScript code-first) with **Next.js 14 App Router**.
Always follow these standards. Never use Gen 1 patterns.

## Critical Rules

### 1. Never use Gen 1 patterns
- ❌ `aws-exports.js` — use `amplify_outputs.json`
- ❌ `Amplify.configure(awsExports)` — use `Amplify.configure(outputs)` where outputs is imported from `amplify_outputs.json`
- ❌ `@aws-amplify/auth` direct imports for config — use `aws-amplify/auth`
- ❌ `amplify push` — use `npx ampx sandbox` for dev, `npx ampx pipeline-deploy` for CI

### 2. Amplify.configure() placement
- MUST be called in a `"use client"` component
- MUST be called before any Amplify SDK usage
- In Next.js App Router: place in `app/AuthenticatorWrapper.tsx` which is imported by the root layout
- The root `app/layout.tsx` MUST be a Server Component — do NOT add `"use client"` to it

### 3. Authenticator and useAuthenticator
- Use `<Authenticator>` from `@aws-amplify/ui-react` to wrap authenticated sections
- Use `useAuthenticator((ctx) => [ctx.user, ctx.authStatus])` — always subscribe to `authStatus`
- **Sign-out redirect**: NEVER call `router.replace()` synchronously after `signOut()` — this causes a race condition. Instead, use `useEffect` watching `authStatus`:
  ```tsx
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [authStatus, router]);
  ```
- Pass `signOut` directly as `onClick={signOut}` — do not wrap it

### 4. Amplify Data (generateClient)
- Import: `import { generateClient } from 'aws-amplify/data'`
- Always type the client: `generateClient<Schema>()`
- Import Schema from: `import type { Schema } from '@/amplify/data/resource'`
- **Owner-based auth**: `list()` automatically returns ONLY the current user's records — never manually filter by `owner` field
- Call `generateClient()` per function call (not at module level) to ensure correct auth context per request

### 5. Amplify Storage
- Import: `import { uploadData, getUrl } from 'aws-amplify/storage'`
- Avatar path pattern: `avatars/${userId}/${filename}`
- Storage resource uses `allow.entity('identity')` — scoped to Cognito Identity Pool identity ID

### 6. Amplify Auth
- Import: `import { fetchAuthSession } from 'aws-amplify/auth'`
- Auth resource defined in `amplify/auth/resource.ts` using `defineAuth`
- Email login: `loginWith: { email: true }`

### 7. amplify_outputs.json
- This file is **gitignored** — each developer generates their own via `npx ampx sandbox`
- Never commit this file
- Required for the app to connect to the backend

### 8. Backend schema (amplify/data/resource.ts)
- Use `a.schema({})` with `defineData`
- Owner auth: `.authorization((allow) => [allow.owner()])`
- Export both `Schema` type and `data` constant
- All models use TypeScript code-first — no GraphQL SDL files

### 9. Next.js App Router integration
- Public pages: `app/(public)/` — NO Authenticator, fully server-rendered for SEO
- Auth page: `app/(auth)/` — scoped Authenticator wrapper
- Authenticated pages: `app/(authenticated)/` — auth guard via `authStatus` in layout
- Root layout (`app/layout.tsx`) MUST remain a Server Component
- `AuthenticatorWrapper.tsx` is the `"use client"` boundary for Amplify config

### 10. CSS and theming
- CSS custom properties (`--bg`, `--fg`, `--surface`, `--accent`, `--border`, `--text-muted`) are defined in `app/globals.css`
- `globals.css` MUST be imported in `app/layout.tsx`
- Theme is applied via `data-theme` attribute on `<html>` using `lib/theme-utils.ts`
- `app/app.css` is a global reset ONLY — no page-specific styles (no gradients, no flex-centering)
- Page-specific styles belong in CSS modules scoped to that page/layout

## When to use the aws-amplify power
For any Amplify backend changes (adding auth providers, new data models, storage, functions),
use the `aws-amplify` power workflow which provides SOPs from AWS documentation.
