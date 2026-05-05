# Requirements Document

## Introduction

This feature cleans up an existing Next.js + AWS Amplify Gen 2 project that was bootstrapped from the Amplify todo quickstart template. The user has reversed from AWS Amplify hosting, leaving stale configuration and todo-specific code throughout the project. The goal is to remove all todo app artifacts, fix the stale `amplify_outputs.json` and related configuration, and establish a clean, working Amplify Authenticator as the foundation for future feature development.

## Glossary

- **App**: The Next.js application being cleaned up.
- **Authenticator**: The `<Authenticator>` component from `@aws-amplify/ui-react` that provides sign-up, sign-in, and sign-out flows.
- **AuthenticatorWrapper**: The client-side React component that wraps the app in the Authenticator context.
- **Amplify_Backend**: The AWS Amplify Gen 2 backend defined under the `amplify/` directory.
- **amplify_outputs.json**: The generated configuration file that connects the frontend to Amplify backend resources.
- **Todo_Model**: The DynamoDB-backed GraphQL Todo data model currently defined in `amplify/data/resource.ts`.
- **Data_Resource**: The Amplify Gen 2 data resource (`amplify/data/resource.ts`) that defines the Todo schema.
- **Home_Page**: The Next.js root page at `app/page.tsx`.
- **Sandbox**: The local Amplify Gen 2 development environment started with `npx ampx sandbox`.

---

## Requirements

### Requirement 1: Remove Todo App Code

**User Story:** As a developer, I want all todo-specific code removed from the project, so that the codebase is clean and contains no references to the old quickstart template.

#### Acceptance Criteria

1. THE App SHALL contain no imports, references, or usage of the `Schema` type from `@/amplify/data/resource`.
2. THE App SHALL contain no calls to `generateClient` from `aws-amplify/data`.
3. THE Home_Page SHALL contain no todo list rendering, todo creation, or todo deletion logic.
4. THE App SHALL contain no UI elements (buttons, lists, links) that reference todo functionality.
5. THE App SHALL contain no inline `Amplify.configure(outputs)` calls inside page or component files.

---

### Requirement 2: Remove the Data Resource

**User Story:** As a developer, I want the Amplify data resource (AppSync + DynamoDB) removed from the backend, so that the backend only contains what is needed for authentication.

#### Acceptance Criteria

1. THE Amplify_Backend SHALL NOT include the Data_Resource in its `defineBackend` call.
2. THE Data_Resource file (`amplify/data/resource.ts`) SHALL be deleted from the project.
3. WHEN the Amplify_Backend is defined, THE Amplify_Backend SHALL only register the `auth` resource.

---

### Requirement 3: Fix amplify_outputs.json

**User Story:** As a developer, I want `amplify_outputs.json` to reflect only the current local sandbox backend, so that the app does not reference stale hosted resources from the reversed Amplify hosting deployment.

#### Acceptance Criteria

1. THE amplify_outputs.json SHALL NOT contain a `data` section referencing the old AppSync endpoint or API key.
2. THE amplify_outputs.json SHALL contain only an `auth` section with valid Cognito configuration.
3. WHEN the developer runs `npx ampx sandbox`, THE Sandbox SHALL regenerate `amplify_outputs.json` with correct values for the local development environment.
4. THE amplify_outputs.json SHALL be listed in `.gitignore` so that environment-specific values are not committed to source control.

---

### Requirement 4: Centralise Amplify Configuration

**User Story:** As a developer, I want Amplify to be configured in a single place, so that there are no duplicate or conflicting `Amplify.configure()` calls across the codebase.

#### Acceptance Criteria

1. THE App SHALL call `Amplify.configure(outputs)` exactly once, in `app/layout.tsx` or a dedicated client-side configuration component.
2. THE App SHALL NOT call `Amplify.configure()` inside individual page or feature components.
3. WHEN the App initialises, THE Authenticator SHALL have access to the Amplify configuration before rendering any protected content.

---

### Requirement 5: Clean, Working Authenticator

**User Story:** As a developer, I want a clean, working Amplify Authenticator as the app's foundation, so that all future pages and features are protected by authentication out of the box.

#### Acceptance Criteria

1. THE AuthenticatorWrapper SHALL wrap the entire application via `app/layout.tsx` so that all routes require authentication.
2. WHEN an unauthenticated user visits any route, THE Authenticator SHALL display the sign-in/sign-up UI.
3. WHEN a user successfully signs in, THE Authenticator SHALL render the protected page content.
4. WHEN a user signs out, THE Authenticator SHALL return the user to the sign-in UI.
5. THE Home_Page SHALL display the authenticated user's email address and a sign-out button as a minimal placeholder, confirming authentication is working.
6. THE AuthenticatorWrapper SHALL configure Amplify using `amplify_outputs.json` before rendering the Authenticator, using a client-side `"use client"` component.

---

### Requirement 6: Clean Up Styles and Configuration Files

**User Story:** As a developer, I want all todo-specific styles and stale configuration files removed, so that the project starts from a clean baseline.

#### Acceptance Criteria

1. THE App SHALL remove all todo-specific CSS rules from `app/app.css` (list styles, todo button styles, todo link styles).
2. THE App SHALL retain only base layout styles needed for the Authenticator to render correctly (body centering, font family).
3. THE amplify.yml file SHALL be removed or emptied, since the project is no longer using AWS Amplify hosting CI/CD.
4. THE App SHALL retain `app/globals.css` unchanged, as it contains standard Next.js base styles.
