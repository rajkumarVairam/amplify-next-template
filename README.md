# AWS Amplify Next.js — Application Baseline

A production-ready full-stack baseline built with Next.js 14 (App Router) and AWS Amplify Gen 2. It ships with authentication, a health-monitoring dashboard, user profiles, a complete public marketing site, blog, docs, and all standard legal pages — config-driven so you can rebrand and extend it for any domain.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Auth | Amazon Cognito (via Amplify Auth) |
| Database | Amazon DynamoDB (via Amplify Data / AppSync) |
| Storage | Amazon S3 (via Amplify Storage) |
| Testing | Vitest, Testing Library, fast-check (property-based) |
| Content | Markdown files with gray-matter frontmatter |

---

## Project Structure

```
app/
├── layout.tsx                        # Root layout (Server Component, no auth)
├── (auth)/
│   └── sign-in/page.tsx              # Sign-in page (Authenticator scoped here)
├── (authenticated)/
│   ├── layout.tsx                    # Auth guard + Nav + theme
│   ├── dashboard/page.tsx            # Health monitoring dashboard
│   └── profile/page.tsx             # Profile settings
├── (public)/
│   ├── layout.tsx                    # Public header + footer
│   ├── page.tsx                      # Landing page
│   ├── features/                     # Features page
│   ├── pricing/                      # Pricing page
│   ├── contact/                      # Contact page
│   ├── blog/                         # Blog index + [slug] posts
│   ├── docs/                         # Docs index + [slug] pages
│   ├── terms/                        # Terms of Service
│   ├── privacy/                      # Privacy Policy
│   ├── cookies/                      # Cookie Policy
│   └── acceptable-use/               # Acceptable Use Policy
└── components/
    ├── Nav.tsx                        # Authenticated sidebar/top nav
    ├── HealthCard.tsx                 # Service status card
    ├── ProfileForm.tsx                # Profile edit form
    ├── AvatarUpload.tsx               # S3 image upload
    └── public/
        ├── PublicHeader.tsx           # Marketing site header
        ├── PublicFooter.tsx           # Marketing site footer
        └── LegalPage.tsx             # Shared legal page wrapper

amplify/
├── auth/resource.ts                  # Cognito User Pool
├── data/resource.ts                  # UserProfile DynamoDB model
├── storage/resource.ts               # S3 avatar bucket
└── backend.ts                        # Wires all resources together

lib/
├── site-config.ts                    # ← Single config file for all public content
├── content.ts                        # Blog + docs markdown reader
├── health-service.ts                 # Backend health checks
├── profile-service.ts                # UserProfile CRUD
├── theme-utils.ts                    # Light/dark theme helpers
└── notification-utils.ts             # Health transition alerts

content/
├── blog/*.md                         # Blog posts (add files here)
└── docs/*.md                         # Docs pages (add files here)

__tests__/unit/                       # 30 property-based tests
```

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **AWS account** with credentials configured
- **AWS CLI** configured (`aws configure`)

Install the Amplify CLI:

```bash
npm install -g @aws-amplify/backend-cli
```

---

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd amplify-next-template
npm install
```

### 2. Start the Amplify sandbox (Terminal 1)

Provisions real AWS resources (Cognito, DynamoDB, S3) scoped to your personal dev environment. Watches `amplify/` and auto-deploys changes.

```bash
npx ampx sandbox
```

On first run this creates:
- A Cognito User Pool for authentication
- A DynamoDB table for `UserProfile` records
- An S3 bucket for avatar storage
- `amplify_outputs.json` in the project root

> `amplify_outputs.json` is gitignored. Each developer generates their own.

### 3. Start the dev server (Terminal 2)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Route map:**

| URL | What you see |
|---|---|
| `/` | Landing page (public) |
| `/sign-in` | Sign-in / sign-up |
| `/dashboard` | Health dashboard (requires auth) |
| `/profile` | Profile settings (requires auth) |
| `/features` | Features page |
| `/pricing` | Pricing page |
| `/contact` | Contact page |
| `/blog` | Blog index |
| `/blog/welcome-to-yourapp` | Sample blog post |
| `/docs/getting-started` | Docs (auto-redirects to first page) |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/cookies` | Cookie Policy |
| `/acceptable-use` | Acceptable Use Policy |

---

## Configuration

**Everything public-facing is driven by a single file: `lib/site-config.ts`**

Edit it once to update:
- Company name, tagline, and description across all pages
- Navigation links and CTA button
- Footer columns and social links
- Legal company name, address, contact emails, and effective dates
- SEO meta titles and descriptions
- Blog and docs settings

