/**
 * Offline Support System for Spaced Repetition
 *
 * Provides infrastructure for detecting, managing, and optimizing the user experience
 * during offline/online transitions.
 */
import { getSyncState, synchronizeChanges } from "./sync";

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
  if (typeof window === "undefined") {
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
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const isInOfflineMode = localStorage.getItem(OFFLINE_MODE_KEY) === "true";
  const offlineModeExpiry = localStorage.getItem(OFFLINE_MODE_EXPIRY_KEY)
    ? parseInt(localStorage.getItem(OFFLINE_MODE_EXPIRY_KEY) || "0", 10)
    : null;

  const isOfflineModeExpired = offlineModeExpiry
    ? Date.now() > offlineModeExpiry
    : false;

  const { queuedChanges } = getSyncState();
  const syncPending = queuedChanges.length > 0;

  return {
    isOnline,
    isInOfflineMode,
    offlineModeExpiry,
    isOfflineModeExpired,
    syncPending,
  };
}

/**
 * Enable offline mode
 * @param duration Optional duration in milliseconds (defaults to 7 days)
 */
export function enableOfflineMode(duration?: number): void {
  const expiryTime = duration || options.expiryTime || DEFAULT_EXPIRY_TIME;
  const expiry = Date.now() + expiryTime;

  localStorage.setItem(OFFLINE_MODE_KEY, "true");
  localStorage.setItem(OFFLINE_MODE_EXPIRY_KEY, expiry.toString());

  notifyListeners();
}

/**
 * Disable offline mode and reconnect if possible
 */
export function disableOfflineMode(): void {
  localStorage.removeItem(OFFLINE_MODE_KEY);
  localStorage.removeItem(OFFLINE_MODE_EXPIRY_KEY);

  // If we're actually online, try to sync
  if (navigator.onLine) {
    synchronizeChanges();
  }

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
