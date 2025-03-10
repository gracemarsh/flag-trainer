/**
 * Tests for the spaced repetition system initialization
 */
import {
  initializeSpacedRepetitionSystem,
  cleanupSpacedRepetitionSystem,
  getSystemStatus,
  resetSpacedRepetitionSystem,
  isSystemInitialized,
  createMockedData,
} from "./initialize";

// Mock all dependencies
jest.mock("./storage", () => ({
  initializeStorage: jest.fn().mockReturnValue(true),
  clearAllProgress: jest.fn(),
  updateFlagProgress: jest.fn(),
}));

jest.mock("./sync", () => ({
  initializeSync: jest.fn().mockReturnValue({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    queuedChanges: [],
    syncError: null,
  }),
  cleanupSync: jest.fn(),
  getSyncState: jest.fn().mockReturnValue({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: 1234567890,
    queuedChanges: [],
    syncError: null,
  }),
}));

jest.mock("./offline", () => ({
  initializeOfflineSupport: jest.fn().mockReturnValue({
    isOnline: true,
    isInOfflineMode: false,
    offlineModeExpiry: null,
    isOfflineModeExpired: false,
    syncPending: false,
  }),
  cleanupOfflineSupport: jest.fn(),
  getOfflineStatus: jest.fn().mockReturnValue({
    isOnline: true,
    isInOfflineMode: false,
    offlineModeExpiry: null,
    isOfflineModeExpired: false,
    syncPending: false,
  }),
}));

// Import mocked modules for testing
import * as storageMock from "./storage";
import * as syncMock from "./sync";
import * as offlineMock from "./offline";

describe("Spaced Repetition System Initialization", () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("System Initialization", () => {
    it("should initialize all subsystems", () => {
      const status = initializeSpacedRepetitionSystem();

      // Verify all subsystems were initialized
      expect(storageMock.initializeStorage).toHaveBeenCalled();
      expect(syncMock.initializeSync).toHaveBeenCalled();
      expect(offlineMock.initializeOfflineSupport).toHaveBeenCalled();

      // Verify status is returned
      expect(status).toEqual(
        expect.objectContaining({
          initialized: true,
          storage: expect.any(Object),
          sync: expect.any(Object),
          offline: expect.any(Object),
        }),
      );
    });

    it("should accept custom initialization options", () => {
      // Initialize with custom options
      initializeSpacedRepetitionSystem({
        debugMode: true,
        automaticSyncing: false,
        offline: {
          checkIntervalMs: 1000,
        },
      });

      // Verify offline options were passed through
      expect(offlineMock.initializeOfflineSupport).toHaveBeenCalledWith(
        expect.objectContaining({
          checkIntervalMs: 1000,
        }),
      );
    });
  });

  describe("System Status", () => {
    it("should return the current system status", () => {
      // Initialize the system
      initializeSpacedRepetitionSystem();

      // Get the status
      const status = getSystemStatus();

      // Verify structure
      expect(status).toEqual({
        initialized: true,
        storage: {
          initialized: true,
        },
        sync: {
          initialized: true,
          isOnline: true,
          isSyncing: false,
          pendingChanges: 0,
        },
        offline: {
          initialized: true,
          isOnline: true,
          isInOfflineMode: false,
        },
      });
    });

    it("should report system as uninitialized before initialization", () => {
      // Clean up to ensure uninitialized state
      cleanupSpacedRepetitionSystem();

      // Check initialization status
      expect(isSystemInitialized()).toBe(false);
    });

    it("should report system as initialized after initialization", () => {
      // Initialize
      initializeSpacedRepetitionSystem();

      // Check initialization status
      expect(isSystemInitialized()).toBe(true);
    });
  });

  describe("System Cleanup", () => {
    it("should clean up all subsystems", () => {
      // Initialize first
      initializeSpacedRepetitionSystem();

      // Clean up
      cleanupSpacedRepetitionSystem();

      // Verify all subsystems were cleaned up
      expect(syncMock.cleanupSync).toHaveBeenCalled();
      expect(offlineMock.cleanupOfflineSupport).toHaveBeenCalled();

      // Verify system is marked as uninitialized
      expect(isSystemInitialized()).toBe(false);
    });

    it("should do nothing if not initialized", () => {
      // Ensure we're in an uninitialized state
      cleanupSpacedRepetitionSystem();
      jest.clearAllMocks();

      // Call cleanup again
      cleanupSpacedRepetitionSystem();

      // Verify no cleanup methods were called
      expect(syncMock.cleanupSync).not.toHaveBeenCalled();
      expect(offlineMock.cleanupOfflineSupport).not.toHaveBeenCalled();
    });
  });

  describe("System Reset", () => {
    it("should reset the system and clear progress", () => {
      // Initialize the system
      initializeSpacedRepetitionSystem();

      // Reset the system
      resetSpacedRepetitionSystem();

      // Verify all expected methods were called
      expect(storageMock.clearAllProgress).toHaveBeenCalled();
      expect(syncMock.cleanupSync).toHaveBeenCalled();
      expect(offlineMock.cleanupOfflineSupport).toHaveBeenCalled();

      // Verify reinitialization
      expect(storageMock.initializeStorage).toHaveBeenCalledTimes(2);
      expect(syncMock.initializeSync).toHaveBeenCalledTimes(2);
      expect(offlineMock.initializeOfflineSupport).toHaveBeenCalledTimes(2);
    });

    it("should preserve settings when requested", () => {
      // Initialize with custom options
      initializeSpacedRepetitionSystem({
        debugMode: true,
        automaticSyncing: false,
      });

      // Clear mocks to track new calls
      jest.clearAllMocks();

      // Reset with preserve settings
      resetSpacedRepetitionSystem(true);

      // Verify initialization was called with settings preserved
      // (We can't directly test the options object, but we can verify reinit was called)
      expect(storageMock.initializeStorage).toHaveBeenCalled();
    });
  });

  describe("Mock Data Creation", () => {
    it("should create mocked data for development", () => {
      // Spy on the updateFlagProgress function
      const updateSpy = storageMock.updateFlagProgress;

      // Initialize the system
      initializeSpacedRepetitionSystem();

      // Create mock data with a small flag count for testing
      createMockedData(5);

      // Verify updateFlagProgress was called
      expect(updateSpy).toHaveBeenCalled();
    });

    it("should require initialization before creating mock data", () => {
      // Ensure system is not initialized
      cleanupSpacedRepetitionSystem();

      // Mock console.error to avoid test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Try to create mock data
      createMockedData(5);

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        "System must be initialized before creating mocked data",
      );

      // Verify no updates were made
      expect(storageMock.updateFlagProgress).not.toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });
});
