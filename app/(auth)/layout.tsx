import Link from "next/link";
import AuthenticatorWrapper from "@/app/AuthenticatorWrapper";
import { siteConfig } from "@/lib/site-config";
import styles from "./auth.module.css";

/**
 * Auth layout — provides the sign-in page shell:
 *   - Gradient background
 *   - Minimal header with logo + "Back to home" link
 *   - Amplify Authenticator (renders sign-in UI when unauthenticated,
 *     passes children through when authenticated)
 *
 * The header lives here (not in the page component) so it is always
 * visible regardless of the Authenticator's internal state.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      {/* Minimal header — always visible on the sign-in page */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          {siteConfig.name}
        </Link>
        <Link href="/" className={styles.backLink}>
          ← Back to home
        </Link>
      </header>

      {/* Authenticator renders the sign-in form here */}
      <div className={styles.authContainer}>
        <AuthenticatorWrapper>{children}</AuthenticatorWrapper>
      </div>
    </div>
  );
}
