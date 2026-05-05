---
inclusion: always
---

# Amplify Gen 2 Backend Implementation Standards

Source: https://docs.amplify.aws/react/build-a-backend/

## Backend File Structure
```
amplify/
├── backend.ts          # Entry point — wires all resources together
├── auth/
│   └── resource.ts     # defineAuth()
├── data/
│   └── resource.ts     # defineData() with schema
├── storage/
│   └── resource.ts     # defineStorage()
└── functions/
    └── myFunction/
        ├── resource.ts # defineFunction()
        └── handler.ts  # Lambda handler
```

## auth/resource.ts — defineAuth
```ts
import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Add social providers:
    // externalProviders: {
    //   google: { clientId: secret("GOOGLE_CLIENT_ID"), clientSecret: secret("GOOGLE_CLIENT_SECRET") },
    //   callbackUrls: ["http://localhost:3000/", "https://yourapp.com/"],
    //   logoutUrls: ["http://localhost:3000/", "https://yourapp.com/"],
    // },
  },
  // MFA:
  // multifactor: { mode: "OPTIONAL", totp: true },
  // User attributes:
  // userAttributes: { profilePicture: { dataType: "String", mutable: true } },
});
```

## data/resource.ts — defineData with schema
```ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Basic model with owner auth
  Todo: a
    .model({
      content: a.string().required(),
      isDone: a.boolean().default(false),
      priority: a.enum(["low", "medium", "high"]),
    })
    .authorization((allow) => [allow.owner()]),

  // Public read, owner write
  Post: a
    .model({
      title: a.string().required(),
      content: a.string(),
      publishedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.owner(),
    ]),

  // Group-based auth
  AdminConfig: a
    .model({ setting: a.string() })
    .authorization((allow) => [allow.groups(["admin"])]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // Enable API key for public access:
    // apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
```

### Field types reference
```ts
a.string()          // String
a.integer()         // Int
a.float()           // Float
a.boolean()         // Boolean
a.date()            // AWSDate (YYYY-MM-DD)
a.time()            // AWSTime
a.datetime()        // AWSDateTime (ISO 8601)
a.timestamp()       // AWSTimestamp (Unix epoch)
a.email()           // AWSEmail
a.url()             // AWSURL
a.phone()           // AWSPhone
a.json()            // AWSJSON
a.ipAddress()       // AWSIPAddress
a.id()              // ID (auto-generated if not provided)
a.enum(["a","b"])   // Enum
a.customType({...}) // Custom type (no auth rules)
a.hasOne(Model)     // 1:1 relationship
a.hasMany(Model)    // 1:many relationship
a.belongsTo(Model)  // Inverse of hasOne/hasMany
a.manyToMany(Model) // Many:many (creates join table)
```

### Authorization strategies
```ts
// Public (API key required in client)
allow.publicApiKey()
allow.publicApiKey().to(["read"])

// Authenticated users (Cognito user pool)
allow.authenticated()
allow.authenticated().to(["read", "create"])

// Owner (current user owns the record)
allow.owner()
allow.owner().to(["read", "update", "delete"])
allow.ownerDefinedIn("customOwnerField")

// Groups
allow.groups(["admin", "moderator"])
allow.groupDefinedIn("groupField")

// Guest (Cognito identity pool unauthenticated)
allow.guest().to(["read"])

// Custom (Lambda authorizer)
allow.custom()
```

## storage/resource.ts — defineStorage
```ts
import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "myStorage",
  access: (allow) => ({
    // Public read, authenticated write
    "public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
    // Per-user private files (entity_id = Cognito Identity Pool ID)
    "private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
    // Protected: owner write, all authenticated read
    "protected/{entity_id}/*": [
      allow.authenticated.to(["read"]),
      allow.entity("identity").to(["write", "delete"]),
    ],
  }),
});
```

## functions/resource.ts — defineFunction
```ts
import { defineFunction } from "@aws-amplify/backend";

export const myFunction = defineFunction({
  name: "my-function",
  entry: "./handler.ts",
  environment: {
    MY_ENV_VAR: "value",
    // Use secrets for sensitive values:
    // API_KEY: secret("MY_API_KEY"),
  },
  timeoutSeconds: 30,
  memoryMB: 512,
});
```

### Lambda handler pattern
```ts
// amplify/functions/myFunction/handler.ts
import type { Handler } from "aws-lambda";

export const handler: Handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  return { statusCode: 200, body: JSON.stringify({ message: "OK" }) };
};
```

### Connecting function to data (custom resolver)
```ts
// In data/resource.ts schema:
const schema = a.schema({
  sendEmail: a
    .mutation()
    .arguments({ to: a.string(), subject: a.string() })
    .returns(a.boolean())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(sendEmailFunction)),
});
```

## backend.ts — wiring everything together
```ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { storage } from "./storage/resource.js";
import { myFunction } from "./functions/myFunction/resource.js";

defineBackend({
  auth,
  data,
  storage,
  myFunction,
});
```

## Secrets management
```ts
import { secret } from "@aws-amplify/backend";

// In resource definitions:
environment: {
  STRIPE_SECRET_KEY: secret("STRIPE_SECRET_KEY"),
}

// Set secrets via CLI:
// npx ampx sandbox secret set STRIPE_SECRET_KEY
```

## Environment-specific configuration
```ts
// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";

const backend = defineBackend({ auth, data, storage });

// Access underlying CDK constructs for advanced config:
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.emailConfiguration = {
  emailSendingAccount: "DEVELOPER",
  sourceArn: "arn:aws:ses:...",
};
```

## Critical rules
1. Always use `.js` extension in imports within `amplify/` directory (TypeScript ESM requirement)
2. Never use `amplify push` — use `npx ampx sandbox` for dev
3. `amplify_outputs.json` is auto-generated — never edit manually, never commit
4. All models get automatic `id`, `createdAt`, `updatedAt` fields — do not define them manually
5. Use `a.string().required()` not `a.string()!` for required fields
6. Owner auth automatically adds an `owner` field — do not define it in the schema
