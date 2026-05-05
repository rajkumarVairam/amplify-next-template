import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./PublicFooter.module.css";

export default function PublicFooter() {
  const { name, footer, legal } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Link columns — driven entirely by siteConfig.footer.columns */}
        <div className={styles.columns}>
          {footer.columns.map((col) => (
            <div key={col.heading} className={styles.column}>
              <p className={styles.columnHeading}>{col.heading}</p>
              <ul className={styles.linkList}>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} {legal.companyName}. All rights reserved.
          </p>

          <div className={styles.social}>
            {footer.social.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
