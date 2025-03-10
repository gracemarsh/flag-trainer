# Data Synchronization Specification

## Introduction

This document outlines the data synchronization strategy for Flag Trainer, specifically addressing how progress data moves between local storage (for anonymous/guest users) and server-based storage (for authenticated users). This specification clarifies how user progress transitions seamlessly between guest and authenticated states.

## Synchronization Workflow

### 1. Guest Mode (Default Experience)

- On first visit, each user is automatically assigned a unique Guest ID (UUID) stored in local storage
- User progress, including flag learning data and competition scores, is stored locally
- No authentication is required to use core application features
- The spaced repetition system operates fully on client-side local storage

### 2. Account Creation / Sign-In Synchronization

When a guest user creates an account or signs in to an existing account:

1. **Data Migration**: Local progress data is automatically sent to the server
2. **Merging Strategy**:
   - For new accounts: All local data becomes the initial server data
   - For existing accounts: Server and local data are merged with a conflict resolution strategy
3. **Local Storage Update**: The local storage record is updated with:
   - The user's ID from the authentication system
   - A timestamp of the last synchronization
   - Flags marking all data as synchronized

```typescript
// Example implementation - Account creation with data migration
async function signUp(email: string, password: string): Promise<User> {
  // Get local progress data to migrate
  const progressData = getProgressDataFromLocalStorage();

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      // Include local progress data in signup payload
      progressData: progressData
        ? {
            guestId: progressData.guestId,
            flags: progressData.flags,
            // Other data like competition scores
          }
        : undefined,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Update local storage with user ID and sync info
    if (progressData) {
      progressData.userId = data.user.id;
      progressData.lastSyncedAt = Date.now();

      // Mark all local data as synced with server
      Object.keys(progressData.flags).forEach((code) => {
        progressData.flags[code].needsSync = false;
      });

      saveProgressDataToLocalStorage(progressData);
    }

    return data.user;
  } else {
    throw new Error(data.message || "Signup failed");
  }
}
```

### 3. Ongoing Synchronization for Authenticated Users

After authentication, progress data synchronization happens:

1. **On flag interaction**: When users answer questions, data is updated locally first
2. **Immediate sync attempt**: If online, changes sync to server immediately
3. **Background sync**: If offline, changes are queued and synced when connection is restored
4. **Periodic sync**: Background sync occurs periodically to ensure data consistency

```typescript
// Example: Updating flag progress and syncing
function updateFlagProgress(flagCode: string, isCorrect: boolean) {
  // Update local data first
  const localData = getProgressDataFromLocalStorage();

  // Update flag progress locally (implementation details omitted)
  // ...

  // Mark as needing sync
  localData.flags[flagCode].needsSync = true;
  saveProgressDataToLocalStorage(localData);

  // Try to sync if online
  if (navigator.onLine && localData.userId) {
    syncProgressToServer();
  }
}
```

### 4. Conflict Resolution Strategy

When synchronizing data between multiple devices or after offline usage:

1. **Flag-level resolution**: Each flag's progress is resolved independently
2. **Timestamp-based resolution**: For each flag, the record with the most recent `lastSeen` timestamp wins
3. **Merge counters**: Correct/incorrect counters are merged by taking the maximum value from each source
4. **Server authority**: In case of identical timestamps, server data takes precedence

```typescript
// Example conflict resolution function
function resolveConflicts(localData, serverData) {
  const mergedData = { ...serverData };

  // For each flag in local data
  Object.entries(localData.flags).forEach(([code, localFlag]) => {
    const serverFlag = serverData.flags[code];

    // If server has no data for this flag, use local data
    if (!serverFlag) {
      mergedData.flags[code] = localFlag;
      return;
    }

    // If local data is more recent, use local values
    if (localFlag.lastSeen > serverFlag.lastSeen) {
      mergedData.flags[code] = {
        ...serverFlag,
        ...localFlag,
        // Ensure we keep the needsSync state
        needsSync: serverFlag.needsSync || localFlag.needsSync,
      };
    }

    // Use maximum values for counters regardless of recency
    mergedData.flags[code].correctCount = Math.max(
      localFlag.correctCount,
      serverFlag.correctCount,
    );
    mergedData.flags[code].incorrectCount = Math.max(
      localFlag.incorrectCount,
      serverFlag.incorrectCount,
    );
  });

  return mergedData;
}
```

## Technical Implementation

### Local Storage Schema

```typescript
interface LocalStorageProgressData {
  version: number; // Schema version for future-proofing
  guestId: string; // UUID for anonymous users
  userId?: string; // Present if user has authenticated
  lastSyncedAt?: number; // Timestamp of last server sync
  flags: {
    [flagCode: string]: {
      correctCount: number;
      incorrectCount: number;
      lastSeen: number; // Timestamp
      nextReviewDate: number; // Timestamp
      easeFactor: number;
      interval: number; // In days
      needsSync: boolean; // Flag to indicate changes since last sync
    };
  };
  // Other data like competition scores and settings
  // ...
}
```

### API Endpoints for Synchronization

1. **Progress Sync Endpoint**

   - `POST /api/progress/sync`
   - Handles bidirectional sync between client and server
   - Receives modified flag data from client
   - Returns merged data if server has newer information

2. **Account Creation with Migration**

   - `POST /api/auth/signup`
   - Accepts optional progress data parameter
   - Creates user account and migrates provided data

3. **Account Login with Sync**
   - `POST /api/auth/signin`
   - After successful authentication, triggers sync operation

## Offline Support

The application fully supports offline usage with these mechanisms:

1. **Service Worker**: Caches static assets and API responses
2. **Background Sync API**: Registers sync tasks for when connectivity is restored
3. **Online/Offline Detection**:
   ```javascript
   window.addEventListener("online", syncProgressToServer);
   window.addEventListener("offline", () => {
     // Update UI to show offline status
   });
   ```

## Performance Considerations

1. **Sync Throttling**: Limit sync frequency to avoid excessive API calls
2. **Batch Updates**: Group multiple flag updates into single sync operations
3. **Selective Syncing**: Only send flags marked with `needsSync = true`
4. **Data Pruning**: Implement strategies to prevent unlimited growth of local storage

## Security Considerations

1. **Guest ID Validation**: Server validates guest IDs against patterns to prevent spoofing
2. **Rate Limiting**: Sync endpoints are rate-limited to prevent abuse
3. **Data Validation**: All synced data is validated against expected schemas

## Conclusion

This synchronization strategy ensures that Flag Trainer provides a seamless experience between guest and authenticated usage. Users can start learning immediately without an account, and later create an account to preserve their progress across devices without any data loss.
