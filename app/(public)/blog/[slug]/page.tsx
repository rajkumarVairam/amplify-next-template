import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import styles from "./post.module.css";

interface Props {
  params: { slug: string };
}

// Statically generate all blog post pages at build time (great for SEO)
export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <article className={styles.article}>
      <Link href="/blog" className={styles.backLink}>
        ← Back to blog
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          <time dateTime={post.date} className={styles.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={styles.readingTime}>{post.readingTime}</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={styles.author}>{post.author}</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.description}>{post.description}</p>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </header>

      {/* Rendered markdown — styled via .prose in post.module.css */}
      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Written by {post.author} · {siteConfig.name}
        </p>
        <Link href="/blog" className={styles.backLink}>
          ← Back to all posts
        </Link>
      </footer>
    </article>
  );
}

/**
 * Very lightweight markdown-to-HTML renderer for blog post bodies.
 * Handles headings, bold, italic, inline code, code blocks, lists, and paragraphs.
 * Replace with a proper library (marked, remark) if you need full CommonMark support.
 */
function renderMarkdown(md: string): string {
  return md
    // Code blocks (must come before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Unordered lists
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Paragraphs (lines not already wrapped in a block element)
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|pre|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");
}