```ts
// lib/site-config.ts
export const siteConfig = {
  name: "YourApp",
  tagline: "The modern platform for your team.",
  legal: {
    companyName: "YourApp Inc.",
    contactEmail: "legal@yourapp.com",
    termsEffectiveDate: "January 1, 2025",
    // ...
  },
  nav: { links: [...], ctaLabel: "Sign in", ctaHref: "/sign-in" },
  footer: { columns: [...], social: [...] },
  seo: { defaultTitle: "...", titleTemplate: "%s | YourApp" },
  // ...
}
```

---

## Adding Blog Posts

Create a markdown file in `content/blog/`:

```markdown
---
title: "My Post Title"
description: "A short description for SEO."
date: "2025-06-01"
author: "Your Name"
tags: ["product", "engineering"]
draft: false
---

Your post content here...
```

The post appears at `/blog/my-post-title` automatically. No code changes needed.

---

## Adding Docs Pages

Create a markdown file in `content/docs/`:

```markdown
---
title: "My Doc Page"
description: "What this page covers."
section: "Getting Started"
order: 3
---

Your documentation here...
```

The page appears in the docs sidebar automatically, sorted by `section` then `order`.

---

## Running Tests

Unit and property-based tests run entirely in jsdom — no AWS connection required.

```bash
# Run all tests once
npm test

# Run a specific file
npx vitest run __tests__/unit/health-service.test.ts

# Watch mode
npx vitest
```

The suite covers **30 tests** across **18 correctness properties** using [fast-check](https://github.com/dubzzz/fast-check), each running 100 generated inputs.

---

## Daily Development Workflow

```
Terminal 1                         Terminal 2
─────────────────────────────────  ─────────────────────────────────
npx ampx sandbox                   npm run dev
  │                                  │
  │  Watches amplify/ and             │  Hot-reloads at localhost:3000
  │  auto-deploys to AWS             │
  ▼                                  ▼
  Edit amplify/*.ts  →  redeploys in seconds
  Edit app/**/*.tsx  →  browser hot-reloads instantly
```

Stop the sandbox at end of day to avoid unnecessary AWS costs:

```bash
Ctrl+C   # in the sandbox terminal
```

---

## Backend Resources

### Authentication

Email/password sign-in via Amazon Cognito. The `useAuthenticator` hook provides the current user and `signOut` throughout the app.

### Data (`amplify/data/resource.ts`)

`UserProfile` model in DynamoDB — one record per user, owner-scoped:

| Field | Type | Notes |
|---|---|---|
| `displayName` | String (required) | Max 64 chars |
| `bio` | String | Max 280 chars |
| `avatarUrl` | String | S3 key after upload |
| `themePreference` | Enum `light \| dark` | Applied on load |
| `notificationsEnabled` | Boolean | Controls health alerts |

### Storage (`amplify/storage/resource.ts`)

Avatar images stored at `avatars/{cognitoIdentityId}/{filename}`. Access is scoped to the uploading user's identity.

---

## Deploying to AWS Amplify

### CI/CD (automated on every push)

`amplify.yml` is included in the repo. Connect once in the Amplify Console and every push deploys automatically.

**One-time setup:**

1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify) → **Create new app**
2. Connect your Git provider and select your repo + branch (`main`)
3. Amplify detects `amplify.yml` automatically — no manual changes needed
4. Allow Amplify to create a service role
5. **Save and deploy**

Every subsequent `git push` to `main` triggers a full build (backend + frontend).

**How `amplify.yml` works:**

```
backend phase  →  npx ampx pipeline-deploy   (Cognito, DynamoDB, S3)
frontend phase →  npm run build               (Next.js, artifacts in .next)
cache          →  node_modules + .next/cache  (speeds up future builds)
```

---

## Guarding Against Build Minute Overages

Amplify Hosting includes **1,000 free build minutes/month**. Beyond that: **$0.01/minute**.

A typical build takes 3–5 minutes with caching. That's ~200–333 free builds/month.

### Set an AWS Budget alert first

