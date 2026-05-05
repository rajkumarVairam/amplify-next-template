import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import PublicHeader from "@/app/components/public/PublicHeader";
import PublicFooter from "@/app/components/public/PublicFooter";
import styles from "./public.module.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: siteConfig.seo.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.seo.twitterHandle,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <PublicHeader />
      <main className={styles.main}>{children}</main>
      <PublicFooter />
    </div>
  );
}
