import styles from "./LegalPage.module.css";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for all legal pages (Terms, Privacy, Cookies, Acceptable Use).
 * Provides consistent typography, max-width, and effective date display.
 */
export default function LegalPage({
  title,
  effectiveDate,
  children,
}: LegalPageProps) {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.effectiveDate}>
          Effective date: {effectiveDate}
        </p>
      </header>
      <div className={styles.body}>{children}</div>
    </article>
  );
}
