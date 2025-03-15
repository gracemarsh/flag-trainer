/**
 * Offline Support System for Spaced Repetition
 *
 * Provides infrastructure for detecting, managing, and optimizing the user experience
 * during offline/online transitions.
 */
import { getSyncState, synchronizeChanges } from "./sync";
import { isLocalStorageAvailable, isNavigatorAvailable } from "@/lib/utils";

// Offline Mode Constants
const OFFLINE_MODE_KEY = "flag-trainer-offline-mode";
const OFFLINE_MODE_EXPIRY_KEY = "flag-trainer-offline-mode-expiry";
const DEFAULT_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

// Interface definitions
export interface OfflineStatus {
  isOnline: boolean;
  isInOfflineMode: boolean;
  offlineModeExpiry: number | null;
  isOfflineModeExpired: boolean;
  syncPending: boolean;
}

export interface OfflineOptions {
  expiryTime?: number;
  checkIntervalMs?: number;
  automaticReconnect?: boolean;
}

// Default configuration
const defaultOptions: OfflineOptions = {
  expiryTime: DEFAULT_EXPIRY_TIME,
  checkIntervalMs: 10000, // 10 seconds
  automaticReconnect: true,
};

// In-memory state
let options: OfflineOptions = { ...defaultOptions };
let checkInterval: ReturnType<typeof setInterval> | null = null;
let offlineEventListeners: Array<(status: OfflineStatus) => void> = [];

/**
 * Initialize the offline support system
 * @param initOptions Configuration options for the offline system
 */
export function initializeOfflineSupport(
  initOptions: OfflineOptions = {},
): OfflineStatus {
  // Merge provided options with defaults
  options = { ...defaultOptions, ...initOptions };

  // Only run in browser environment
  if (!isNavigatorAvailable()) {
    return getOfflineStatus();
  }

  // Set up event listeners for online/offline events
  window.addEventListener("online", handleOnlineStatus);
  window.addEventListener("offline", handleOfflineStatus);

  // Start periodic connectivity checks
  startConnectivityChecks();

  return getOfflineStatus();
}

/**
 * Clean up the offline support system
 */
export function cleanupOfflineSupport(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Remove event listeners
  window.removeEventListener("online", handleOnlineStatus);
  window.removeEventListener("offline", handleOfflineStatus);

  // Stop the check interval
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // Clear event listeners
  offlineEventListeners = [];
}

/**
 * Subscribe to offline status changes
 * @param callback Function to call when offline status changes
 * @returns Function to unsubscribe
 */
export function subscribeToOfflineStatus(
  callback: (status: OfflineStatus) => void,
): () => void {
  offlineEventListeners.push(callback);

  // Return unsubscribe function
  return () => {
    offlineEventListeners = offlineEventListeners.filter(
      (listener) => listener !== callback,
    );
  };
}

/**
 * Get the current offline status
 */
export function getOfflineStatus(): OfflineStatus {
  // Default status if not in browser or localStorage is not available
  if (!isNavigatorAvailable() || !isLocalStorageAvailable()) {
    return {
      isOnline: true,
      isInOfflineMode: false,
      offlineModeExpiry: null,
      isOfflineModeExpired: false,
      syncPending: false,
    };
  }

  // Get offline mode status from localStorage
  const isInOfflineMode = localStorage.getItem(OFFLINE_MODE_KEY) === "true";
  let offlineModeExpiry: number | null = null;
  const expiryValue = localStorage.getItem(OFFLINE_MODE_EXPIRY_KEY);

  if (expiryValue) {
    offlineModeExpiry = parseInt(expiryValue, 10);
  }

  const isOfflineModeExpired =
    isInOfflineMode &&
    offlineModeExpiry !== null &&
    Date.now() > offlineModeExpiry;

  // Get sync state
  const syncState = getSyncState();

  return {
    isOnline: window.navigator.onLine,
    isInOfflineMode,
    offlineModeExpiry,
    isOfflineModeExpired,
    syncPending: syncState.queuedChanges.length > 0,
  };
}

/**
 * Enable offline mode
 * @param duration Duration in milliseconds for offline mode to be active
 */
export function enableOfflineMode(duration?: number): void {
  if (!isLocalStorageAvailable()) return;

  const actualDuration = duration || options.expiryTime || DEFAULT_EXPIRY_TIME;
  const expiry = Date.now() + actualDuration;

  localStorage.setItem(OFFLINE_MODE_KEY, "true");
  localStorage.setItem(OFFLINE_MODE_EXPIRY_KEY, expiry.toString());

  notifyListeners();
}

/**
 * Disable offline mode
 */
export function disableOfflineMode(): void {
  if (!isLocalStorageAvailable()) return;

  localStorage.removeItem(OFFLINE_MODE_KEY);
  localStorage.removeItem(OFFLINE_MODE_EXPIRY_KEY);

  notifyListeners();
}

/**
 * Handle moving to online status
 */
function handleOnlineStatus(): void {
  const status = getOfflineStatus();

  // If we just came online and we're not explicitly in offline mode
  // (or offline mode is expired), try to sync
  if (!status.isInOfflineMode || status.isOfflineModeExpired) {
    synchronizeChanges();
  }

  notifyListeners();
}

/**
 * Handle moving to offline status
 */
function handleOfflineStatus(): void {
  notifyListeners();
}

/**
 * Start periodic connectivity checks
 */
function startConnectivityChecks(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  checkInterval = setInterval(() => {
    const status = getOfflineStatus();

    // If offline mode is expired and we're online, disable offline mode
    if (
      status.isInOfflineMode &&
      status.isOfflineModeExpired &&
      status.isOnline
    ) {
      disableOfflineMode();
    }

    // If we have automatic reconnect enabled and we're online with pending changes
    if (options.automaticReconnect && status.isOnline && status.syncPending) {
      synchronizeChanges();
    }
  }, options.checkIntervalMs);
}

/**
 * Notify all listeners of offline status changes
 */
function notifyListeners(): void {
  const status = getOfflineStatus();
  offlineEventListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.error("Error in offline status listener:", error);
    }
  });
}

/**
 * Check if fetch requests should be made based on offline status
 * @returns boolean indicating if network requests should be skipped
 */
export function shouldSkipNetworkRequests(): boolean {
  const status = getOfflineStatus();
  return (
    !status.isOnline || (status.isInOfflineMode && !status.isOfflineModeExpired)
  );
}

/**
 * React hook for using offline status in components
 * (This is a placeholder - actual implementation would depend on React)
 */
export function useOfflineStatus(): OfflineStatus {
  return getOfflineStatus();
}
