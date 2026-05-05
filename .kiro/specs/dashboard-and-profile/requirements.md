# Requirements Document

## Introduction

This feature adds a dashboard page and a profile settings page to the existing Next.js + AWS Amplify Gen 2 application. After signing in, users land on the dashboard, which displays real-time system health indicators for backend services, auth connectivity, and API status. From the dashboard, users can navigate to a profile settings page where they can manage their display name, avatar, bio, theme preference, and notification preferences. Profile data is persisted in DynamoDB via the Amplify Gen 2 data resource. Both pages share a responsive layout with a persistent navigation component (sidebar on desktop, top nav on mobile).

## Glossary

- **App**: The Next.js + AWS Amplify Gen 2 application.
- **Dashboard**: The post-login landing page that displays system health status cards.
- **Profile_Page**: The settings page where authenticated users manage their profile data.
- **Nav**: The persistent navigation component rendered on all authenticated pages (sidebar on desktop, collapsible top nav on mobile).
- **Health_Card**: A UI component that displays the status of a single backend service or connectivity check.
- **Health_Service**: The client-side module that performs connectivity and status checks against backend endpoints.
- **Profile_Store**: The Amplify Gen 2 data model (DynamoDB-backed) that persists user profile records.
- **Avatar_Store**: The Amplify Gen 2 Storage resource (S3-backed) that stores user avatar images.
- **Auth_Session**: The active Cognito session managed by the Amplify Authenticator.
- **User**: An authenticated person interacting with the App.
- **Display_Name**: A user-chosen name shown in the Nav and on the Profile_Page, distinct from the Cognito login email.
- **Theme_Preference**: A user-selected UI color scheme, either "light" or "dark".
- **Notification_Preference**: A user-configured flag controlling whether in-app notifications are enabled.

---

## Requirements

### Requirement 1: Post-Login Routing to Dashboard

**User Story:** As a User, I want to be taken to the Dashboard immediately after signing in, so that I can see system health at a glance without navigating manually.

#### Acceptance Criteria

1. WHEN a User completes authentication, THE App SHALL redirect the User to the `/dashboard` route.
2. WHEN an unauthenticated User navigates to `/dashboard`, THE App SHALL redirect the User to the sign-in page.
3. WHEN an unauthenticated User navigates to `/profile`, THE App SHALL redirect the User to the sign-in page.
4. THE App SHALL preserve the originally requested URL so that after sign-in the User is redirected to the intended route.

---

### Requirement 2: Persistent Navigation

**User Story:** As a User, I want a persistent navigation component on every authenticated page, so that I can move between the Dashboard and Profile_Page without losing context.

#### Acceptance Criteria

1. THE Nav SHALL render on every authenticated route, including `/dashboard` and `/profile`.
2. THE Nav SHALL contain a link to the Dashboard (`/dashboard`) and a link to the Profile_Page (`/profile`).
3. THE Nav SHALL display the User's Display_Name when a profile record exists, and the User's Cognito email address when no profile record exists.
4. THE Nav SHALL contain a sign-out control that, when activated, ends the Auth_Session and redirects the User to the sign-in page.
5. WHILE the viewport width is 768 px or greater, THE Nav SHALL render as a vertical sidebar.
6. WHILE the viewport width is less than 768 px, THE Nav SHALL render as a horizontal top navigation bar.
7. THE Nav SHALL indicate the currently active route by applying a distinct visual style to the corresponding navigation link.

---

### Requirement 3: Dashboard — System Health Overview

**User Story:** As a User, I want to see the health status of backend services on the Dashboard, so that I can quickly identify connectivity or service issues.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Health_Card for each of the following checks: Auth connectivity, Amplify API reachability, and DynamoDB data layer reachability.
2. WHEN the Dashboard mounts, THE Health_Service SHALL execute all health checks concurrently.
3. WHEN a health check succeeds, THE Health_Card SHALL display a "Healthy" status label and a green indicator.
4. WHEN a health check fails, THE Health_Card SHALL display an "Unavailable" status label and a red indicator.
5. WHILE a health check is in progress, THE Health_Card SHALL display a "Checking…" status label and a neutral loading indicator.
6. THE Dashboard SHALL display the timestamp of the most recent health check refresh in ISO 8601 format.
7. THE Dashboard SHALL provide a manual refresh control that, when activated, re-executes all health checks.
8. WHEN the manual refresh control is activated, THE Health_Service SHALL complete all checks within 10 seconds or mark each unresolved check as "Unavailable".
9. THE Dashboard SHALL display the authenticated User's Cognito email address as a contextual greeting.

---

### Requirement 4: Dashboard — Auth Status Card

**User Story:** As a User, I want to see my current authentication status on the Dashboard, so that I can confirm my session is active.

#### Acceptance Criteria

1. THE Dashboard SHALL display an Auth Status Health_Card showing whether the Auth_Session is active.
2. WHEN the Auth_Session is active, THE Health_Card SHALL display the session expiry time in a human-readable format (e.g., "Expires in 45 min").
3. IF the Auth_Session token cannot be retrieved, THEN THE Health_Card SHALL display "Auth Unavailable" and a red indicator.

---

### Requirement 5: Profile Page — Display Name and Bio

**User Story:** As a User, I want to set a display name and bio on my profile, so that the App can address me by name and I can describe myself.

