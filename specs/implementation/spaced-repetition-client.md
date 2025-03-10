# Spaced Repetition Client-Side Implementation

## Overview

This document outlines the client-side implementation of the spaced repetition system for the Flag Trainer application. It describes the architecture, state management, storage strategy, and offline capabilities required to provide a seamless learning experience for both anonymous and authenticated users.

## Architecture

### Component Structure

```
src/
└── lib/
    ├── spaced-repetition/
    │   ├── algorithm.ts         # SuperMemo-2 implementation
    │   ├── storage.ts           # LocalStorage management
    │   ├── sync.ts              # Server synchronization
    │   └── hooks.ts             # React hooks for components
    └── components/
        ├── SpacedLearningDashboard.tsx
        ├── SpacedLearningSession.tsx
        ├── ProgressStats.tsx
        └── ReviewScheduleDisplay.tsx
```

### Dependency Graph

```
+-------------------+      +-------------------+
| SpacedLearningSession <--+ QuickLearningSession
+-------------------+      +-------------------+
         |                          |
         v                          v
+-------------------+      +-------------------+
| algorithm.ts      |      | FlagImage.tsx     |
+-------------------+      +-------------------+
         |
         v
+-------------------+      +-------------------+
| storage.ts        +----> | sync.ts           |
+-------------------+      +-------------------+
```

## Algorithm Implementation

The SuperMemo-2 algorithm is implemented in `algorithm.ts`:

```typescript
// src/lib/spaced-repetition/algorithm.ts

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review date based on SuperMemo-2 algorithm
 */
export function calculateNextReview(
  isCorrect: boolean,
  previousEaseFactor: number,
  previousInterval: number,
): ReviewResult {
  // Convert binary input to quality rating
  const qualityRating = isCorrect ? 4 : 1;

  // Constrain ease factor minimum
  const minEaseFactor = 1.3;

  // Calculate new ease factor (EF)
  let newEaseFactor =
    previousEaseFactor +
    (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
  newEaseFactor = Math.max(minEaseFactor, newEaseFactor);

  // Calculate new interval
  let newInterval: number;

  if (!isCorrect) {
    // If incorrect, reset to a shorter interval
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

  // Cap maximum interval at 365 days
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

## LocalStorage Management

The storage manager handles all local data operations:

```typescript
// src/lib/spaced-repetition/storage.ts

import { v4 as uuidv4 } from "uuid";
import { calculateNextReview } from "./algorithm";

export interface FlagProgress {
  correctCount: number;
  incorrectCount: number;
  lastSeen: number; // Timestamp
  nextReviewDate: number; // Timestamp
  easeFactor: number;
  interval: number; // In days
  needsSync: boolean; // Flag to indicate changes since last sync
}

export interface LocalStorageProgressData {
  version: number;
  userId?: string;
  guestId: string;
  lastSyncedAt?: number;
  flags: {
    [flagCode: string]: FlagProgress;
  };
}

export const STORAGE_KEY = "flagTrainerProgress";

