---
inclusion: always
---

# Amplify Gen 2 Storage & Auth Operations — Standards

Source: https://docs.amplify.aws/react/build-a-backend/storage/
Source: https://docs.amplify.aws/react/build-a-backend/auth/

---

## Storage Operations

### Upload files
```ts
import { uploadData } from "aws-amplify/storage";

// Basic upload
const result = await uploadData({
  path: `avatars/${userId}/${file.name}`,
  data: file,
}).result;
console.log("Uploaded to:", result.path);

// With progress monitoring
const task = uploadData({
  path: `uploads/${file.name}`,
  data: file,
  options: {
    onProgress: ({ transferredBytes, totalBytes }) => {
      if (totalBytes) {
        const pct = Math.round((transferredBytes / totalBytes) * 100);
        setProgress(pct);
      }
    },
  },
});
const result = await task.result;

// Pause / resume / cancel
task.pause();
task.resume();
task.cancel();
```

### Download files
```ts
import { downloadData, getUrl } from "aws-amplify/storage";

// Get a presigned URL (valid 15 min by default)
const { url, expiresAt } = await getUrl({
  path: `avatars/${userId}/avatar.jpg`,
  options: {
    expiresIn: 3600, // seconds
    validateObjectExistence: true, // throws if file doesn't exist
  },
});
// Use url.href in <img src> or <a href>

// Download file data
const { body } = await downloadData({
  path: `avatars/${userId}/avatar.jpg`,
}).result;
const text = await body.text();   // or body.blob() or body.json()
```

### Remove files
```ts
import { remove } from "aws-amplify/storage";

await remove({ path: `avatars/${userId}/old-avatar.jpg` });
```

### List files
```ts
import { list } from "aws-amplify/storage";

const { items } = await list({
  path: `avatars/${userId}/`,
  options: { listAll: true },
});
items.forEach((item) => console.log(item.path, item.size));
```

### Storage path patterns for this project
```ts
// This project uses identity-scoped paths:
// avatars/{entity_id}/* — entity_id = Cognito Identity Pool identity ID

// In AvatarUpload.tsx:
const path = `avatars/${userId}/${file.name}`;
await uploadData({ path, data: file }).result;
```

### File validation before upload
```ts
const MAX_SIZE = 5_242_880; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE) return "File must be 5 MB or smaller";
  if (!ALLOWED_TYPES.includes(file.type)) return "Only JPEG, PNG, or WebP allowed";
  return null;
}
```

### StorageImage UI component (alternative to manual getUrl)
```tsx
import { StorageImage } from "@aws-amplify/ui-react-storage";

<StorageImage
  path={`avatars/${userId}/avatar.jpg`}
  alt="Avatar"
  fallbackSrc="/default-avatar.png"
/>
```

---

## Auth Operations

### Get current user
```ts
import { getCurrentUser } from "aws-amplify/auth";

try {
  const { userId, username, signInDetails } = await getCurrentUser();
  console.log("User ID:", userId);
  console.log("Email:", signInDetails?.loginId);
} catch {
  // User is not signed in
}
```

### Fetch auth session (tokens)
```ts
import { fetchAuthSession } from "aws-amplify/auth";

const session = await fetchAuthSession();
const { tokens, credentials, identityId } = session;

// Access token (JWT)
const accessToken = tokens?.accessToken;
const exp = accessToken?.payload?.exp; // expiry timestamp

// ID token
const idToken = tokens?.idToken;

// Force refresh
const freshSession = await fetchAuthSession({ forceRefresh: true });
```

### Sign out
```ts
import { signOut } from "aws-amplify/auth";

// Global sign out (invalidates all sessions)
await signOut({ global: true });

// Local sign out only
await signOut();
```

### Update user attributes
```ts
import { updateUserAttributes } from "aws-amplify/auth";

await updateUserAttributes({
  userAttributes: {
    email: "new@example.com",
    "custom:displayName": "John Doe",
  },
});
```

### Change password
```ts
import { updatePassword } from "aws-amplify/auth";

await updatePassword({
  oldPassword: "currentPassword",
  newPassword: "newPassword123!",
});
```

### Delete account
```ts
import { deleteUser } from "aws-amplify/auth";

await deleteUser();
```

### MFA setup (TOTP)
```ts
import { setUpTOTP, verifyTOTPSetup } from "aws-amplify/auth";

const totpSetupDetails = await setUpTOTP();
const qrCodeUrl = totpSetupDetails.getSetupUri("MyApp");
// Show QR code to user, then verify:
await verifyTOTPSetup({ code: "123456" });
```

### Listen to auth events
```ts
import { Hub } from "aws-amplify/utils";

const unsubscribe = Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "signedIn":
      console.log("User signed in");
      break;
    case "signedOut":
      console.log("User signed out");
      break;
    case "tokenRefresh":
      console.log("Token refreshed");
      break;
    case "tokenRefresh_failure":
      console.error("Token refresh failed");
      break;
  }
});

// Cleanup
unsubscribe();
```

### useAuthenticator vs direct auth imports
```ts
// In React components — use useAuthenticator hook:
import { useAuthenticator } from "@aws-amplify/ui-react";
const { user, signOut, authStatus } = useAuthenticator((ctx) => [ctx.user, ctx.authStatus]);

// In non-component code (services, utilities) — use direct imports:
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
```

---

## Critical rules

### Storage
1. Always validate file size and MIME type client-side BEFORE calling `uploadData`
2. Use `uploadData(...).result` — the task object has `.pause()`, `.resume()`, `.cancel()`
3. Presigned URLs from `getUrl` expire — do not cache them long-term
4. Multipart upload is automatic for files > 5 MB
5. Incomplete uploads older than 1 hour are auto-cancelled — set S3 lifecycle rules for cleanup

### Auth
1. Use `useAuthenticator` in React components, direct imports in services/utilities
2. `fetchAuthSession` auto-refreshes expired tokens — call it to get fresh tokens
3. `getCurrentUser` throws if not signed in — always wrap in try/catch
4. `signOut({ global: true })` invalidates ALL sessions across devices
5. Never store tokens in localStorage — Amplify manages token storage securely
6. `identityId` from `fetchAuthSession` is the Cognito Identity Pool ID used for S3 paths
