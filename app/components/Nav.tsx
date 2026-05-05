"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import styles from "./Nav.module.css";

export interface NavProps {
  /** User's display name from their profile, or null to fall back to email. */
  displayName: string | null;
  /** User's Cognito sign-in email address. */
  email: string;
  /** Current pathname, used to highlight the active navigation link. */
  activePath: string;
  /** Callback invoked when the user activates the sign-out control. */
  onSignOut: () => void;
}

export default function Nav({
  displayName,
  email,
  activePath,
  onSignOut,
}: NavProps) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">

      {/* App brand — links to landing page */}
      <Link href="/" className={styles.brand}>
        {siteConfig.name}
      </Link>

      {/* Navigation links */}
      <div className={styles.links}>
        <Link
          href="/dashboard"
          className={`${styles.navLink}${activePath === "/dashboard" ? ` ${styles.active}` : ""}`}
        >
          Dashboard
        </Link>

        <Link
          href="/profile"
          className={`${styles.navLink}${activePath === "/profile" ? ` ${styles.active}` : ""}`}
        >
          Profile
        </Link>
      </div>

      {/* User identity + sign out */}
      <div className={styles.footer}>
        <span className={styles.userLabel}>{displayName ?? email}</span>
        <button
          type="button"
          className={styles.signOutBtn}
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>

    </nav>
  );
}
