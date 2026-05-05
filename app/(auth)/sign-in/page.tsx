"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function SignInPage() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      // Honour the ?redirect= param so deep links work after sign-in
      const redirect = searchParams.get("redirect");
      router.replace(redirect ?? "/dashboard");
    }
  }, [user, router, searchParams]);

  // The Authenticator in (auth)/layout.tsx renders the sign-in form.
  // Once authenticated, the useEffect above redirects to /dashboard.
  // Nothing to render here — the layout provides the full shell.
  return null;
}
