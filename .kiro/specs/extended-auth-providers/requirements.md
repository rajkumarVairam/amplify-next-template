# Requirements Document

## Introduction

This feature extends the existing email-only authentication in the Next.js 14 + AWS Amplify Gen 2 application to support additional sign-in methods. The additions fall into two categories:

1. **Social providers** — Google, Amazon (Login with Amazon), and GitHub. Because Amazon Cognito does not natively support GitHub as an OAuth provider, GitHub authentication is routed through a custom OIDC proxy service that presents a Cognito-compatible OIDC interface.
2. **Passwordless options** — email OTP (one-time passcode) and passkeys (WebAuthn / FIDO2).

All new options are controlled by feature flags so any provider can be enabled or disabled without deleting code. Backend changes are confined to `amplify/auth/resource.ts`; frontend changes are confined to `app/AuthenticatorWrapper.tsx` and `lib/authenticator-config.tsx`, following the existing patterns.

---

## Glossary

- **Auth_Resource**: The Amplify Gen 2 auth backend defined in `amplify/auth/resource.ts` via `defineAuth`.
- **Authenticator**: The `<Authenticator>` component from `@aws-amplify/ui-react` rendered inside `AuthenticatorWrapper`.
- **AuthenticatorWrapper**: The `"use client"` boundary component at `app/AuthenticatorWrapper.tsx` that configures Amplify and renders the Authenticator.
- **AuthConfig**: The `lib/authenticator-config.tsx` module that exports `authenticatorComponents`, `authenticatorFormFields`, and `authenticatorServices`.
- **CONFIG**: The feature-flag object inside `lib/authenticator-config.tsx` that controls which UI customisations are active.
- **Social_Provider**: An external OAuth 2.0 / OIDC identity provider (Google, Amazon, or GitHub).
- **OIDC_Proxy**: An intermediary service that wraps the GitHub OAuth flow and exposes a standard OIDC interface compatible with Amazon Cognito's external provider configuration.
- **Email_OTP**: A passwordless sign-in method where Cognito sends a one-time numeric code to the user's email address.
- **Passkey**: A FIDO2 / WebAuthn credential stored on the user's device, enabling biometric or PIN-based sign-in without a password.
- **Amplify_Secret**: A value stored via `npx ampx sandbox secret set <NAME>` and referenced in backend code with `secret("NAME")`.
- **Callback_URL**: The URL Cognito redirects to after a successful social provider authentication.
- **Logout_URL**: The URL Cognito redirects to after a federated sign-out.
- **Feature_Flag**: A boolean constant in the `CONFIG` object that enables or disables a capability at build time without removing code.

---

## Requirements

### Requirement 1: Social Provider — Google

**User Story:** As a user, I want to sign in with my Google account, so that I can access the application without creating a separate password.

#### Acceptance Criteria

1. WHERE the `socialProviders.google` Feature_Flag is `true`, THE Auth_Resource SHALL include Google as an external provider using `secret("GOOGLE_CLIENT_ID")` and `secret("GOOGLE_CLIENT_SECRET")`.
2. WHERE the `socialProviders.google` Feature_Flag is `true`, THE Authenticator SHALL render a "Sign in with Google" button via the `socialProviders={["google"]}` prop.
3. WHEN a user clicks "Sign in with Google", THE Authenticator SHALL redirect the user to the Cognito-hosted UI, which then redirects to Google's OAuth consent screen.
4. WHEN Google returns a successful authorisation, THE Auth_Resource SHALL redirect the user to the configured Callback_URL and establish an authenticated Cognito session.
5. IF the Google OAuth flow returns an error, THEN THE Authenticator SHALL display an error message to the user.
6. WHERE the `socialProviders.google` Feature_Flag is `false`, THE Auth_Resource SHALL NOT include Google as an external provider and THE Authenticator SHALL NOT render a Google sign-in button.

---

### Requirement 2: Social Provider — Amazon (Login with Amazon)

**User Story:** As a user, I want to sign in with my Amazon account, so that I can access the application using my existing Amazon credentials.

#### Acceptance Criteria

1. WHERE the `socialProviders.amazon` Feature_Flag is `true`, THE Auth_Resource SHALL include Amazon as an external provider using `secret("AMAZON_CLIENT_ID")` and `secret("AMAZON_CLIENT_SECRET")`.
2. WHERE the `socialProviders.amazon` Feature_Flag is `true`, THE Authenticator SHALL render a "Sign in with Amazon" button via the `socialProviders={["amazon"]}` prop.
3. WHEN a user clicks "Sign in with Amazon", THE Authenticator SHALL redirect the user to the Cognito-hosted UI, which then redirects to Amazon's OAuth consent screen.
4. WHEN Amazon returns a successful authorisation, THE Auth_Resource SHALL redirect the user to the configured Callback_URL and establish an authenticated Cognito session.
5. IF the Amazon OAuth flow returns an error, THEN THE Authenticator SHALL display an error message to the user.
6. WHERE the `socialProviders.amazon` Feature_Flag is `false`, THE Auth_Resource SHALL NOT include Amazon as an external provider and THE Authenticator SHALL NOT render an Amazon sign-in button.