#### Acceptance Criteria

1. THE Profile_Page SHALL display a form containing a Display_Name field (text, max 64 characters) and a Bio field (textarea, max 280 characters).
2. WHEN a User submits the profile form with a valid Display_Name, THE Profile_Store SHALL persist the Display_Name and Bio values associated with the User's Cognito identity.
3. WHEN a User submits the profile form with an empty Display_Name field, THE Profile_Page SHALL display a validation error message and THE Profile_Store SHALL not be updated.
4. WHEN a User submits the profile form with a Display_Name exceeding 64 characters, THE Profile_Page SHALL display a validation error message and THE Profile_Store SHALL not be updated.
5. WHEN a User submits the profile form with a Bio exceeding 280 characters, THE Profile_Page SHALL display a validation error message and THE Profile_Store SHALL not be updated.
6. WHEN the Profile_Page mounts, THE Profile_Page SHALL load the User's existing profile data from THE Profile_Store and pre-populate the form fields.

---

### Requirement 6: Profile Page — Avatar Upload

**User Story:** As a User, I want to upload a profile avatar, so that my identity is visually represented in the App.

#### Acceptance Criteria

1. THE Profile_Page SHALL provide an avatar upload control that accepts image files of type JPEG, PNG, or WebP.
2. WHEN a User selects an image file larger than 5 MB, THE Profile_Page SHALL display an error message and THE Avatar_Store SHALL not receive the file.
3. WHEN a User selects a valid image file, THE Profile_Page SHALL display a preview of the selected image before upload.
4. WHEN a User confirms the avatar upload, THE Avatar_Store SHALL store the image file scoped to the User's Cognito identity, and THE Profile_Store SHALL be updated with the avatar URL.
5. WHEN the Profile_Page mounts and a stored avatar URL exists, THE Profile_Page SHALL display the current avatar image.
6. IF the avatar upload fails, THEN THE Profile_Page SHALL display an error message and the previously stored avatar SHALL remain unchanged.

---

### Requirement 7: Profile Page — Theme Preference

**User Story:** As a User, I want to choose between a light and dark theme, so that the App matches my visual preference.

#### Acceptance Criteria

1. THE Profile_Page SHALL display a Theme_Preference selector with exactly two options: "Light" and "Dark".
2. WHEN a User selects a Theme_Preference and saves the profile, THE Profile_Store SHALL persist the selected Theme_Preference associated with the User's Cognito identity.
3. WHEN the App loads and a persisted Theme_Preference exists, THE App SHALL apply the corresponding CSS color scheme to all authenticated pages.
4. WHEN a User changes the Theme_Preference and saves, THE App SHALL apply the new color scheme within 300 ms without requiring a full page reload.
5. WHEN no Theme_Preference has been saved, THE App SHALL apply the "Light" theme as the default.

---

### Requirement 8: Profile Page — Notification Preferences

**User Story:** As a User, I want to configure my notification preferences, so that I receive only the alerts I care about.

#### Acceptance Criteria

1. THE Profile_Page SHALL display a Notification_Preference toggle for "Enable in-app notifications".
2. WHEN a User changes the Notification_Preference toggle and saves the profile, THE Profile_Store SHALL persist the updated Notification_Preference value.
3. WHILE Notification_Preference is enabled, THE App SHALL display in-app status alerts when a health check transitions from "Healthy" to "Unavailable".
4. WHILE Notification_Preference is disabled, THE App SHALL not display in-app status alerts for health check transitions.
5. WHEN the Profile_Page mounts, THE Profile_Page SHALL reflect the User's persisted Notification_Preference state in the toggle control.

---

### Requirement 9: Profile Data Persistence

**User Story:** As a User, I want my profile data to be reliably saved and retrieved, so that my settings are consistent across sessions and devices.

#### Acceptance Criteria

1. THE Profile_Store SHALL store exactly one profile record per authenticated User, keyed by the User's Cognito identity.
2. WHEN a User saves profile data for the first time, THE Profile_Store SHALL create a new profile record.
3. WHEN a User saves profile data and a record already exists, THE Profile_Store SHALL update the existing record rather than creating a duplicate.
4. WHEN a User's profile record is read, THE Profile_Store SHALL return the Display_Name, Bio, avatar URL, Theme_Preference, and Notification_Preference fields.
5. IF a write to THE Profile_Store fails, THEN THE Profile_Page SHALL display an error message indicating the save was unsuccessful, and the previously persisted data SHALL remain unchanged.
6. THE Profile_Store SHALL enforce that only the owning User can read or write their own profile record.

---

### Requirement 10: Responsive Layout

**User Story:** As a User, I want the App to be usable on both desktop and mobile screen sizes, so that I can access the Dashboard and Profile_Page from any device.

#### Acceptance Criteria

1. WHILE the viewport width is 768 px or greater, THE App SHALL render the Nav as a fixed-width sidebar and the page content in the remaining horizontal space.
2. WHILE the viewport width is less than 768 px, THE App SHALL render the Nav as a top navigation bar and the page content below it in full width.
3. THE Dashboard SHALL arrange Health_Cards in a multi-column grid on viewports 768 px or wider, and in a single-column stack on narrower viewports.
4. THE Profile_Page form SHALL remain fully usable and all controls SHALL be reachable without horizontal scrolling on viewports as narrow as 320 px.
