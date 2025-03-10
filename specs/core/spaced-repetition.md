# Spaced Repetition System Specification

## Overview

The Flag Trainer app uses a spaced repetition system (SRS) based on the SuperMemo-2 algorithm to optimize learning efficiency. This specification details the algorithm implementation, data flow, client-side operation, and synchronization mechanisms to support both anonymous and authenticated users.

## Core Algorithm

### SuperMemo-2 Implementation

The implementation follows the SuperMemo-2 algorithm with adaptations for binary (correct/incorrect) feedback rather than the original 0-5 quality ratings.

```typescript
/**
 * Calculate next review date and interval based on SuperMemo-2 algorithm
 *
 * @param isCorrect Whether the answer was correct
 * @param previousEaseFactor Previous ease factor (minimum 1.3)
 * @param previousInterval Previous interval in days
 * @returns New ease factor, interval, and next review date
 */
export function calculateNextReview(
  isCorrect: boolean,
  previousEaseFactor: number,
  previousInterval: number,
): ReviewResult {
  // Convert binary input to quality rating (0-5 scale)
  // 0: complete blackout
  // 5: perfect recall with no hesitation
  const qualityRating = isCorrect ? 4 : 1;

  // Constrain ease factor minimum to 1.3
  const minEaseFactor = 1.3;

  // Calculate new ease factor (EF)
  // EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  let newEaseFactor =
    previousEaseFactor +
    (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
  newEaseFactor = Math.max(minEaseFactor, newEaseFactor);

  // Calculate new interval
  let newInterval: number;

  if (!isCorrect) {
    // If incorrect, reset to a shorter interval (1-3 days based on previous experience)
    newInterval = Math.max(1, Math.min(3, Math.floor(previousInterval * 0.5)));
  } else if (previousInterval === 0) {
    // First successful review
    newInterval = 1;
  } else if (previousInterval === 1) {
    // Second successful review
    newInterval = 6;
  } else {
    // Subsequent successful reviews
    newInterval = Math.round(previousInterval * newEaseFactor);
  }

  // Cap maximum interval at 365 days to prevent excessively long intervals
  newInterval = Math.min(365, newInterval);

  // Calculate next review date
  const now = new Date();
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate,
  };
}
```

### Performance Mapping

Since our quiz interface provides binary feedback (correct/incorrect) rather than the 0-5 quality scale used by SuperMemo-2, we map user performance as follows:

| User Answer | Quality Rating | Description                            |
| ----------- | -------------- | -------------------------------------- |
| Correct     | 4              | Correct recall with some effort        |
| Incorrect   | 1              | Incorrect recall with some familiarity |

This mapping provides a balance between aggressive spacing for items that are well-known and ensuring items that need more review receive it.

### Initial Values

For new items (flags) being introduced to the learning system:

- Initial ease factor: 2.5 (standard SuperMemo-2 default)
- Initial interval: 0 (indicating first exposure)
- Next review date: Immediate (current date/time)

## Client-Side Implementation

### LocalStorage Data Structure

```typescript
interface LocalStorageProgressData {
  version: number; // For schema versioning
  userId?: string; // Optional, present if user has logged in
  guestId: string; // UUID generated for anonymous users
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
}
```

### LocalStorage Operations

