"use client";

import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import { appTheme } from "@/lib/amplify-theme";
import {
  authenticatorComponents,
  authenticatorFormFields,
  authenticatorServices,
} from "@/lib/authenticator-config";

Amplify.configure(outputs);

/**
 * AuthenticatorWrapper — "use client" boundary for Amplify configuration.
 *
 * - Theme:      lib/amplify-theme.ts      (colors, tokens)
 * - Components: lib/authenticator-config.tsx (slots, form fields, services)
 *
 * To customise the Authenticator UI, edit lib/authenticator-config.tsx only.
 * Toggle the CONFIG flags there to enable/disable individual slots.
 */
export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={appTheme}>
      <Authenticator
        components={authenticatorComponents}
        formFields={authenticatorFormFields}
        services={authenticatorServices}
      >
        {children}
      </Authenticator>
    </ThemeProvider>
  );
}