// Initialize storage
export function initializeStorage(): void {
  const existingData = localStorage.getItem(STORAGE_KEY);

  if (!existingData) {
    const newData: LocalStorageProgressData = {
      version: 1,
      guestId: uuidv4(),
      flags: {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }
}

// Get all progress data
export function getProgressData(): LocalStorageProgressData {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    initializeStorage();
    return getProgressData();
  }
  return JSON.parse(data);
}

// Update flag progress
export function updateFlagProgress(
  flagCode: string,
  isCorrect: boolean,
): FlagProgress {
  const data = getProgressData();

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

  // Update progress data
  data.flags[flagCode].easeFactor = result.easeFactor;
  data.flags[flagCode].interval = result.interval;
  data.flags[flagCode].nextReviewDate = result.nextReviewDate.getTime();
  data.flags[flagCode].lastSeen = Date.now();
  data.flags[flagCode].needsSync = true;

  // Save updated data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data.flags[flagCode];
}

// Get flags due for review
export function getDueFlags(count: number = 10): string[] {
  const data = getProgressData();
  const now = Date.now();

  // Get flags that are due for review
  const dueFlags = Object.entries(data.flags)
    .filter(([_, info]) => info.nextReviewDate <= now)
    .sort((a, b) => a[1].nextReviewDate - b[1].nextReviewDate)
    .map(([code]) => code);

  return dueFlags.slice(0, count);
}

// Update user ID (after authentication)
export function updateUserId(userId: string): void {
  const data = getProgressData();
  data.userId = userId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Mark flags as synced
export function markFlagsAsSynced(flagCodes: string[]): void {
  const data = getProgressData();

  for (const code of flagCodes) {
    if (data.flags[code]) {
      data.flags[code].needsSync = false;
    }
  }

  data.lastSyncedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

## Server Synchronization

The sync manager handles communication with the server:

```typescript
// src/lib/spaced-repetition/sync.ts

import { getProgressData, markFlagsAsSynced } from "./storage";

// Flags that need syncing
export function getUnsyncedFlags() {
  const data = getProgressData();

  return Object.entries(data.flags)
    .filter(([_, info]) => info.needsSync)
    .map(([code, info]) => ({
      code,
      ...info,
    }));
}

// Sync with server
export async function syncWithServer(): Promise<boolean> {
  const flagsToSync = getUnsyncedFlags();

  if (flagsToSync.length === 0) {
    return true; // Nothing to sync
  }

  const data = getProgressData();

  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(data.userId
          ? {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }
          : {}),
      },
      body: JSON.stringify({
        guestId: data.guestId,
        userId: data.userId,
        lastSyncedAt: data.lastSyncedAt,
        flags: flagsToSync,
      }),
    });

    if (response.ok) {
      // Mark all synced flags
      markFlagsAsSynced(flagsToSync.map((f) => f.code));
      return true;
    }

    return false;
  } catch (error) {
    console.error("Sync failed:", error);
    return false;
  }
}

// Auto-sync when online
export function setupAutoSync() {
  // Sync on page load if online
  if (navigator.onLine) {
    syncWithServer();
  }

  // Sync when coming back online
  window.addEventListener("online", () => {
    syncWithServer();
  });
}

// Sync on auth state change
export function syncOnAuthChange(userId: string | null) {
  if (userId) {
    syncWithServer();
  }
}
```

## React Hooks

Custom hooks for components to use the spaced repetition system:

```typescript
// src/lib/spaced-repetition/hooks.ts

import { useState, useEffect, useCallback } from "react";
import { getAllFlags, getFlagByCode } from "@/data/flags";
import { getProgressData, updateFlagProgress, getDueFlags } from "./storage";
import { syncWithServer } from "./sync";
import { Flag } from "@/lib/types";

// Hook for spaced learning session
export function useSpacedLearningSession(
  sessionSize: number = 10,
  newRatio: number = 0.3,
  continent?: string,
) {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFlags() {
      try {
        setLoading(true);

        // Get due flags
        const dueFlags = getDueFlags();

        // Get all static flag data
        const allFlags = getAllFlags();

        // Filter by continent if specified
        const filteredFlags = continent
          ? allFlags.filter((f) => f.continent === continent)
          : allFlags;

        // Get flags already seen
        const progressData = getProgressData();
        const seenFlagCodes = new Set(Object.keys(progressData.flags));

        // Calculate how many new flags to include
        const dueCount = dueFlags.length;
        const newCount = Math.max(
          0,
          Math.min(sessionSize - dueCount, Math.round(sessionSize * newRatio)),
        );

        // Get new flags not seen before
        const newFlags = filteredFlags
          .filter((flag) => !seenFlagCodes.has(flag.code))
          .sort(() => 0.5 - Math.random())
          .slice(0, newCount);

        // Get due review flags
        const reviewFlags = dueFlags
          .slice(0, sessionSize - newCount)
          .map((code) => getFlagByCode(code))
          .filter(Boolean) as Flag[];

        // Combine and shuffle
        const combined = [...reviewFlags, ...newFlags];
        const shuffled = combined.sort(() => 0.5 - Math.random());

        setFlags(shuffled);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load flags"),
        );
      } finally {
        setLoading(false);
      }
    }

    loadFlags();
  }, [sessionSize, newRatio, continent]);

  // Record answer and update progress
  const recordAnswer = useCallback((flagCode: string, isCorrect: boolean) => {
    // Update local storage
    const updatedProgress = updateFlagProgress(flagCode, isCorrect);

    // Try to sync if online
    if (navigator.onLine) {
      syncWithServer().catch(console.error);
    }

    return updatedProgress;
  }, []);

  return { flags, loading, error, recordAnswer };
}

// Hook for progress stats
export function useProgressStats() {
  const [stats, setStats] = useState({
    totalFlags: 0,
    flagsSeen: 0,
    correctCount: 0,
    incorrectCount: 0,
    masteredCount: 0,
    dueCount: 0,
  });

  useEffect(() => {
    const data = getProgressData();
    const now = Date.now();
    const flagEntries = Object.entries(data.flags);

    const totalCorrect = flagEntries.reduce(
      (sum, [_, info]) => sum + info.correctCount,
      0,
    );

    const totalIncorrect = flagEntries.reduce(
      (sum, [_, info]) => sum + info.incorrectCount,
      0,
    );

    const masteredFlags = flagEntries.filter(
      ([_, info]) => info.interval >= 90,
    );

    const dueFlags = flagEntries.filter(
      ([_, info]) => info.nextReviewDate <= now,
    );

    setStats({
      totalFlags: getAllFlags().length,
      flagsSeen: flagEntries.length,
      correctCount: totalCorrect,
      incorrectCount: totalIncorrect,
      masteredCount: masteredFlags.length,
      dueCount: dueFlags.length,
    });
  }, []);

  return stats;
}
```

## Component Implementation Examples

### Spaced Learning Dashboard

```tsx
// src/components/SpacedLearningDashboard.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProgressStats } from "@/lib/spaced-repetition/hooks";

export default function SpacedLearningDashboard() {
  const stats = useProgressStats();
  const [sessionSize, setSessionSize] = useState(10);
  const [newRatio, setNewRatio] = useState(0.3);
  const [continent, setContinent] = useState<string | undefined>(undefined);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Spaced Learning</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.dueCount} flags</p>
            <p className="text-muted-foreground">Due for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.flagsSeen} flags</p>
            <p className="text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.masteredCount} flags</p>
            <p className="text-muted-foreground">Long-term memory</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Session Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Number of flags</h3>
              <div className="flex gap-4">
                {[5, 10, 15, 20].map((size) => (
                  <Button
                    key={size}
                    variant={sessionSize === size ? "default" : "outline"}
                    onClick={() => setSessionSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">New flag ratio</h3>
              <div className="flex gap-4">
                <Button
                  variant={newRatio === 0.2 ? "default" : "outline"}
                  onClick={() => setNewRatio(0.2)}
                >
                  Low (20%)
                </Button>
                <Button
                  variant={newRatio === 0.3 ? "default" : "outline"}
                  onClick={() => setNewRatio(0.3)}
                >
                  Medium (30%)
                </Button>
                <Button
                  variant={newRatio === 0.4 ? "default" : "outline"}
                  onClick={() => setNewRatio(0.4)}
                >
                  High (40%)
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Filter by continent</h3>
              <Select
                value={continent}
                onValueChange={setContinent}
                options={[
                  { value: undefined, label: "All Continents" },
                  { value: "Africa", label: "Africa" },
                  { value: "Asia", label: "Asia" },
                  { value: "Europe", label: "Europe" },
                  { value: "North America", label: "North America" },
                  { value: "Oceania", label: "Oceania" },
                  { value: "South America", label: "South America" },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full">
        Start Spaced Learning
      </Button>
    </div>
  );
}
```

### Spaced Learning Session

```tsx
// src/components/SpacedLearningSession.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FlagImage } from "@/components/ui/flag-image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useSpacedLearningSession } from "@/lib/spaced-repetition/hooks";
import { formatDistanceToNow } from "date-fns";

interface SpacedLearningSessionProps {
  sessionSize?: number;
  newRatio?: number;
  continent?: string;
  onComplete?: () => void;
}

export function SpacedLearningSession({
  sessionSize = 10,
  newRatio = 0.3,
  continent,
  onComplete,
}: SpacedLearningSessionProps) {
  const { flags, loading, error, recordAnswer } = useSpacedLearningSession(
    sessionSize,
    newRatio,
    continent,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);

  const currentFlag = flags[currentIndex];

  const handleAnswer = () => {
    if (!selectedAnswer || !currentFlag) return;

    const isCorrect = selectedAnswer === currentFlag.name;
    if (isCorrect) {
      setScore(score + 1);
    }

    setIsAnswered(true);

    // Record progress
    const progress = recordAnswer(currentFlag.code, isCorrect);
    setNextReviewDate(new Date(progress.nextReviewDate));
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setNextReviewDate(null);

    if (currentIndex < flags.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  };

  if (loading) {
    return <div>Loading flags...</div>;
  }

  if (error) {
    return <div>Error loading flags: {error.message}</div>;
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Completed!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-4">
              {score}/{flags.length}
            </div>
            <Progress
              value={(score / flags.length) * 100}
              className="h-3 w-full mb-6"
            />
            <p className="text-center mb-4">
              {score === flags.length
                ? "Perfect score! You're a flag expert!"
                : score > flags.length / 2
                  ? "Good job! Keep practicing to improve your score."
                  : "Keep learning! You'll get better with practice."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            New Session
          </Button>
          <Button>Return to Learn</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentFlag) {
    return <div>No flags available.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Flag {currentIndex + 1} of {flags.length}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Score: {score}/{currentIndex}
          </div>
        </div>
        <Progress value={(currentIndex / flags.length) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center py-4">
          <FlagImage countryCode={currentFlag.code} size="xl" altText="Flag" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">
            Which country does this flag belong to?
          </h3>
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
          >
            {generateOptions(currentFlag, flags).map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-3 rounded-md border ${
                  isAnswered && option === currentFlag.name
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : isAnswered && option === selectedAnswer
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  disabled={isAnswered}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-grow cursor-pointer"
                >
                  {option}
                </Label>
                {isAnswered && option === currentFlag.name && (
                  <span className="text-green-600">✓</span>
                )}
                {isAnswered &&
                  option === selectedAnswer &&
                  option !== currentFlag.name && (
                    <span className="text-red-600">✗</span>
                  )}
              </div>
            ))}
          </RadioGroup>

          {isAnswered && nextReviewDate && (
            <div className="mt-4 text-sm text-muted-foreground">
              Next review:{" "}
              {formatDistanceToNow(nextReviewDate, { addSuffix: true })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isAnswered ? (
          <Button
            onClick={handleAnswer}
            disabled={!selectedAnswer}
            className="w-full"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {currentIndex < flags.length - 1 ? "Next Flag" : "See Results"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper function to generate quiz options
function generateOptions(currentFlag, allFlags) {
  const options = [currentFlag.name];
  const otherFlags = allFlags.filter((f) => f.id !== currentFlag.id);

  // Shuffle and take 3 more options
  const shuffled = [...otherFlags].sort(() => 0.5 - Math.random());
  options.push(...shuffled.slice(0, 3).map((f) => f.name));

  // Shuffle options
  return options.sort(() => 0.5 - Math.random());
}
```

## Offline Support Implementation

```typescript
// src/lib/spaced-repetition/offline.ts

import { syncWithServer } from "./sync";

// Queue for storing failed API requests
interface SyncQueueItem {
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = "flagTrainerSyncQueue";

// Load queue from storage
function getQueue(): SyncQueueItem[] {
  const stored = localStorage.getItem(SYNC_QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save queue to storage
function saveQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// Add item to sync queue
export function addToSyncQueue(
  endpoint: string,
  method: string,
  body: any,
): void {
  const queue = getQueue();

  queue.push({
    endpoint,
    method,
    body,
    timestamp: Date.now(),
    retries: 0,
  });

  saveQueue(queue);
}

// Process sync queue
export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const queue = getQueue();
  if (queue.length === 0) return;

  // Process queue items one by one
  const newQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
          // Include auth token if available
          ...(localStorage.getItem("authToken")
            ? {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              }
            : {}),
        },
        body: JSON.stringify(item.body),
      });

      if (!response.ok) {
        // If server error, keep in queue for retry
        if (response.status >= 500) {
          newQueue.push({
            ...item,
            retries: item.retries + 1,
          });
        }
        // If client error (4xx), log and drop
        else {
          console.error(`Failed to process queue item: ${response.statusText}`);
        }
      }
    } catch (error) {
      // Network error, keep in queue
      newQueue.push({
        ...item,
        retries: item.retries + 1,
      });
    }
  }

  // Update queue with remaining items
  saveQueue(newQueue);
}

// Set up listeners for online/offline events
export function setupOfflineSupport(): void {
  // Try to sync when coming online
  window.addEventListener("online", () => {
    console.log("Back online, processing sync queue");
    syncWithServer()
      .then(() => processSyncQueue())
      .catch(console.error);
  });

  // Process queue periodically when online
  setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue().catch(console.error);
    }
  }, 60000); // Try every minute
}
```

## Initialization

To set up the entire spaced repetition system, initialize it when the app starts:

```typescript
// src/lib/init.ts

import { initializeStorage } from "./spaced-repetition/storage";
import { setupAutoSync } from "./spaced-repetition/sync";
import { setupOfflineSupport } from "./spaced-repetition/offline";

export function initializeSpacedRepetition(): void {
  // Initialize local storage
  initializeStorage();

  // Set up automatic sync
  setupAutoSync();

  // Set up offline support
  setupOfflineSupport();
}
```

This specification provides a comprehensive client-side implementation for the spaced repetition system that fully supports anonymous usage with localStorage and seamless transition to authenticated usage with server synchronization.
