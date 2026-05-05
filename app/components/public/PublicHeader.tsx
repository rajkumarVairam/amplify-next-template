import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./PublicHeader.module.css";

export default function PublicHeader() {
  const { name, nav } = siteConfig;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo / brand */}
        <Link href="/" className={styles.brand}>
          {name}
        </Link>

        {/* Primary nav links */}
        <nav className={styles.nav} aria-label="Primary navigation">
          {nav.links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href={nav.ctaHref} className={styles.cta}>
          {nav.ctaLabel}
        </Link>
      </div>
    </header>
  );
}
