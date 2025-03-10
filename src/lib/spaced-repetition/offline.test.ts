/**
 * Tests for the offline support system
 */
import {
  initializeOfflineSupport,
  cleanupOfflineSupport,
  getOfflineStatus,
  enableOfflineMode,
  disableOfflineMode,
  shouldSkipNetworkRequests,
  subscribeToOfflineStatus,
} from "./offline";

// Mock the sync module
jest.mock("./sync", () => ({
  getSyncState: jest.fn().mockReturnValue({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: 1234567890,
    queuedChanges: [],
    syncError: null,
  }),
  synchronizeChanges: jest.fn(),
}));

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock navigator.onLine
Object.defineProperty(window.navigator, "onLine", {
  writable: true,
  value: true,
});

// Helper to simulate online status change
function simulateOnlineStatusChange(online: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    writable: true,
    value: online,
  });

  // Dispatch the appropriate event
  const event = new Event(online ? "online" : "offline");
  window.dispatchEvent(event);
}

describe("Offline Support System", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();

    // Reset to online state
    simulateOnlineStatusChange(true);

    // Clean up any previous initializations
    cleanupOfflineSupport();
  });

  describe("Initialization", () => {
    it("should initialize the offline support system", () => {
      const status = initializeOfflineSupport();

      expect(status).toBeDefined();
      expect(status.isOnline).toBe(true);
      expect(status.isInOfflineMode).toBe(false);
      expect(status.offlineModeExpiry).toBe(null);
      expect(status.isOfflineModeExpired).toBe(false);
      expect(status.syncPending).toBe(false);
    });

    it("should accept custom options", () => {
      // Set options with a very short check interval for testing
      initializeOfflineSupport({
        checkIntervalMs: 100,
        expiryTime: 60000, // 1 minute
        automaticReconnect: false,
      });

      // We can't easily test these options directly since they're private,
      // but at least we can verify initialization didn't throw
      expect(getOfflineStatus().isOnline).toBe(true);
    });
  });

  describe("Offline Mode Management", () => {
    it("should enable offline mode", () => {
      initializeOfflineSupport();

      // Enable offline mode
      enableOfflineMode();

      // Check localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "flag-trainer-offline-mode",
        "true",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "flag-trainer-offline-mode-expiry",
        expect.any(String),
      );

      // Verify status
      const status = getOfflineStatus();
      expect(status.isInOfflineMode).toBe(true);
    });

    it("should disable offline mode", () => {
      initializeOfflineSupport();
      enableOfflineMode();

      // Disable offline mode
      disableOfflineMode();

      // Check localStorage was updated
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "flag-trainer-offline-mode",
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "flag-trainer-offline-mode-expiry",
      );

      // Verify status
      const status = getOfflineStatus();
      expect(status.isInOfflineMode).toBe(false);
    });

    it("should respect offline mode expiry", () => {
      initializeOfflineSupport();

      // Set offline mode with a very short expiry (1ms in the past)
      const pastExpiry = Date.now() - 1;
      localStorageMock.setItem("flag-trainer-offline-mode", "true");
      localStorageMock.setItem(
        "flag-trainer-offline-mode-expiry",
        pastExpiry.toString(),
      );

      // Verify status shows expired
      const status = getOfflineStatus();
      expect(status.isInOfflineMode).toBe(true);
      expect(status.isOfflineModeExpired).toBe(true);
    });
  });

  describe("Network Request Handling", () => {
    it("should skip network requests when offline", () => {
      initializeOfflineSupport();

      // Set navigator to offline
      simulateOnlineStatusChange(false);

      // Should skip network requests
      expect(shouldSkipNetworkRequests()).toBe(true);
    });

    it("should skip network requests in offline mode", () => {
      initializeOfflineSupport();

      // Set to offline mode (but still technically online)
      enableOfflineMode();

      // Should skip network requests due to offline mode
      expect(shouldSkipNetworkRequests()).toBe(true);
    });

    it("should not skip network requests when online", () => {
      initializeOfflineSupport();

      // Ensure we're online and not in offline mode
      simulateOnlineStatusChange(true);
      disableOfflineMode();

      // Should not skip network requests
      expect(shouldSkipNetworkRequests()).toBe(false);
    });
  });

  describe("Event Listeners", () => {
    it("should notify subscribed listeners of status changes", () => {
      initializeOfflineSupport();

      // Create a mock listener
      const listener = jest.fn();

      // Subscribe to offline status changes
      const unsubscribe = subscribeToOfflineStatus(listener);

      // Trigger a status change
      enableOfflineMode();

      // Listener should have been called
      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          isInOfflineMode: true,
        }),
      );

      // Unsubscribe and verify it works
      unsubscribe();
      jest.clearAllMocks();

      // Trigger another change
      disableOfflineMode();

      // Listener should not be called this time
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Online/Offline Transitions", () => {
    it("should update status when going offline", () => {
      initializeOfflineSupport();

      // Initial status should be online
      expect(getOfflineStatus().isOnline).toBe(true);

      // Simulate going offline
      simulateOnlineStatusChange(false);

      // Status should now show offline
      expect(getOfflineStatus().isOnline).toBe(false);
    });

    it("should update status when coming back online", () => {
      initializeOfflineSupport();

      // Go offline first
      simulateOnlineStatusChange(false);
      expect(getOfflineStatus().isOnline).toBe(false);

      // Now come back online
      simulateOnlineStatusChange(true);

      // Status should show online again
      expect(getOfflineStatus().isOnline).toBe(true);
    });
  });

  describe("Cleanup", () => {
    it("should clean up resources when cleanup is called", () => {
      // Spy on removeEventListener
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      initializeOfflineSupport();
      cleanupOfflineSupport();

      // Should have removed event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "offline",
        expect.any(Function),
      );

      // Restore the spy
      removeEventListenerSpy.mockRestore();
    });
  });
});