```typescript
// Initialize storage if not present
function initializeLocalStorage(): void {
  const existingData = localStorage.getItem("flagTrainerProgress");

  if (!existingData) {
    const newData: LocalStorageProgressData = {
      version: 1,
      guestId: generateUUID(),
      flags: {},
    };

    localStorage.setItem("flagTrainerProgress", JSON.stringify(newData));
  }
}

// Update progress for a flag
function updateLocalProgress(flagCode: string, isCorrect: boolean): void {
  const data = JSON.parse(
    localStorage.getItem("flagTrainerProgress"),
  ) as LocalStorageProgressData;

  // Create entry if it doesn't exist
  if (!data.flags[flagCode]) {
    data.flags[flagCode] = {
      correctCount: 0,
      incorrectCount: 0,
      lastSeen: Date.now(),
      nextReviewDate: Date.now(),
      easeFactor: 2.5,
      interval: 0,
      needsSync: true,
    };
  }

  // Update counts
  if (isCorrect) {
    data.flags[flagCode].correctCount++;
  } else {
    data.flags[flagCode].incorrectCount++;
  }

  // Calculate new review schedule
  const result = calculateNextReview(
    isCorrect,
    data.flags[flagCode].easeFactor,
    data.flags[flagCode].interval,
  );

  // Update local data
  data.flags[flagCode].easeFactor = result.easeFactor;
  data.flags[flagCode].interval = result.interval;
  data.flags[flagCode].nextReviewDate = result.nextReviewDate.getTime();
  data.flags[flagCode].lastSeen = Date.now();
  data.flags[flagCode].needsSync = true;

  // Save updated data
  localStorage.setItem("flagTrainerProgress", JSON.stringify(data));
}

// Get next flags due for review
function getNextDueFlags(count: number = 10): string[] {
  const data = JSON.parse(
    localStorage.getItem("flagTrainerProgress"),
  ) as LocalStorageProgressData;
  const now = Date.now();

  // Get flags that are due and sort by due date (oldest first)
  const dueFlags = Object.entries(data.flags)
    .filter(([_, info]) => info.nextReviewDate <= now)
    .sort((a, b) => a[1].nextReviewDate - b[1].nextReviewDate)
    .map(([code, _]) => code);

  return dueFlags.slice(0, count);
}

// Get mixture of new and review flags
function getMixedLearningSet(
  count: number = 10,
  newRatio: number = 0.3,
): Promise<Flag[]> {
  const data = JSON.parse(
    localStorage.getItem("flagTrainerProgress"),
  ) as LocalStorageProgressData;
  const dueFlags = getNextDueFlags();

  // Calculate how many new flags to include
  const newCount = Math.max(
    0,
    Math.min(count - dueFlags.length, Math.round(count * newRatio)),
  );

  // Get already seen flag codes
  const seenFlagCodes = new Set(Object.keys(data.flags));

  // Get new flags not seen before
  const getNewFlags = async () => {
    // Usually this would fetch from API, but for client-side only, we'll use the static flag data
    const allFlags = getAllFlags(); // Function that returns static flag data
    const newFlags = allFlags
      .filter((flag) => !seenFlagCodes.has(flag.code))
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, newCount);

    return newFlags;
  };

  // Get review flags
  const getReviewFlags = async () => {
    const reviewCount = count - newCount;
    const reviewFlagCodes = dueFlags.slice(0, reviewCount);

    // Get full flag data for each code
    const reviewFlags = reviewFlagCodes.map((code) => getFlagByCode(code));
    return reviewFlags;
  };

  // Combine and return
  return Promise.all([getNewFlags(), getReviewFlags()]).then(
    ([newFlags, reviewFlags]) => {
      const combined = [...reviewFlags, ...newFlags];
      return combined.sort(() => 0.5 - Math.random()); // Shuffle combined set
    },
  );
}
```

## Server Synchronization

### Synchronization Flow

1. **Anonymous to Authenticated**:
   When a user signs up or logs in after using the app anonymously, their local progress data is submitted to the server with their guest ID.

2. **Regular Synchronization**:
   When an authenticated user makes progress updates, changes are stored locally and then synced with the server:

   - Immediately if online
   - Queued for later sync if offline

3. **Conflict Resolution**:
   If there are conflicts between local and server data (e.g., user logs in on multiple devices):
   - For the same flag/date combination, take the entry with the most recent `lastSeen` timestamp
   - If identical timestamps, prefer server data

### Sync API Interface