---

### Requirement 3: Social Provider — GitHub via OIDC Proxy

**User Story:** As a user, I want to sign in with my GitHub account, so that I can access the application using my existing GitHub credentials.

#### Acceptance Criteria

1. WHERE the `socialProviders.github` Feature_Flag is `true`, THE Auth_Resource SHALL include the OIDC_Proxy as a custom OIDC provider using `secret("GITHUB_OIDC_CLIENT_ID")` and `secret("GITHUB_OIDC_CLIENT_SECRET")`.
2. WHERE the `socialProviders.github` Feature_Flag is `true`, THE Auth_Resource SHALL configure the OIDC_Proxy issuer URL via `secret("GITHUB_OIDC_ISSUER_URL")`.
3. WHERE the `socialProviders.github` Feature_Flag is `true`, THE AuthConfig SHALL expose a `"github"` entry in the `socialProviders` array passed to the Authenticator so that a GitHub sign-in button is rendered.
4. WHEN a user clicks "Sign in with GitHub", THE Authenticator SHALL redirect the user to the Cognito-hosted UI, which then redirects to the OIDC_Proxy, which in turn redirects to GitHub's OAuth consent screen.
5. WHEN GitHub returns a successful authorisation to the OIDC_Proxy, THE OIDC_Proxy SHALL return a valid OIDC token to Cognito, and THE Auth_Resource SHALL redirect the user to the configured Callback_URL and establish an authenticated Cognito session.
6. IF the GitHub OAuth flow or OIDC_Proxy returns an error, THEN THE Authenticator SHALL display an error message to the user.
7. WHERE the `socialProviders.github` Feature_Flag is `false`, THE Auth_Resource SHALL NOT include the OIDC_Proxy as a provider and THE Authenticator SHALL NOT render a GitHub sign-in button.
8. THE Auth_Resource documentation SHALL describe the OIDC_Proxy requirement, including that it must expose a `/.well-known/openid-configuration` discovery endpoint and issue JWTs with `sub`, `email`, and `name` claims.

---

### Requirement 4: Shared Social Provider Configuration

**User Story:** As a developer, I want all social providers to share a common Callback_URL and Logout_URL configuration, so that OAuth redirects work consistently across local development and production environments.

#### Acceptance Criteria

1. THE Auth_Resource SHALL define a `callbackUrls` array containing at minimum `"http://localhost:3000/"` for local development and the production domain URL.
2. THE Auth_Resource SHALL define a `logoutUrls` array containing at minimum `"http://localhost:3000/"` for local development and the production domain URL.
3. WHEN any enabled Social_Provider completes authentication, THE Auth_Resource SHALL redirect to a URL in the `callbackUrls` array.
4. WHEN a user signs out of a federated session, THE Auth_Resource SHALL redirect to a URL in the `logoutUrls` array.
5. THE Auth_Resource SHALL store all OAuth client credentials exclusively as Amplify_Secrets and SHALL NOT hardcode credential values in source files.

---

### Requirement 5: Passwordless — Email OTP

**User Story:** As a user, I want to sign in using a one-time code sent to my email, so that I can access the application without remembering a password.

#### Acceptance Criteria

1. WHERE the `passwordless.emailOtp` Feature_Flag is `true`, THE Auth_Resource SHALL enable `EMAIL` as a passwordless sign-in delivery medium in the `passwordless` configuration block.
2. WHERE the `passwordless.emailOtp` Feature_Flag is `true`, THE Authenticator SHALL present an email OTP sign-in flow as an option on the sign-in screen.
3. WHEN a user requests an email OTP, THE Auth_Resource SHALL send a numeric one-time code to the user's registered email address within 60 seconds.
4. WHEN a user submits a valid OTP code, THE Auth_Resource SHALL establish an authenticated Cognito session.
5. IF a user submits an invalid or expired OTP code, THEN THE Auth_Resource SHALL reject the sign-in attempt and THE Authenticator SHALL display an error message.
6. WHERE the `passwordless.emailOtp` Feature_Flag is `false`, THE Auth_Resource SHALL NOT enable email OTP and THE Authenticator SHALL NOT present the email OTP flow.

---

### Requirement 6: Passwordless — Passkeys (WebAuthn)

**User Story:** As a user, I want to sign in using a passkey stored on my device, so that I can authenticate quickly and securely using biometrics or a device PIN.

