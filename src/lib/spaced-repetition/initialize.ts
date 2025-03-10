/**
 * Spaced Repetition System Initialization
 *
 * Provides a unified interface for initializing all parts of the spaced repetition system.
 * This includes storage, synchronization, and offline support.
 */
import {
  initializeStorage,
  clearAllProgress,
  updateFlagProgress,
} from "./storage";
import { initializeSync, cleanupSync, getSyncState } from "./sync";
import {
  initializeOfflineSupport,
  cleanupOfflineSupport,
  getOfflineStatus,
  OfflineOptions,
} from "./offline";

// Define system status
export interface SpacedRepetitionStatus {
  initialized: boolean;
  storage: {
    initialized: boolean;
  };
  sync: {
    initialized: boolean;
    isOnline: boolean;
    isSyncing: boolean;
    pendingChanges: number;
  };
  offline: {
    initialized: boolean;
    isOnline: boolean;
    isInOfflineMode: boolean;
  };
}

// Define initialization options
export interface InitOptions {
  offline?: OfflineOptions;
  automaticSyncing?: boolean;
  debugMode?: boolean;
}

// Internal state
let systemInitialized = false;
const defaultOptions: InitOptions = {
  automaticSyncing: true,
  debugMode: false,
};
let options: InitOptions = { ...defaultOptions };

/**
 * Initialize the entire spaced repetition system
 * This should be called at application startup
 *
 * @param initOptions Initialization options
 * @returns Current status of the system
 */
export function initializeSpacedRepetitionSystem(
  initOptions: InitOptions = {},
): SpacedRepetitionStatus {
  // Merge options
  options = { ...defaultOptions, ...initOptions };

  // Initialize all subsystems
  const storageInitialized = initializeStorage();
  const syncState = initializeSync();
  const offlineStatus = initializeOfflineSupport(options.offline);

  // Log debug information if enabled
  if (options.debugMode) {
    console.log("🔄 Spaced Repetition System initialized:", {
      storage: storageInitialized,
      sync: syncState,
      offline: offlineStatus,
    });
  }

  systemInitialized = true;

  return getSystemStatus();
}

/**
 * Clean up the spaced repetition system
 * This should be called when the application is shutting down or unmounting
 * the spaced repetition components
 */
export function cleanupSpacedRepetitionSystem(): void {
  if (!systemInitialized) {
    return;
  }

  // Clean up all subsystems
  cleanupSync();
  cleanupOfflineSupport();

  // Log debug information if enabled
  if (options.debugMode) {
    console.log("🔄 Spaced Repetition System cleaned up");
  }

  systemInitialized = false;
}

/**
 * Get the current status of the spaced repetition system
 */
export function getSystemStatus(): SpacedRepetitionStatus {
  const syncState = getSyncState();
  const offlineStatus = getOfflineStatus();

  return {
    initialized: systemInitialized,
    storage: {
      initialized: true, // We don't have a way to check this yet, so assume true if we got this far
    },
    sync: {
      initialized: true, // Same as above
      isOnline: syncState.isOnline,
      isSyncing: syncState.isSyncing,
      pendingChanges: syncState.queuedChanges.length,
    },
    offline: {
      initialized: true, // Same as above
      isOnline: offlineStatus.isOnline,
      isInOfflineMode: offlineStatus.isInOfflineMode,
    },
  };
}

/**
 * Reset the entire spaced repetition system
 * This will clear all progress data and reinitialize the system
 *
 * @param preserveSettings Whether to preserve system settings
 * @returns The new system status
 */
export function resetSpacedRepetitionSystem(
  preserveSettings = false,
): SpacedRepetitionStatus {
  // Store current options if preserving settings
  const currentOptions = preserveSettings
    ? { ...options }
    : { ...defaultOptions };

  // Clean up existing system
  cleanupSpacedRepetitionSystem();

  // Clear all progress data
  clearAllProgress();

  // Reinitialize the system
  return initializeSpacedRepetitionSystem(currentOptions);
}

/**
 * Check if the spaced repetition system has been initialized
 */
export function isSystemInitialized(): boolean {
  return systemInitialized;
}

/**
 * Create mocked data for development and testing
 * This populates the system with random progress data for testing
 *
 * @param flagCount Number of flags to create mocked data for
 */
export function createMockedData(flagCount = 30): void {
  if (!systemInitialized) {
    console.error("System must be initialized before creating mocked data");
    return;
  }

  // Create a set of random ISO country codes
  const countries = Array.from({ length: flagCount }).map(() => {
    // Generate a 2-letter country code (this is a simplified approach just for testing)
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const code = `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}`;
    return code;
  });

  // Create random progress for each flag
  countries.forEach((code) => {
    // Random number of reviews (1-20)
    const reviewCount = Math.floor(Math.random() * 20) + 1;

    // Create the review history with random correct/incorrect answers
    for (let i = 0; i < reviewCount; i++) {
      const isCorrect = Math.random() > 0.3; // 70% correct answers
      updateFlagProgress(code, isCorrect);
    }
  });

  if (options.debugMode) {
    console.log(`🔄 Created mocked data for ${flagCount} flags`);
  }
}