```typescript
// Sync progress to server
async function syncProgressToServer(): Promise<boolean> {
  const data = JSON.parse(
    localStorage.getItem("flagTrainerProgress"),
  ) as LocalStorageProgressData;

  // Only sync if there are changes
  const flagsToSync = Object.entries(data.flags)
    .filter(([_, info]) => info.needsSync)
    .map(([code, info]) => ({
      code,
      ...info,
    }));

  if (flagsToSync.length === 0) {
    return true; // Nothing to sync
  }

  const payload = {
    guestId: data.guestId,
    userId: data.userId, // May be undefined for anonymous users
    lastSyncedAt: data.lastSyncedAt,
    flags: flagsToSync,
  };

  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Update local storage to mark synced
      const updatedData = { ...data };

      flagsToSync.forEach((flag) => {
        updatedData.flags[flag.code].needsSync = false;
      });

      updatedData.lastSyncedAt = Date.now();
      localStorage.setItem("flagTrainerProgress", JSON.stringify(updatedData));

      return true;
    }

    return false;
  } catch (error) {
    console.error("Sync failed:", error);
    return false;
  }
}

// Merge server data with local data
function mergeServerData(serverData: any): void {
  const localData = JSON.parse(
    localStorage.getItem("flagTrainerProgress"),
  ) as LocalStorageProgressData;

  // If user just logged in, update userId
  if (serverData.userId && !localData.userId) {
    localData.userId = serverData.userId;
  }

  // Merge flag data
  for (const [code, serverInfo] of Object.entries(serverData.flags)) {
    const localInfo = localData.flags[code];

    // If flag doesn't exist locally or server data is newer
    if (!localInfo || serverInfo.lastSeen > localInfo.lastSeen) {
      localData.flags[code] = {
        ...serverInfo,
        needsSync: false,
      };
    }
  }

  localData.lastSyncedAt = Date.now();
  localStorage.setItem("flagTrainerProgress", JSON.stringify(localData));
}
```

## Anonymous to Authenticated Transition

### Sign-Up Process with Progress Migration

1. When a user signs up or logs in for the first time, check if local progress data exists
2. If local progress exists, submit it to the server along with new user credentials
3. Server merges anonymous progress with the new user account
4. Return synchronized data to client

```typescript
// Example signup flow with progress migration
async function signUpWithProgressMigration(
  email: string,
  password: string,
): Promise<User> {
  const progressData = JSON.parse(localStorage.getItem("flagTrainerProgress"));

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      progressData: progressData
        ? {
            guestId: progressData.guestId,
            flags: progressData.flags,
          }
        : undefined,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Update local storage with user ID and any merged server data
    if (progressData) {
      progressData.userId = data.user.id;
      progressData.lastSyncedAt = Date.now();

      // Mark all as synced since we just migrated
      Object.keys(progressData.flags).forEach((code) => {
        progressData.flags[code].needsSync = false;
      });

      localStorage.setItem("flagTrainerProgress", JSON.stringify(progressData));
    }

    return data.user;
  } else {
    throw new Error(data.message || "Signup failed");
  }
}
```

## Performance Considerations

### Optimizing Client-Side Operations

1. **Indexing**:

   - Use `flagCode` as the primary key in localStorage
   - Sort operations happen in memory for faster retrieval

2. **Batch Processing**:

   - Sync operations are batched to reduce API calls
   - Only changed flag data is sent during sync

3. **Data Pruning**:
   - Consider adding logic to remove extremely mature items (interval > 180 days) from regular review to reduce data size
   - Provide user option to "reset progress" for specific continents/regions

## Offline Support

### Handling Connectivity Issues

1. **Offline Detection**:

   ```typescript
   const isOnline = (): boolean => navigator.onLine;
   ```

2. **Sync Queue**:

   - Maintain a sync queue for failed sync attempts
   - Retry on reconnection using `navigator.onLine` event listeners

3. **Reconnection Handling**:
   ```typescript
   window.addEventListener("online", () => {
     syncProgressToServer();
   });
   ```

This specification provides a comprehensive approach to implementing the spaced repetition system with client-side support for both anonymous and authenticated users.