1. Go to [AWS Budgets](https://console.aws.amazon.com/billing/home#/budgets) → **Create budget**
2. Choose **Cost budget**, set **$5/month**
3. Add alert at **80%** → email
4. Add alert at **100%** → email

### Disable auto-build on feature branches

Amplify Console → your app → **Branch settings** → turn off **Auto-build** for branches that don't need to deploy on every push.

### Build minute estimate

| Workflow | Builds/month | Minutes/month | Cost |
|---|---|---|---|
| 1 push/day | ~30 | ~150 | Free |
| 5 pushes/day | ~150 | ~750 | Free |
| 10 pushes/day | ~300 | ~1,500 | ~$5 |

---

## Zero-Cost Manual Deployment (No Build Minutes Used)

> Triggering a build in the Amplify Console — whether via git push, "Redeploy", or webhook — always consumes build minutes. The only way to deploy with **zero build minutes** is to build locally and upload the pre-built artifact directly.

### Step 1 — Deploy the backend (only if `amplify/` changed)

Runs on your machine, not in Amplify CI. Zero build minutes.

```bash
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

### Step 2 — Refresh `amplify_outputs.json`

```bash
npx ampx generate outputs --branch main --app-id YOUR_APP_ID
```

### Step 3 — Build locally

```bash
npm run build
```

### Step 4 — Package the output

**Windows (PowerShell):**
```powershell
Compress-Archive -Path .next -DestinationPath build.zip -Force
```

**macOS / Linux:**
```bash
zip -r build.zip .next
```

### Step 5 — Create a deployment slot

```bash
aws amplify create-deployment --app-id YOUR_APP_ID --branch-name main
```

Note the `jobId` and `zipUploadUrl` from the response.

### Step 6 — Upload the artifact

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "PASTE_ZIP_UPLOAD_URL" -Method PUT -InFile build.zip
```

**macOS / Linux:**
```bash
curl -H "Content-Type: application/zip" --upload-file build.zip "PASTE_ZIP_UPLOAD_URL"
```

> The presigned URL expires in ~15 minutes. Complete steps 5 → 6 → 7 promptly.

### Step 7 — Start the deployment

```bash
aws amplify start-deployment --app-id YOUR_APP_ID --branch-name main --job-id JOB_ID
```

### Step 8 — Verify

```bash
aws amplify get-job --app-id YOUR_APP_ID --branch-name main --job-id JOB_ID \
  --query "job.summary.[status,endTime]"
```

### Quick checklist

```
[ ] 1. npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
        (skip if amplify/ unchanged)
[ ] 2. npx ampx generate outputs --branch main --app-id YOUR_APP_ID
[ ] 3. npm run build
[ ] 4. Compress-Archive -Path .next -DestinationPath build.zip -Force
[ ] 5. aws amplify create-deployment --app-id YOUR_APP_ID --branch-name main
        → note jobId + zipUploadUrl
[ ] 6. Invoke-WebRequest -Uri "ZIP_UPLOAD_URL" -Method PUT -InFile build.zip
[ ] 7. aws amplify start-deployment --app-id YOUR_APP_ID --branch-name main --job-id JOB_ID
[ ] 8. aws amplify get-job ... → confirm SUCCEED
```

### CI/CD vs manual comparison

| | Auto CI/CD | Manual (local build + upload) |
|---|---|---|
| Build minutes used | Yes (3–5 min/deploy) | **None** |
| Effort | Zero — push and done | ~5 min of CLI commands |
| Backend deploys | Automatic | Manual (`pipeline-deploy`) |
| Best for | Teams, frequent releases | Solo devs, cost-sensitive |

---

## Useful Commands

| Command | What it does |
|---|---|
| `npx ampx sandbox` | Start personal dev sandbox |
| `npx ampx sandbox --once` | Deploy once, no file watching |
| `npx ampx sandbox delete` | Tear down all sandbox AWS resources |
| `npx ampx generate outputs --app-id ID --branch main` | Pull `amplify_outputs.json` for a deployed env |
| `npm run dev` | Start Next.js dev server at localhost:3000 |
| `npm run build` | Production build (type-checks included) |
| `npm test` | Run full test suite |
| `npx vitest` | Run tests in watch mode |
| `npx tsc --noEmit` | Type-check without building |

---

## Troubleshooting

**`amplify_outputs.json` not found**
Run `npx ampx sandbox` first. This file is required for the frontend to connect to the backend.

**Sign-in page shows but auth fails**
Make sure the sandbox is running and `amplify_outputs.json` exists in the project root.

**Tests fail with AWS module errors**
All AWS SDK calls are mocked in the test suite. Run `npm install` to ensure dev dependencies are installed.

**Sandbox deploy fails with credentials error**
Run `aws configure` or set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` environment variables.

**TypeScript errors after pulling changes**
Delete `.next/` and re-run `npx tsc --noEmit`. Stale build cache can cause false errors.

---

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.
