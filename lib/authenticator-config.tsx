"use client";

/**
 * authenticator-config.tsx — Single source of truth for all Authenticator customisation.
 *
 * Three exports consumed by AuthenticatorWrapper:
 *   - authenticatorComponents  → custom slot components (header, footer, form fields)
 *   - authenticatorFormFields  → label / placeholder / order / visibility overrides
 *   - authenticatorServices    → override Auth function calls (e.g. lowercase username)
 *
 * HOW TO CONFIGURE:
 * Each section has a feature-flag comment block. Set the flag to `true` to enable,
 * `false` to disable. This lets you turn options on/off without deleting code.
 *
 * Valid slots for `components` (this version of @aws-amplify/ui-react):
 *   Header, Footer                          ← global, shown on every screen
 *   SignIn.{ Header, Footer }
 *   SignUp.{ Header, Footer, FormFields }
 *   ConfirmSignUp.{ Header, Footer }
 *   ConfirmSignIn.{ Header, Footer }
 *   ConfirmResetPassword.{ Header, Footer }
 *   ConfirmVerifyUser.{ Header, Footer }
 *   ForgotPassword.{ Header, Footer }
 *   ForceNewPassword.{ Header, Footer, FormFields }
 *   SetupTotp.{ Header, Footer }
 *   VerifyUser.{ Header, Footer }
 *
 * Full customisation reference:
 *   https://ui.docs.amplify.aws/react/connected-components/authenticator/customization
 */

import {
  Authenticator,
  Button,
  Heading,
  Image,
  Text,
  View,
  CheckboxField,
  useAuthenticator,
  useTheme,
} from "@aws-amplify/ui-react";
import { signUp, type SignUpInput } from "aws-amplify/auth";
import { siteConfig } from "@/lib/site-config";

// ─────────────────────────────────────────────────────────────────────────────
// Feature flags — set to true/false to enable/disable each customisation
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  // Global header — shown above the Authenticator card on every screen
  globalHeader: true,

  // Global footer — shown below the Authenticator card on every screen
  globalFooter: true,

  // Sign In screen
  signInHeader: true,
  signInFooter: true,          // "Forgot your password?" link

  // Sign Up screen
  signUpHeader: true,
  signUpFooter: true,          // "Already have an account? Sign in" link
  signUpTermsCheckbox: true,   // Append T&C checkbox + validation

  // Confirm Sign Up screen
  confirmSignUpHeader: true,
  confirmSignUpFooter: false,

  // Confirm Sign In (MFA) screen
  confirmSignInHeader: true,
  confirmSignInFooter: false,

  // Forgot Password screen
  forgotPasswordHeader: true,
  forgotPasswordFooter: false,

  // Confirm Reset Password screen
  confirmResetPasswordHeader: true,
  confirmResetPasswordFooter: false,

  // Confirm Verify User screen
  confirmVerifyUserHeader: true,
  confirmVerifyUserFooter: false,

  // Verify User screen
  verifyUserHeader: true,
  verifyUserFooter: false,

  // Force New Password screen
  forceNewPasswordHeader: true,
  forceNewPasswordFooter: false,

  // Setup TOTP screen
  setupTotpHeader: true,
  setupTotpFooter: false,

  // Services — override Auth function calls
  lowercaseUsername: true,     // Normalise username/email to lowercase on sign-up
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Slot components
// ─────────────────────────────────────────────────────────────────────────────

function GlobalHeader() {
  const { tokens } = useTheme();
  return (
    <View textAlign="center" padding={tokens.space.large}>
      <Text fontWeight="bold" fontSize={tokens.fontSizes.xl} color="var(--accent)">
        {siteConfig.name}
      </Text>
    </View>
  );
}

function GlobalFooter() {
  const { tokens } = useTheme();
  return (
    <View textAlign="center" padding={tokens.space.medium}>
      <Text color={tokens.colors.neutral[80]} fontSize={tokens.fontSizes.small}>
        © {new Date().getFullYear()} {siteConfig.legal.companyName}. All rights reserved.
      </Text>
    </View>
  );
}

function SignInHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Sign in to your account
    </Heading>
  );
}

function SignInFooter() {
  const { toForgotPassword } = useAuthenticator();
  return (
    <View textAlign="center">
      <Button fontWeight="normal" onClick={toForgotPassword} size="small" variation="link">
        Forgot your password?
      </Button>
    </View>
  );
}

function SignUpHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Create your account
    </Heading>
  );
}

function SignUpFooter() {
  const { toSignIn } = useAuthenticator();
  return (
    <View textAlign="center">
      <Button fontWeight="normal" onClick={toSignIn} size="small" variation="link">
        Already have an account? Sign in
      </Button>
    </View>
  );
}

function SignUpFormFields() {
  const { validationErrors } = useAuthenticator();
  return (
    <>
      <Authenticator.SignUp.FormFields />
      {CONFIG.signUpTermsCheckbox && (
        <CheckboxField
          errorMessage={validationErrors.acknowledgement as string}
          hasError={!!validationErrors.acknowledgement}
          name="acknowledgement"
          value="yes"
          label={
            <>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}>
                Privacy Policy
              </a>
            </>
          }
        />
      )}
    </>
  );
}

function ConfirmSignUpHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Verify your email
    </Heading>
  );
}

function ConfirmSignInHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Enter your verification code
    </Heading>
  );
}

function ForgotPasswordHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Reset your password
    </Heading>
  );
}

function ConfirmResetPasswordHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Enter your new password
    </Heading>
  );
}

function ConfirmVerifyUserHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Verify your account
    </Heading>
  );
}

function VerifyUserHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Verify your account
    </Heading>
  );
}

function ForceNewPasswordHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Update your password
    </Heading>
  );
}

function SetupTotpHeader() {
  const { tokens } = useTheme();
  return (
    <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={3}>
      Set up authenticator app
    </Heading>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assembled components object — only includes slots that are enabled
// ─────────────────────────────────────────────────────────────────────────────
export const authenticatorComponents: React.ComponentProps<
  typeof Authenticator
>["components"] = {
  ...(CONFIG.globalHeader  && { Header: GlobalHeader }),
  ...(CONFIG.globalFooter  && { Footer: GlobalFooter }),

  SignIn: {
    ...(CONFIG.signInHeader && { Header: SignInHeader }),
    ...(CONFIG.signInFooter && { Footer: SignInFooter }),
  },

  SignUp: {
    ...(CONFIG.signUpHeader && { Header: SignUpHeader }),
    ...(CONFIG.signUpFooter && { Footer: SignUpFooter }),
    ...(CONFIG.signUpTermsCheckbox && { FormFields: SignUpFormFields }),
  },

  ConfirmSignUp: {
    ...(CONFIG.confirmSignUpHeader && { Header: ConfirmSignUpHeader }),
  },

  ConfirmSignIn: {
    ...(CONFIG.confirmSignInHeader && { Header: ConfirmSignInHeader }),
  },

  ForgotPassword: {
    ...(CONFIG.forgotPasswordHeader && { Header: ForgotPasswordHeader }),
  },

  ConfirmResetPassword: {
    ...(CONFIG.confirmResetPasswordHeader && { Header: ConfirmResetPasswordHeader }),
  },

  ConfirmVerifyUser: {
    ...(CONFIG.confirmVerifyUserHeader && { Header: ConfirmVerifyUserHeader }),
  },

  VerifyUser: {
    ...(CONFIG.verifyUserHeader && { Header: VerifyUserHeader }),
  },

  ForceNewPassword: {
    ...(CONFIG.forceNewPasswordHeader && { Header: ForceNewPasswordHeader }),
  },

  SetupTotp: {
    ...(CONFIG.setupTotpHeader && { Header: SetupTotpHeader }),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Form fields — label / placeholder / order / visibility overrides
// ─────────────────────────────────────────────────────────────────────────────
export const authenticatorFormFields: React.ComponentProps<
  typeof Authenticator
>["formFields"] = {
  signIn: {
    username: {
      label: "Email",
      placeholder: "Enter your email",
      isRequired: true,
      labelHidden: false,
    },
    password: {
      label: "Password",
      placeholder: "Enter your password",
      isRequired: true,
      labelHidden: false,
    },
  },

  signUp: {
    email: {
      label: "Email",
      placeholder: "Enter your email",
      isRequired: true,
      order: 1,
    },
    password: {
      label: "Password",
      placeholder: "Create a password",
      isRequired: true,
      order: 2,
    },
    confirm_password: {
      label: "Confirm password",
      placeholder: "Re-enter your password",
      isRequired: true,
      order: 3,
    },
  },

  forgotPassword: {
    username: {
      label: "Email",
      placeholder: "Enter your email",
      isRequired: true,
    },
  },

  confirmResetPassword: {
    confirmation_code: {
      label: "Verification code",
      placeholder: "Enter the code from your email",
      isRequired: true,
    },
    password: {
      label: "New password",
      placeholder: "Enter your new password",
      isRequired: true,
    },
    confirm_password: {
      label: "Confirm new password",
      placeholder: "Re-enter your new password",
      isRequired: true,
    },
  },

  confirmSignIn: {
    confirmation_code: {
      label: "Verification code",
      placeholder: "Enter the code",
      isRequired: true,
    },
  },

  setupTotp: {
    QR: {
      totpIssuer: siteConfig.name,
    },
    confirmation_code: {
      label: "Verification code",
      placeholder: "Enter the 6-digit code",
      isRequired: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Services — override Auth function calls
// ─────────────────────────────────────────────────────────────────────────────
export const authenticatorServices: React.ComponentProps<
  typeof Authenticator
>["services"] = {
  ...(CONFIG.lowercaseUsername && {
    async handleSignUp(input: SignUpInput) {
      const { username, password, options } = input;
      return signUp({
        username: username.toLowerCase(),
        password,
        options: {
          ...options,
          userAttributes: {
            ...options?.userAttributes,
            email: options?.userAttributes?.email?.toLowerCase(),
          },
        },
      });
    },
  }),

  // Validate custom sign-up fields
  async validateCustomSignUp(formData: Record<string, string>) {
    if (CONFIG.signUpTermsCheckbox && !formData.acknowledgement) {
      return {
        acknowledgement: "You must agree to the Terms of Service and Privacy Policy",
      };
    }
  },
};
