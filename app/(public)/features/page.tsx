import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./features.module.css";

export const metadata: Metadata = {
  title: "Features",
  description: `Everything ${siteConfig.name} includes out of the box.`,
};

// Edit FEATURE_SECTIONS here or move to siteConfig for full config-driven control
const FEATURE_SECTIONS = [
  {
    heading: "Authentication & Security",
    description:
      "Enterprise-grade auth powered by Amazon Cognito. No passwords to manage, no auth servers to run.",
    items: [
      "Email and password sign-in",
      "Secure session management",
      "Owner-based data authorization",
      "Automatic token refresh",
    ],
  },
  {
    heading: "Health Monitoring Dashboard",
    description:
      "Know the status of your backend at a glance. Catch issues before your users do.",
    items: [
      "Real-time auth session status",
      "API reachability checks",
      "Data layer health monitoring",
      "10-second timeout enforcement",
      "Manual refresh control",
      "In-app transition alerts",
    ],
  },
  {
    heading: "User Profiles",
    description:
      "Let users make the app their own. All profile data is persisted in DynamoDB and synced across devices.",
    items: [
      "Custom display name",
      "Bio (up to 280 characters)",
      "Avatar upload to S3 (JPEG, PNG, WebP)",
      "Light and dark theme preference",
      "Notification preferences",
    ],
  },
  {
    heading: "Responsive Design",
    description:
      "Built mobile-first. Every page works perfectly on a 320px phone and a 4K monitor.",
    items: [
      "Mobile-first CSS architecture",
      "Sidebar nav on desktop, top bar on mobile",
      "Touch-friendly tap targets",
      "No horizontal scrolling on any viewport",
    ],
  },
];

export default function FeaturesPage() {
  const { nav } = siteConfig;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Everything you need, built in</h1>
        <p className={styles.heroSubtitle}>
          A complete foundation so you can focus on your product, not your
          infrastructure.
        </p>
      </section>

      <section className={styles.sections}>
        {FEATURE_SECTIONS.map((section) => (
          <div key={section.heading} className={styles.section}>
            <div className={styles.sectionText}>
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              <p className={styles.sectionDesc}>{section.description}</p>
            </div>
            <ul className={styles.featureList}>
              {section.items.map((item) => (
                <li key={item} className={styles.featureItem}>
                  <span className={styles.check} aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <h2>Ready to get started?</h2>
        <Link href={nav.ctaHref} className={styles.ctaBtn}>
          Create your account
        </Link>
      </section>
    </div>
  );
}
