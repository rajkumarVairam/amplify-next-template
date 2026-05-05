"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import AuthenticatorWrapper from "@/app/AuthenticatorWrapper";
import Nav from "@/app/components/Nav";
import { getProfile, UserProfile } from "@/lib/profile-service";
import { applyTheme, getDefaultTheme } from "@/lib/theme-utils";
import styles from "./layout.module.css";

function AuthenticatedLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Reactively redirect when auth state changes to unauthenticated.
  // This handles both: initial unauthenticated visit AND post-signOut.
  // Using useEffect ensures the redirect happens after signOut() fully
  // clears the Cognito session, avoiding the race condition where
  // router.replace() fires before the session is cleared.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      applyTheme(getDefaultTheme());
      router.replace("/sign-in");
    }
  }, [authStatus, router]);

  // Load profile and apply theme when user is authenticated
  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;

    async function loadProfile() {
      try {
        const loaded = await getProfile(user.userId);
        if (!cancelled) {
          setProfile(loaded);
          applyTheme(loaded?.themePreference ?? getDefaultTheme());
        }
      } catch {
        if (!cancelled) {
          applyTheme(getDefaultTheme());
        }
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [user?.userId]);

  // While auth state is being determined or user is signing out, render nothing
  if (authStatus !== "authenticated" || !user) {
    return null;
  }

  const email =
    (user.signInDetails as { loginId?: string } | undefined)?.loginId ?? "";

  return (
    <div className={styles.layout}>
      <Nav
        displayName={profile?.displayName ?? null}
        email={email}
        activePath={pathname}
        onSignOut={signOut}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatorWrapper>
      <AuthenticatedLayoutInner>{children}</AuthenticatedLayoutInner>
    </AuthenticatorWrapper>
  );
}