#### Acceptance Criteria

1. WHERE the `passwordless.passkeys` Feature_Flag is `true`, THE Auth_Resource SHALL enable `WEB_AUTHN` as a passwordless sign-in method in the `passwordless` configuration block.
2. WHERE the `passwordless.passkeys` Feature_Flag is `true`, THE Authenticator SHALL present a "Sign in with passkey" option on the sign-in screen.
3. WHEN a user initiates passkey registration, THE Auth_Resource SHALL initiate a WebAuthn credential creation ceremony using the application's relying party ID.
4. WHEN a user initiates passkey sign-in, THE Auth_Resource SHALL initiate a WebAuthn assertion ceremony and, upon successful verification, establish an authenticated Cognito session.
5. IF the WebAuthn ceremony fails or the user cancels, THEN THE Authenticator SHALL display an appropriate error message and allow the user to choose an alternative sign-in method.
6. WHERE the `passwordless.passkeys` Feature_Flag is `false`, THE Auth_Resource SHALL NOT enable WebAuthn and THE Authenticator SHALL NOT present the passkey sign-in option.

---

### Requirement 7: Feature Flag Architecture

**User Story:** As a developer, I want all new authentication options controlled by feature flags, so that I can enable or disable any provider without deleting code.

#### Acceptance Criteria

1. THE AuthConfig SHALL extend the existing `CONFIG` object with a `socialProviders` sub-object containing boolean flags for `google`, `amazon`, and `github`.
2. THE AuthConfig SHALL extend the existing `CONFIG` object with a `passwordless` sub-object containing boolean flags for `emailOtp` and `passkeys`.
3. WHEN a Feature_Flag is set to `false`, THE Auth_Resource SHALL NOT include the corresponding provider configuration and THE Authenticator SHALL NOT render the corresponding UI element.
4. WHEN a Feature_Flag is set to `true`, THE Auth_Resource SHALL include the corresponding provider configuration and THE Authenticator SHALL render the corresponding UI element.
5. THE Auth_Resource SHALL mirror the same Feature_Flag values used in AuthConfig so that backend and frontend remain in sync.
6. THE AuthConfig SHALL export a `socialProvidersForAuthenticator` helper that derives the `socialProviders` array for the Authenticator `socialProviders` prop from the `CONFIG` flags, so that the prop is never manually maintained.

---

### Requirement 8: AuthenticatorWrapper Social Provider Integration

**User Story:** As a developer, I want the AuthenticatorWrapper to pass the active social providers to the Authenticator component, so that the correct sign-in buttons are rendered automatically.

#### Acceptance Criteria

1. THE AuthenticatorWrapper SHALL import `socialProvidersForAuthenticator` from AuthConfig and pass it as the `socialProviders` prop to the Authenticator.
2. WHEN `socialProvidersForAuthenticator` returns an empty array, THE Authenticator SHALL render without any social sign-in buttons.
3. WHEN `socialProvidersForAuthenticator` returns one or more providers, THE Authenticator SHALL render the corresponding sign-in buttons above the email/password form.
4. THE AuthenticatorWrapper SHALL NOT require modification when a Feature_Flag is toggled; all changes SHALL be confined to AuthConfig and Auth_Resource.

---

### Requirement 9: Secrets Documentation

**User Story:** As a developer, I want clear documentation of all required secrets and how to set them, so that I can configure any environment without guessing variable names.

#### Acceptance Criteria

1. THE Auth_Resource file SHALL include an inline comment block listing every Amplify_Secret name required by each enabled provider, the command to set each secret (`npx ampx sandbox secret set <NAME>`), and where to obtain the credential value.
2. THE Auth_Resource file SHALL document the OIDC_Proxy secrets separately and SHALL include a note that the OIDC_Proxy must be deployed before the GitHub provider can be enabled.
3. THE Auth_Resource file SHALL document the `callbackUrls` and `logoutUrls` values that must be registered in each Social_Provider's developer console.

---

### Requirement 10: Backward Compatibility

**User Story:** As a developer, I want the existing email sign-in flow to continue working unchanged when all new Feature_Flags are set to `false`, so that the feature can be merged without breaking the current authentication experience.

#### Acceptance Criteria

1. WHEN all Feature_Flags in `socialProviders` and `passwordless` are `false`, THE Auth_Resource SHALL be functionally equivalent to the current `defineAuth({ loginWith: { email: true } })` configuration.
2. WHEN all Feature_Flags are `false`, THE Authenticator SHALL render identically to the current sign-in UI with no additional buttons or flows.
3. THE AuthConfig SHALL preserve all existing `CONFIG` flags and slot components without modification.
4. THE AuthenticatorWrapper SHALL preserve its existing `components`, `formFields`, and `services` props without modification.
