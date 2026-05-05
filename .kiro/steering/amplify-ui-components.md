---
inclusion: always
---

# Amplify UI Components — Standards (@aws-amplify/ui-react v6)

Source: https://ui.docs.amplify.aws/react/connected-components/authenticator

## Authenticator Component

### Correct usage (Gen 2 + Next.js App Router)
```tsx
// app/AuthenticatorWrapper.tsx — "use client" boundary
"use client";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function AuthenticatorWrapper({ children }) {
  return <Authenticator>{children}</Authenticator>;
}
```

### Always import the CSS
```tsx
import "@aws-amplify/ui-react/styles.css";
```
This MUST be in the root layout or a global CSS import. Without it, the Authenticator UI has no styles.

### useAuthenticator hook — correct selector pattern
```tsx
// Subscribe to BOTH user and authStatus to avoid stale state
const { user, signOut, authStatus } = useAuthenticator((ctx) => [
  ctx.user,
  ctx.authStatus,
]);
```
- `authStatus` values: `'configuring'` | `'authenticated'` | `'unauthenticated'`
- Always check `authStatus === 'authenticated'` before rendering protected content
- Never check just `!!user` — it can be truthy briefly during sign-out

### Sign-out — correct reactive pattern
```tsx
// CORRECT: reactive via useEffect watching authStatus
useEffect(() => {
  if (authStatus === "unauthenticated") {
    router.replace("/sign-in");
  }
}, [authStatus, router]);

// Pass signOut directly — do NOT wrap it
<button onClick={signOut}>Sign out</button>

// WRONG: race condition — router fires before session clears
signOut();
router.replace("/sign-in"); // ❌ DO NOT DO THIS
```

### Authenticator customization
```tsx
// Custom form fields
<Authenticator
  formFields={{
    signIn: {
      username: { label: "Email", placeholder: "Enter your email" }
    }
  }}
>
  {({ signOut, user }) => <App />}
</Authenticator>

// Custom components (override header/footer)
<Authenticator
  components={{
    Header: () => <img src="/logo.png" alt="Logo" />,
    Footer: () => <p>© 2025 YourApp</p>,
  }}
/>

// Social providers
<Authenticator socialProviders={["google", "facebook"]} />
```

### Authenticator variation
- Default: inline form
- `variation="modal"`: renders as a modal overlay (used by `withAuthenticator` HOC)

### withAuthenticator HOC — when to use
Only for simple apps where the entire app requires auth. For Next.js App Router with public pages, use the manual `AuthenticatorWrapper` + route group pattern instead.

## Storage UI Components

### StorageImage — display S3 images
```tsx
import { StorageImage } from "@aws-amplify/ui-react-storage";

<StorageImage
  alt="Profile avatar"
  path={`avatars/${userId}/avatar.jpg`}
  fallbackSrc="/default-avatar.png"
/>
```

### FileUploader — upload UI component
```tsx
import { FileUploader } from "@aws-amplify/ui-react-storage";

<FileUploader
  acceptedFileTypes={["image/*"]}
  path={({ identityId }) => `avatars/${identityId}/`}
  maxFileCount={1}
  maxFileSize={5_242_880}
  onUploadSuccess={({ key }) => console.log("Uploaded:", key)}
/>
```
Note: For custom upload UI (like the AvatarUpload component in this project), use `uploadData` from `aws-amplify/storage` directly.

## UI Component Theming
```tsx
import { ThemeProvider, createTheme } from "@aws-amplify/ui-react";

const theme = createTheme({
  name: "my-theme",
  tokens: {
    colors: {
      brand: {
        primary: { value: "#6649ae" },
      },
    },
  },
});

<ThemeProvider theme={theme}>
  <Authenticator />
</ThemeProvider>
```

## Available UI Components (reference)
- `Authenticator` — full auth flow
- `StorageImage` — display S3 images
- `FileUploader` — file upload with progress
- `InAppMessaging` — in-app notifications
- `MapView`, `LocationSearch` — maps (requires Amazon Location Service)
- Primitive components: `Button`, `TextField`, `Card`, `Flex`, `Grid`, `Heading`, `Text`, `Badge`, `Alert`, `Loader`, `Tabs`, `Menu`, `CheckboxField`, `RadioGroupField`, `SelectField`, `SliderField`, `SwitchField`, `PasswordField`, `PhoneNumberField`, `SearchField`, `TextAreaField`

## Important: CSS Modules vs Amplify UI styles
- Amplify UI uses its own CSS variables (e.g., `--amplify-colors-brand-primary`)
- This project uses custom CSS variables (`--bg`, `--fg`, `--accent`, etc.) in `globals.css`
- Do NOT mix them — use Amplify UI variables only for Amplify UI components, project variables for custom components
