import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import "@aws-amplify/ui-react/styles.css";
import "./globals.css";
import "./app.css";

/**
 * Root layout — Server Component.
 *
 * Intentionally does NOT include AuthenticatorWrapper here.
 * Public pages (marketing, legal, blog, docs) are fully server-rendered
 * with no Amplify auth context overhead — better SEO and performance.
 *
 * The Authenticator is scoped to:
 *   - app/(auth)/layout.tsx  → sign-in page
 *   - app/(authenticated)/layout.tsx → all protected pages
 */
export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
