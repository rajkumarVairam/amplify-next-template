import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Simple, transparent pricing for ${siteConfig.name}.`,
};

// Edit PLANS here or move to siteConfig for config-driven pricing
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals and side projects.",
    features: [
      "1 user",
      "Health monitoring dashboard",
      "User profile with avatar",
      "Light & dark theme",
      "Community support",
    ],
    cta: "Get started",
    ctaHref: siteConfig.nav.ctaHref,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professionals who need more power.",
    features: [
      "Everything in Free",
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
      "API access",
    ],
    cta: "Start free trial",
    ctaHref: siteConfig.nav.ctaHref,
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "For teams building together.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team workspaces",
      "SSO / SAML",
      "Audit logs",
      "Dedicated support",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Simple, transparent pricing</h1>
        <p className={styles.heroSubtitle}>
          No hidden fees. No per-seat surprises. Cancel any time.
        </p>
      </section>

      <section className={styles.plans}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.plan} ${plan.highlighted ? styles.highlighted : ""}`}
          >
            {plan.highlighted && (
              <span className={styles.badge}>Most popular</span>
            )}
            <h2 className={styles.planName}>{plan.name}</h2>
            <div className={styles.planPrice}>
              <span className={styles.price}>{plan.price}</span>
              <span className={styles.period}>{plan.period}</span>
            </div>
            <p className={styles.planDesc}>{plan.description}</p>
            <ul className={styles.featureList}>
              {plan.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.check} aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.ctaHref}
              className={`${styles.planCta} ${plan.highlighted ? styles.planCtaHighlighted : ""}`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>

      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Frequently asked questions</h2>
        <div className={styles.faqGrid}>
          <div>
            <h3>Can I change plans later?</h3>
            <p>Yes. You can upgrade or downgrade at any time from your account settings.</p>
          </div>
          <div>
            <h3>Is there a free trial?</h3>
            <p>Pro and Team plans include a 14-day free trial. No credit card required to start.</p>
          </div>
          <div>
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards via Stripe.</p>
          </div>
          <div>
            <h3>What happens when I cancel?</h3>
            <p>Your account downgrades to the Free plan at the end of your billing period. Your data is preserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
