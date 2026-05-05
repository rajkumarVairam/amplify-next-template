/**
 * content.ts — Reads blog posts and docs from the filesystem.
 *
 * Blog posts live in:  content/blog/*.md
 * Docs pages live in:  content/docs/*.md
 *
 * Each file has YAML frontmatter. This module parses it and returns
 * typed objects. Pages import these helpers — no content is hardcoded
 * in page components.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// ── Types ──────────────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;         // ISO 8601 e.g. "2025-01-15"
  author: string;
  tags: string[];
  readingTime: string;  // e.g. "4 min read"
  content: string;      // raw markdown body
  draft: boolean;
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  order: number;        // controls sidebar sort order
  section: string;      // e.g. "Getting Started"
  content: string;
}

// ── Paths ──────────────────────────────────────────────────────────────────

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const DOCS_DIR = path.join(process.cwd(), "content", "docs");

// ── Blog helpers ───────────────────────────────────────────────────────────

function parseBlogFile(filename: string): BlogPost {
  const filePath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ? String(data.date).slice(0, 10) : "",
    author: data.author ?? "YourApp Team",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: readingTime(content).text,
    content,
    draft: data.draft === true,
  };
}

/** Returns all published blog posts sorted newest first. */
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseBlogFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Returns a single blog post by slug, or null if not found. */
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseBlogFile(`${slug}.md`);
}

/** Returns all unique tags across published posts. */
export function getAllBlogTags(): string[] {
  const posts = getAllBlogPosts();
  const tags = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tags).sort();
}

// ── Docs helpers ───────────────────────────────────────────────────────────

function parseDocFile(filename: string): DocPage {
  const filePath = path.join(DOCS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: typeof data.order === "number" ? data.order : 99,
    section: data.section ?? "General",
    content,
  };
}

/** Returns all doc pages sorted by section then order. */
export function getAllDocPages(): DocPage[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseDocFile)
    .sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.order - b.order;
    });
}

/** Returns a single doc page by slug, or null if not found. */
export function getDocPage(slug: string): DocPage | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseDocFile(`${slug}.md`);
}

/** Returns docs grouped by section for sidebar rendering. */
export function getDocsBySection(): Record<string, DocPage[]> {
  const pages = getAllDocPages();
  return pages.reduce<Record<string, DocPage[]>>((acc, page) => {
    if (!acc[page.section]) acc[page.section] = [];
    acc[page.section].push(page);
    return acc;
  }, {});
}
