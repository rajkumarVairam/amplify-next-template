/**
 * site-config.ts — Single source of truth for all public-facing content.
 *
 * Edit this file to update:
 *  - Company name, tagline, and description across all pages
 *  - Navigation links
 *  - Footer links and social profiles
 *  - Legal page metadata (effective dates, contact email)
 *  - SEO defaults
 *  - Blog and docs settings
 *
 * Pages import from this file — nothing is hardcoded in individual pages.
 */

export const siteConfig = {
  // ── Identity ──────────────────────────────────────────────────────────
  name: "YourApp",
  tagline: "The modern platform for your team.",
  description:
    "YourApp helps teams build, ship, and scale faster with a secure, cloud-native foundation powered by AWS.",
  url: "https://yourapp.com", // no trailing slash

  // ── Legal ─────────────────────────────────────────────────────────────
  legal: {
    companyName: "YourApp Inc.",
    companyAddress: "123 Main Street, San Francisco, CA 94105, USA",
    contactEmail: "legal@yourapp.com",
    supportEmail: "support@yourapp.com",
    privacyEffectiveDate: "January 1, 2025",
    termsEffectiveDate: "January 1, 2025",
    cookiesEffectiveDate: "January 1, 2025",
    acceptableUseEffectiveDate: "January 1, 2025",
  },

  // ── Navigation ────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ],
    ctaLabel: "Sign in",
    ctaHref: "/sign-in",
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    columns: [
      {
        heading: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Changelog", href: "/blog" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "Documentation", href: "/docs" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        heading: "Legal",
        links: [
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Cookie Policy", href: "/cookies" },
          { label: "Acceptable Use", href: "/acceptable-use" },
        ],
      },
    ],
    social: [
      { label: "Twitter / X", href: "https://twitter.com/yourapp" },
      { label: "GitHub", href: "https://github.com/yourapp" },
      { label: "LinkedIn", href: "https://linkedin.com/company/yourapp" },
    ],
  },

  // ── SEO defaults ──────────────────────────────────────────────────────
  seo: {
    defaultTitle: "YourApp — The modern platform for your team",
    titleTemplate: "%s | YourApp", // %s = page title
    defaultDescription:
      "YourApp helps teams build, ship, and scale faster with a secure, cloud-native foundation powered by AWS.",
    twitterHandle: "@yourapp",
    ogImage: "/og-image.png", // place in /public
  },

  // ── Blog ──────────────────────────────────────────────────────────────
  blog: {
    title: "YourApp Blog",
    description: "Product updates, engineering deep-dives, and company news.",
    defaultAuthor: "YourApp Team",
    postsPerPage: 10,
  },

  // ── Docs ──────────────────────────────────────────────────────────────
  docs: {
    title: "YourApp Documentation",
    description: "Everything you need to get started and go further.",
    githubEditBase:
      "https://github.com/yourapp/yourapp/edit/main/content/docs",
  },
} as const;

export type SiteConfig = typeof siteConfig;
