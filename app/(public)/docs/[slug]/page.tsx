import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDocPages, getDocPage, getDocsBySection } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import styles from "./doc.module.css";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllDocPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getDocPage(params.slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
  };
}

export default function DocPage({ params }: Props) {
  const page = getDocPage(params.slug);
  if (!page) notFound();

  const sections = getDocsBySection();

  return (
    <div className={styles.layout}>
      {/* Sidebar — driven by content/docs/*.md frontmatter */}
      <aside className={styles.sidebar}>
        <nav aria-label="Documentation navigation">
          {Object.entries(sections).map(([section, pages]) => (
            <div key={section} className={styles.sidebarSection}>
              <p className={styles.sidebarHeading}>{section}</p>
              <ul className={styles.sidebarList}>
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/docs/${p.slug}`}
                      className={`${styles.sidebarLink} ${
                        p.slug === params.slug ? styles.sidebarLinkActive : ""
                      }`}
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <article className={styles.content}>
        <header className={styles.contentHeader}>
          <p className={styles.section}>{page.section}</p>
          <h1 className={styles.title}>{page.title}</h1>
          {page.description && (
            <p className={styles.description}>{page.description}</p>
          )}
        </header>

        <div
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
        />

        <footer className={styles.contentFooter}>
          <a
            href={`${siteConfig.docs.githubEditBase}/${page.slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.editLink}
          >
            Edit this page on GitHub →
          </a>
        </footer>
      </article>
    </div>
  );
}

/** Same lightweight renderer as blog posts. Replace with remark for full support. */
function renderMarkdown(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|pre|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");
}
