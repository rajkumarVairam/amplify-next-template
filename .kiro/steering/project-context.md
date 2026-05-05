---
inclusion: always
---

# Project Context

## What this project is
A production-ready full-stack baseline built with Next.js 14 (App Router) and AWS Amplify Gen 2.
It serves as a reusable foundation for SaaS, marketplace, e-commerce, and other domain applications.

## Tech stack
- **Frontend**: Next.js 14 App Router, React 18, TypeScript
- **Auth**: Amazon Cognito via Amplify Auth (`amplify/auth/resource.ts`)
- **Database**: DynamoDB via Amplify Data / AppSync (`amplify/data/resource.ts`)
- **Storage**: S3 via Amplify Storage (`amplify/storage/resource.ts`)
- **Testing**: Vitest, @testing-library/react, fast-check (property-based)
- **Styling**: CSS Modules, mobile-first, CSS custom properties for theming

## Route architecture
```
app/
├── layout.tsx              # Server Component root — imports globals.css + app.css
├── (auth)/                 # Sign-in page — has its own AuthenticatorWrapper scope
├── (authenticated)/        # Protected pages — auth guard via authStatus useEffect
└── (public)/               # Marketing site — NO Authenticator, server-rendered for SEO
```

## Key files
- `lib/site-config.ts` — single source of truth for all public-facing content (name, nav, footer, legal, SEO)
- `lib/content.ts` — reads blog/docs from `content/blog/*.md` and `content/docs/*.md`
- `lib/profile-service.ts` — UserProfile CRUD via Amplify Data
- `lib/health-service.ts` — backend health checks (auth session, API, data layer)
- `lib/notification-utils.ts` — health transition alert logic
- `lib/theme-utils.ts` — light/dark theme via data-theme on html element
- `app/globals.css` — CSS custom properties (--bg, --fg, --surface, --accent, --border, --text-muted)
- `app/app.css` — global reset ONLY (no page-specific styles)

## CSS custom properties
Always defined in `app/globals.css`, imported in `app/layout.tsx`.
Never delete `globals.css` — all authenticated page components depend on these variables.
```css
:root, [data-theme="light"] { --bg, --fg, --surface, --accent, --border, --text-muted }
[data-theme="dark"] { ... }
```

## Content system (blog + docs)
- Blog posts: `content/blog/*.md` with frontmatter (title, date, description, tags, author, draft)
- Docs pages: `content/docs/*.md` with frontmatter (title, section, order, description)
- Parsed by `lib/content.ts` using `gray-matter` — NO MDX webpack transform needed
- Do NOT add `@next/mdx`, `remark-gfm`, or `rehype-highlight` to next.config.js — these are ESM-only and break webpack

## Testing
- Test runner: Vitest with jsdom environment
- All AWS SDK calls are mocked — tests run without AWS connection
- 30 property-based tests using fast-check (100 runs each)
- Run: `npm test` or `npx vitest run`

## Deployment
- CI/CD: `amplify.yml` in repo root — auto-detected by Amplify Console
- Manual zero-cost deploy: local build → zip → `aws amplify create-deployment` → upload → `aws amplify start-deployment`
- See README.md for full step-by-step instructions

## Known patterns to follow
1. Sign-out redirect: use `authStatus` useEffect, never synchronous `router.replace` after `signOut()`
2. Profile queries: `list()` is already owner-scoped — never filter by `owner` field manually
3. `generateClient()`: call per function, not at module level (Vitest mock isolation requirement)
4. Public pages: no `<Authenticator>` wrapper — they must be fully server-rendered
5. Theme: `applyTheme(getDefaultTheme())` before sign-out to reset dark theme on sign-in page
