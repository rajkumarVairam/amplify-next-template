import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
};

export default function HomePage() {
  const { name, tagline, description, nav } = siteConfig;

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{tagline}</h1>
          <p className={styles.heroSubtitle}>{description}</p>
          <div className={styles.heroCtas}>
            <Link href={nav.ctaHref} className={styles.ctaPrimary}>
              Get started free
            </Link>
            <Link href="/docs" className={styles.ctaSecondary}>
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Everything you need, nothing you don&apos;t</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>
                <h3 className={styles.featureCardTitle}>{f.title}</h3>
                <p className={styles.featureCardDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaBannerTitle}>Ready to get started?</h2>
          <p className={styles.ctaBannerDesc}>
            Sign up in seconds. No credit card required.
          </p>
          <Link href={nav.ctaHref} className={styles.ctaPrimary}>
            Create your account
          </Link>
        </div>
      </section>
    </>
  );
}

// Feature cards — edit here or move to siteConfig if you want them config-driven
const FEATURES = [
  {
    icon: "🔐",
    title: "Secure authentication",
    description:
      "Email sign-in powered by Amazon Cognito. Owner-based authorization on every data record.",
  },
  {
    icon: "📊",
    title: "Real-time health dashboard",
    description:
      "Monitor your backend services at a glance. Instant alerts when something goes wrong.",
  },
  {
    icon: "👤",
    title: "User profiles",
    description:
      "Display name, avatar, bio, theme preference, and notification settings — all persisted in DynamoDB.",
  },
  {
    icon: "🌗",
    title: "Light & dark themes",
    description:
      "Users choose their preferred color scheme. Applied instantly, no page reload required.",
  },
  {
    icon: "☁️",
    title: "Cloud-native storage",
    description:
      "Avatar images stored in S3, scoped to each user's identity. Secure by default.",
  },
  {
    icon: "📱",
    title: "Mobile-first design",
    description:
      "Every page is designed for the smallest screen first, then enhanced for desktop.",
  },
];
