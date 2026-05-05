import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllDocPages } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.docs.title,
  description: siteConfig.docs.description,
};

// /docs redirects to the first doc page automatically
export default function DocsIndexPage() {
  const pages = getAllDocPages();
  if (pages.length > 0) {
    redirect(`/docs/${pages[0].slug}`);
  }

  return (
    <div style={{ padding: "3rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>{siteConfig.docs.title}</h1>
      <p>No documentation pages found yet. Add markdown files to <code>content/docs/</code>.</p>
    </div>
  );
}
