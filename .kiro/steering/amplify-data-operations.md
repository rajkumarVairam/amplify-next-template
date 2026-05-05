---
inclusion: always
---

# Amplify Gen 2 Data Operations — Standards

Source: https://docs.amplify.aws/react/build-a-backend/data/

## Client setup
```ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// Call per function — not at module level
// (module-level breaks Vitest mock isolation)
const client = generateClient<Schema>();
```

## CRUD operations

### Create
```ts
const { data: newTodo, errors } = await client.models.Todo.create({
  content: "Buy groceries",
  isDone: false,
});
// Note: do NOT pass id, createdAt, updatedAt — Amplify sets these automatically
if (errors) console.error(errors);
```

### Read — get single item
```ts
const { data: todo, errors } = await client.models.Todo.get({ id: "abc123" });
```

### Read — list items (owner-scoped automatically)
```ts
// With owner auth: list() returns ONLY the current user's records
// NEVER manually filter by owner field
const { data: todos, errors } = await client.models.Todo.list();

// With pagination
const { data: todos, nextToken } = await client.models.Todo.list({
  limit: 10,
  nextToken: previousNextToken, // undefined for first page
});
```

### Filter list queries
```ts
const { data: todos } = await client.models.Todo.list({
  filter: {
    isDone: { eq: false },
    // Compound filters:
    // and: [{ isDone: { eq: false } }, { priority: { eq: "high" } }]
    // or: [{ priority: { eq: "high" } }, { priority: { eq: "medium" } }]
    // not: { isDone: { eq: true } }
  },
});
```

### Filter operators
```ts
eq, ne, lt, le, gt, ge,     // comparison
contains, notContains,       // string contains
beginsWith,                  // string prefix
between,                     // range: { between: [1, 10] }
attributeExists,             // field exists: { attributeExists: true }
```

### Update
```ts
const { data: updated, errors } = await client.models.Todo.update({
  id: "abc123",
  isDone: true,
  // Only pass fields you want to change
  // updatedAt is set automatically — do NOT pass it
});
```

### Delete
```ts
const { data: deleted, errors } = await client.models.Todo.delete({
  id: "abc123",
});
// For many-to-many: delete join table records BEFORE deleting the main records
```

### Cancel requests
```ts
const promise = client.models.Todo.list();
// Later:
client.cancel(promise, "Cancelled by user");
```

## Real-time subscriptions
```ts
// Subscribe to all creates
const sub = client.models.Todo.onCreate().subscribe({
  next: (todo) => console.log("Created:", todo),
  error: (err) => console.error(err),
});

// Subscribe to updates for a specific item
const sub = client.models.Todo.onUpdate({
  filter: { id: { eq: "abc123" } },
}).subscribe({ next: (todo) => setTodo(todo) });

// Always unsubscribe on cleanup
useEffect(() => {
  const sub = client.models.Todo.onCreate().subscribe(...);
  return () => sub.unsubscribe();
}, []);
```

## observeQuery — list + real-time combined
```ts
// Best for lists that need real-time updates
const sub = client.models.Todo.observeQuery().subscribe({
  next: ({ items, isSynced }) => {
    setTodos(items);
  },
});
```

## Custom selection set (fetch only needed fields)
```ts
const { data } = await client.models.Todo.list({
  selectionSet: ["id", "content", "isDone"],
});
// TypeScript infers the return type based on selectionSet
```

## TypeScript type helpers
```ts
import type { Schema } from "@/amplify/data/resource";

// Get the type of a model
type Todo = Schema["Todo"]["type"];

// With custom selection set
import type { SelectionSet } from "aws-amplify/data";
type TodoSummary = SelectionSet<Schema["Todo"]["type"], ["id", "content"]>;
```

## Authorization mode overrides
```ts
// Per-client override
const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

// Per-request override
const { data } = await client.models.Post.list({
  authMode: "apiKey",
});
```

## Relationships
```ts
// Schema definition
const schema = a.schema({
  Post: a.model({
    title: a.string().required(),
    comments: a.hasMany("Comment", "postId"),
  }),
  Comment: a.model({
    content: a.string().required(),
    postId: a.id(),
    post: a.belongsTo("Post", "postId"),
  }),
});

// Querying with relationships
const { data: post } = await client.models.Post.get(
  { id: "abc123" },
  { selectionSet: ["id", "title", "comments.*"] }
);
// post.comments is an array of Comment objects
```

## Error handling pattern
```ts
// Errors are returned in the errors field — NOT thrown as exceptions
const { data, errors } = await client.models.Todo.create({ content: "..." });

if (errors && errors.length > 0) {
  // Handle errors
  throw new Error(errors[0].message);
}

if (!data) {
  throw new Error("No data returned");
}
```

## Critical rules
1. `list()` with owner auth returns ONLY the current user's records — never filter by `owner` manually
2. Errors are in the `errors` field, not thrown — always check `errors` after every operation
3. Do NOT pass `id`, `createdAt`, `updatedAt` to `create()` — Amplify sets them automatically
4. Do NOT pass `updatedAt` to `update()` — Amplify sets it automatically
5. For many-to-many: delete join table records before deleting parent records
6. Always unsubscribe from subscriptions in useEffect cleanup
7. `generateClient()` per function call — not at module level (Vitest mock isolation)
