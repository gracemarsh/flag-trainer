/**
 * Offline Support and Synchronization for Spaced Repetition
 *
 * This module provides functionality for:
 * 1. Detecting online/offline status
 * 2. Queueing operations when offline
 * 3. Syncing data when the connection is restored
 */
import { FlagProgress } from "./storage";
import { isLocalStorageAvailable, isNavigatorAvailable } from "@/lib/utils";
// import { getAllProgressData, FlagProgress } from './storage'

// Define the last stored sync time key (used within syncProgressWithServer)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LAST_SYNC_KEY = "last_sync_timestamp";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ProgressData = Record<string, unknown>;

// Queue item for sync operations
type SyncQueueItem = {
  id: string;
  timestamp: number;
  action: "update" | "delete";
  data: Record<string, unknown>;
  retryCount: number;
};

// Types for the sync module
export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  queuedChanges: SyncQueueItem[];
  syncError: string | null;
}

// Storage keys
const STORAGE_KEY_SYNC_QUEUE = "flag-trainer-sync-queue";
const STORAGE_KEY_LAST_SYNC = "flag-trainer-last-sync";

// Default state
const defaultSyncState: SyncState = {
  isOnline: isNavigatorAvailable() ? navigator.onLine : true,
  isSyncing: false,
  lastSyncTime: null,
  queuedChanges: [],
  syncError: null,
};

// In-memory state (will be initialized from localStorage)
const syncState: SyncState = { ...defaultSyncState };

/**
 * Initialize the sync module
 * Sets up event listeners for online/offline events and loads the queue from localStorage
 */
export function initializeSync(): SyncState {
  // Only run in browser environment
  if (!isNavigatorAvailable() || !isLocalStorageAvailable()) {
    return syncState;
  }

  // Load queue from localStorage
  try {
    const storedQueue = localStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
    if (storedQueue) {
      syncState.queuedChanges = JSON.parse(storedQueue);
    }

    const lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    if (lastSync) {
      syncState.lastSyncTime = parseInt(lastSync, 10);
    }
  } catch (error) {
    console.error("Failed to load sync queue from localStorage:", error);
  }

  // Set up event listeners for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initialize online status
  syncState.isOnline = navigator.onLine;

  // If we're online and have queued changes, try to sync
  if (syncState.isOnline && syncState.queuedChanges.length > 0) {
    synchronizeChanges();
  }

  return syncState;
}

/**
 * Clean up the sync module
 * Removes event listeners
 */
export function cleanupSync(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
}

/**
 * Handle online event
 * Attempt to sync queued changes
 */
function handleOnline(): void {
  syncState.isOnline = true;
  synchronizeChanges();
}

/**
 * Handle offline event
 */
function handleOffline(): void {
  syncState.isOnline = false;
}

/**
 * Add a change to the sync queue
 * @param action The action type ('update' or 'delete')
 * @param data The data to sync
 */
export function queueChange(
  action: "update" | "delete",
  data: Record<string, unknown>,
): void {
  const item: SyncQueueItem = {
    id: `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    action,
    data,
    retryCount: 0,
  };

  syncState.queuedChanges.push(item);
  saveQueueToStorage();

  // If we're online, try to sync immediately
  if (syncState.isOnline && !syncState.isSyncing) {
    synchronizeChanges();
  }
}

/**
 * Queue a progress update for synchronization
 * @param flagCode The country code
 * @param progress The progress data
 */
export function queueProgressUpdate(
  flagCode: string,
  progress: FlagProgress,
): void {
  queueChange("update", { flagCode, progress });
}

/**
 * Synchronize queued changes with the server
 * Processes each item in the queue and removes them when successful
 */
export async function synchronizeChanges(): Promise<void> {
  // Skip if offline, already syncing, no changes, or no localStorage
  if (
    !syncState.isOnline ||
    syncState.isSyncing ||
    syncState.queuedChanges.length === 0 ||
    !isLocalStorageAvailable()
  ) {
    return;
  }

  syncState.isSyncing = true;
  syncState.syncError = null;

  try {
    // Process each queued item
    const successfulItems: string[] = [];
    const failedItems: SyncQueueItem[] = [];

    // Process in batches for efficiency
    const items = [...syncState.queuedChanges];

    for (const item of items) {
      try {
        await syncItem(item);
        successfulItems.push(item.id);
      } catch {
        // Increment retry count for failed items
        item.retryCount += 1;

        // After 3 retries, drop the item to prevent endless retries
        if (item.retryCount < 3) {
          failedItems.push(item);
        } else {
          console.warn(`Dropping sync item after 3 failed attempts:`, item);
        }
      }
    }

    // Remove successful items from queue
    syncState.queuedChanges = syncState.queuedChanges.filter(
      (item) => !successfulItems.includes(item.id),
    );

    // Update last sync time
    syncState.lastSyncTime = Date.now();
    if (isLocalStorageAvailable()) {
      localStorage.setItem(
        STORAGE_KEY_LAST_SYNC,
        syncState.lastSyncTime.toString(),
      );
    }

    // Save updated queue
    saveQueueToStorage();
  } catch (err) {
    const error = err as Error;
    console.error("Synchronization error:", error);
    syncState.syncError =
      error instanceof Error ? error.message : "Unknown sync error";
  } finally {
    syncState.isSyncing = false;
  }
}

/**
 * Sync a single item with the server
 * @param item The sync queue item to process
 */
async function syncItem(item: SyncQueueItem): Promise<void> {
  // In a real implementation, this would make API calls
  // For now, we'll simulate a successful sync with a delay

  return new Promise<void>((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate occasional failure for testing
      if (Math.random() < 0.1) {
        reject(new Error("Simulated sync failure"));
        return;
      }

      // For demonstration, log the item
      console.log(`Synced item ${item.id} successfully:`, item);
      resolve();
    }, 500);
  });
}

/**
 * Save the current queue to localStorage
 */
function saveQueueToStorage(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY_SYNC_QUEUE,
      JSON.stringify(syncState.queuedChanges),
    );
  } catch (error) {
    console.error("Failed to save sync queue to localStorage:", error);
  }
}

/**
 * Get the current sync state
 * @returns The current sync state
 */
export function getSyncState(): SyncState {
  return { ...syncState };
}

/**
 * Force a synchronization attempt
 * Useful for manual sync buttons
 */
export function forceSynchronization(): Promise<void> {
  return synchronizeChanges();
}

/**
 * Clear the sync queue
 * Useful for testing or resetting
 */
export function clearSyncQueue(): void {
  syncState.queuedChanges = [];
  saveQueueToStorage();
}

// Comment out unused export if it's needed in the future
// export function getAllProgressData(): Record<string, ProgressData> {
//   // Implementation
// }
