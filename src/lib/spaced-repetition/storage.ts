/**
 * Spaced Repetition Storage System
 * Handles localStorage operations for storing and retrieving learning progress
 */
import { calculateNextReview, getInitialLearningParameters } from "./algorithm";
import { queueProgressUpdate } from "./sync";
import { isLocalStorageAvailable } from "@/lib/utils";

// Storage keys
const STORAGE_KEY_PREFIX = "flag-trainer-spaced-";
const STORAGE_KEY_PROGRESS = `${STORAGE_KEY_PREFIX}progress`;
const STORAGE_KEY_METADATA = `${STORAGE_KEY_PREFIX}metadata`;

/**
 * Progress record for a single flag
 */
export interface FlagProgress {
  flagCode: string; // Country code (e.g., "us", "ca")
  easeFactor: number; // Current ease factor (from SuperMemo-2)
  interval: number; // Current interval in days
  nextReviewDate: string; // ISO date string for next review
  totalReviews: number; // Total number of times reviewed
  correctReviews: number; // Number of correct reviews
  lastReviewedAt: string; // ISO date of last review
  createdAt: string; // ISO date when first started learning
}

/**
 * Metadata for the spaced repetition system
 */
export interface SpacedRepetitionMetadata {
  userId?: string; // Optional user ID (for authenticated users)
  lastSyncedAt?: string; // ISO date of last server sync
  version: string; // Schema version for data migration support
  deviceId: string; // Unique device identifier
}

/**
 * Initializes the localStorage for spaced repetition
 * Creates empty data structures if they don't exist yet
 */
export function initializeStorage(): boolean {
  // Skip initialization if localStorage is not available (SSR)
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    // Check if storage already exists
    if (!localStorage.getItem(STORAGE_KEY_PROGRESS)) {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify({}));
    }

    // Initialize or update metadata
    const existingMetadata = localStorage.getItem(STORAGE_KEY_METADATA);
    if (!existingMetadata) {
      const metadata: SpacedRepetitionMetadata = {
        version: "1.0",
        deviceId: generateDeviceId(),
      };
      localStorage.setItem(STORAGE_KEY_METADATA, JSON.stringify(metadata));
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize spaced repetition storage:", error);
    return false;
  }
}

/**
 * Get all stored flag progress data
 */
export function getAllProgressData(): Record<string, FlagProgress> {
  if (!isLocalStorageAvailable()) {
    return {};
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to retrieve progress data:", error);
    return {};
  }
}

/**
 * Get progress for a specific flag
 * @param flagCode The country code to retrieve progress for
 */
export function getFlagProgress(flagCode: string): FlagProgress | null {
  try {
    const allProgress = getAllProgressData();
    return allProgress[flagCode] || null;
  } catch (error) {
    console.error(`Failed to retrieve progress for flag ${flagCode}:`, error);
    return null;
  }
}

/**
 * Update progress for a specific flag after a learning session
 * @param flagCode The country code
 * @param isCorrect Whether the answer was correct
 */
export function updateFlagProgress(
  flagCode: string,
  isCorrect: boolean,
): FlagProgress {
  try {
    // Get existing progress or create new entry
    const allProgress = getAllProgressData();
    const existingProgress = allProgress[flagCode];
    const now = new Date();
    const nowIso = now.toISOString();

    let updatedProgress: FlagProgress;

    // If we already have progress for this flag, update it
    if (existingProgress) {
      // Calculate new review parameters based on previous performance
      const result = calculateNextReview(
        isCorrect,
        existingProgress.easeFactor,
        existingProgress.interval,
      );

      // Update the progress record
      updatedProgress = {
        ...existingProgress,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReviewDate: result.nextReviewDate.toISOString(),
        totalReviews: (existingProgress.totalReviews || 0) + 1,
        correctReviews:
          (existingProgress.correctReviews || 0) + (isCorrect ? 1 : 0),
        lastReviewedAt: nowIso,
      };
    }
    // Otherwise create new progress entry
    else {
      // For new flags, use initial learning parameters
      const { easeFactor, interval, nextReviewDate } =
        getInitialLearningParameters();

      updatedProgress = {
        flagCode,
        easeFactor,
        interval,
        nextReviewDate: nextReviewDate.toISOString(),
        totalReviews: 1,
        correctReviews: isCorrect ? 1 : 0,
        lastReviewedAt: nowIso,
        createdAt: nowIso,
      };
    }

    // Save to localStorage
    allProgress[flagCode] = updatedProgress;
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(allProgress));

    // Queue the update for syncing with the server
    queueProgressUpdate(flagCode, updatedProgress);

    return updatedProgress;
  } catch (error) {
    console.error(`Failed to update progress for flag ${flagCode}:`, error);
    throw new Error(`Failed to update progress for flag ${flagCode}`);
  }
}

/**
 * Get flags that are due for review
 * @param limit Optional maximum number of flags to return
 */
export function getDueFlags(limit?: number): string[] {
  try {
    const allProgress = getAllProgressData();
    const now = new Date();

    // Filter flags that are due for review
    const dueFlags = Object.values(allProgress)
      .filter((progress) => {
        const nextReviewDate = new Date(progress.nextReviewDate);
        return nextReviewDate <= now;
      })
      .map((progress) => progress.flagCode);

    // Apply limit if provided
    return limit ? dueFlags.slice(0, limit) : dueFlags;
  } catch (error) {
    console.error("Failed to get due flags:", error);
    return [];
  }
}

/**
 * Get learning progress statistics
 */
export function getProgressStats() {
  try {
    const allProgress = getAllProgressData();
    const flagCount = Object.keys(allProgress).length;
    const now = new Date();

    // Calculate various statistics
    let totalReviews = 0;
    let correctReviews = 0;
    let dueCount = 0;
    let masteredCount = 0; // Flags with interval > 30 days

    Object.values(allProgress).forEach((progress) => {
      totalReviews += progress.totalReviews || 0;
      correctReviews += progress.correctReviews || 0;

      const nextReviewDate = new Date(progress.nextReviewDate);
      if (nextReviewDate <= now) {
        dueCount++;
      }

      if (progress.interval > 30) {
        masteredCount++;
      }
    });

    return {
      flagCount,
      totalReviews,
      correctReviews,
      accuracy: totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0,
      dueCount,
      masteredCount,
    };
  } catch (error) {
    console.error("Failed to calculate progress stats:", error);
    return {
      flagCount: 0,
      totalReviews: 0,
      correctReviews: 0,
      accuracy: 0,
      dueCount: 0,
      masteredCount: 0,
    };
  }
}

/**
 * Clear all progress data
 * Use with caution - this will delete all learning progress
 */
export function clearAllProgress(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify({}));
    return true;
  } catch (error) {
    console.error("Failed to clear progress data:", error);
    return false;
  }
}

/**
 * Generate a unique device ID for anonymous users
 */
function generateDeviceId(): string {
  // Check if we already have a device ID
  const existingMetadata = localStorage.getItem(STORAGE_KEY_METADATA);
  if (existingMetadata) {
    try {
      const metadata = JSON.parse(existingMetadata);
      if (metadata.deviceId) {
        return metadata.deviceId;
      }
    } catch {
      // Continue to generate a new one
    }
  }

  // Generate a new random ID
  return "device_" + Math.random().toString(36).substring(2, 15);
}
