# Error Handling Guidelines

## Centralized Logging

Use the centralized logger from `@/utils/logger` instead of direct console calls:

```typescript
import { logger } from "@/utils/logger";

// Before
console.warn("[Component] Something went wrong:", error);

// After
logger.warn("Something went wrong", { component: "Component", error });
```

## Error Handling Patterns

### 1. UI Operations (Hooks, Components)

**Pattern**: Catch errors, log them, show user-friendly message

```typescript
const createItem = async (name: string) => {
  try {
    await pb.collection("items").create({ name });
    logger.info("Item created", { component: "useItems", name });
  } catch (error) {
    logger.error("Failed to create item", error, { component: "useItems" });
    toast.error("Could not create item. Please try again.");
    throw error; // Re-throw for caller to handle if needed
  }
};
```

### 2. Background Operations (Sync, Location Task)

**Pattern**: Catch errors, log them, don't crash the app

```typescript
try {
  await syncOperation();
} catch (error) {
  logger.warn("Sync failed, will retry later", {
    component: "useSync",
    error: error instanceof Error ? error.message : String(error),
  });
  // Don't throw - background operations should be resilient
}
```

### 3. Observable/Subscription Errors

**Pattern**: Log but don't interrupt the stream

```typescript
const subscription = observable.subscribe({
  next: (data) => setData(data),
  error: (err) => {
    logger.warn("Observable error", {
      component: "useObservable",
      error: err,
    });
  },
});
```

### 4. Critical Initialization Errors

**Pattern**: Log and prevent app from starting in broken state

```typescript
try {
  const db = await initializeDatabase();
} catch (error) {
  logger.error("Database initialization failed", error, {
    component: "DatabaseProvider",
  });
  throw error; // Let error boundary catch this
}
```

## Log Levels

- **`debug`**: Development-only detailed info (stripped in production)
- **`info`**: Important events (user actions, successful operations)
- **`warn`**: Recoverable issues (failed background sync, network errors)
- **`error`**: Critical failures (database errors, unhandled exceptions)

## What to Log

### ✅ DO Log:
- Failed operations with context
- Unexpected states
- Recovery actions
- Performance issues

### ❌ DON'T Log:
- Passwords or tokens
- Invite codes
- User PII in production
- Successful operations (unless needed for debugging)

## Production Integration

When integrating error tracking (Sentry, etc.):

1. Uncomment the TODO sections in `logger.ts`
2. Add error tracking SDK to dependencies
3. Configure error tracking in app initialization
4. Test that errors are captured correctly

## Migration Path

Gradually replace `console.warn/error` calls with `logger.warn/error`:

```bash
# Find all console.warn calls
grep -r "console.warn" src/

# Replace with logger.warn
# Add context object with component name and relevant data
```

Priority order:
1. Critical paths: sync.ts, locationTask.ts, auth flows
2. User-facing operations: hooks (useLists, useListItems, etc.)
3. UI components: screens, modals
4. Background operations: realtime, observers
