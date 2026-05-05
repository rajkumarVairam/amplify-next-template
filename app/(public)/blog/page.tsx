import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { getAllBlogPosts } from "@/lib/content";
import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: siteConfig.blog.title,
  description: siteConfig.blog.description,
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const { blog } = siteConfig;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.subtitle}>{blog.description}</p>
        </header>

        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet. Check back soon.</p>
        ) : (
          <div className={styles.postList}>
            {posts.map((post) => (
              <article key={post.slug} className={styles.postCard}>
                <div className={styles.postMeta}>
                  <time dateTime={post.date} className={styles.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className={styles.readingTime}>{post.readingTime}</span>
                </div>
                <h2 className={styles.postTitle}>
                  <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                    {post.title}
                  </Link>
                </h2>
                <p className={styles.postDesc}>{post.description}</p>
                <div className={styles.tags}>
                  {post.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
