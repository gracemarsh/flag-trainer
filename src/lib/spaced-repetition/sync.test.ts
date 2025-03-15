/**
 * Tests for the synchronization module
 */
import {
  initializeSync,
  cleanupSync,
  queueChange,
  queueProgressUpdate,
  forceSynchronization,
  clearSyncQueue,
  getSyncState,
} from "./sync";

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// Mock window.addEventListener/removeEventListener
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

describe("Sync Module", () => {
  let addEventListenerMock: jest.Mock;
  let removeEventListenerMock: jest.Mock;

  beforeEach(() => {
    // Setup localStorage mock
    // @ts-expect-error - mock implementation
    global.localStorage = new LocalStorageMock();

    // Mock event listeners
    addEventListenerMock = jest.fn();
    removeEventListenerMock = jest.fn();
    window.addEventListener = addEventListenerMock;
    window.removeEventListener = removeEventListenerMock;

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    // Clear sync queue
    clearSyncQueue();
  });

  afterEach(() => {
    // Restore original functions
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  describe("initializeSync", () => {
    test("should set up event listeners", () => {
      const state = initializeSync();

      expect(state.isOnline).toBe(true);
      expect(state.isSyncing).toBe(false);
      expect(addEventListenerMock).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
      expect(addEventListenerMock).toHaveBeenCalledWith(
        "offline",
        expect.any(Function),
      );
    });

    test("should load queue from localStorage", () => {
      // Setup mock data
      const mockQueue = [
        {
          id: "update_123",
          timestamp: Date.now(),
          action: "update",
          data: { flagCode: "us", progress: {} },
          retryCount: 0,
        },
      ];
      localStorage.setItem(
        "flag-trainer-sync-queue",
        JSON.stringify(mockQueue),
      );

      const state = initializeSync();

      expect(state.queuedChanges).toHaveLength(1);
      expect(state.queuedChanges[0].id).toBe("update_123");
    });
  });

  describe("cleanupSync", () => {
    test("should remove event listeners", () => {
      initializeSync();
      cleanupSync();

      expect(removeEventListenerMock).toHaveBeenCalledWith(
        "online",
        expect.any(Function),
      );
      expect(removeEventListenerMock).toHaveBeenCalledWith(
        "offline",
        expect.any(Function),
      );
    });
  });

  describe("queueChange", () => {
    test("should add item to the queue", () => {
      initializeSync();
      queueChange("update", { test: "data" });

      const state = getSyncState();
      expect(state.queuedChanges).toHaveLength(1);
      expect(state.queuedChanges[0].action).toBe("update");
      expect(state.queuedChanges[0].data).toEqual({ test: "data" });
    });

    test("should save queue to localStorage", () => {
      initializeSync();
      queueChange("delete", { flagCode: "us" });

      const storedQueue = localStorage.getItem("flag-trainer-sync-queue");
      expect(storedQueue).not.toBeNull();

      const parsedQueue = JSON.parse(storedQueue!);
      expect(parsedQueue).toHaveLength(1);
      expect(parsedQueue[0].action).toBe("delete");
    });
  });

  describe("queueProgressUpdate", () => {
    test("should queue a progress update", () => {
      initializeSync();
      const progress = {
        flagCode: "us",
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: new Date().toISOString(),
        totalReviews: 1,
        correctReviews: 1,
        lastReviewedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      queueProgressUpdate("us", progress);

      const state = getSyncState();
      expect(state.queuedChanges).toHaveLength(1);
      expect(state.queuedChanges[0].action).toBe("update");
      expect(state.queuedChanges[0].data).toEqual({ flagCode: "us", progress });
    });
  });

  describe("synchronizeChanges", () => {
    beforeEach(() => {
      // Mock console.log to prevent noise in tests
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    test("should process queued items", async () => {
      initializeSync();
      queueChange("update", { test: "data1" });
      queueChange("update", { test: "data2" });

      // Mock Math.random to avoid random failures
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Above 0.1 threshold, will succeed

      await forceSynchronization();

      // Restore original Math.random
      Math.random = originalRandom;

      // Queue should be empty after successful sync
      const state = getSyncState();
      expect(state.queuedChanges).toHaveLength(0);
      expect(state.lastSyncTime).not.toBeNull();
    });

    test("should handle sync failures", async () => {
      initializeSync();
      queueChange("update", { test: "failure" });

      // Mock Math.random to force failure
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.05); // Below 0.1 threshold, will fail

      await forceSynchronization();

      // Restore original Math.random
      Math.random = originalRandom;

      // Item should still be in queue with increased retry count
      const state = getSyncState();
      expect(state.queuedChanges).toHaveLength(1);
      expect(state.queuedChanges[0].retryCount).toBe(1);
    });
  });

  describe("clearSyncQueue", () => {
    test("should clear the queue", () => {
      initializeSync();
      queueChange("update", { test: "data" });

      const stateBefore = getSyncState();
      expect(stateBefore.queuedChanges).toHaveLength(1);

      clearSyncQueue();

      const stateAfter = getSyncState();
      expect(stateAfter.queuedChanges).toHaveLength(0);
    });
  });
});
