/**
 * Unit tests for the spaced repetition storage module
 * Uses mock localStorage implementation for testing
 */
import {
  initializeStorage,
  getAllProgressData,
  getFlagProgress,
  updateFlagProgress,
  getDueFlags,
  getProgressStats,
  clearAllProgress,
  FlagProgress,
} from "./storage";

// Mock implementation of localStorage for testing
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

// Setup mock localStorage before tests
describe("Spaced Repetition Storage", () => {
  // Setup global localStorage mock
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Use type assertion to make TypeScript happy
    global.localStorage = new LocalStorageMock() as unknown as Storage;
    // Make sure we start with a clean slate for each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore the original localStorage
    global.localStorage = originalLocalStorage as unknown as Storage;
  });

  describe("initializeStorage", () => {
    test("should initialize empty storage", () => {
      const result = initializeStorage();

      expect(result).toBe(true);
      expect(localStorage.getItem("flag-trainer-spaced-progress")).toBe("{}");
      expect(localStorage.getItem("flag-trainer-spaced-metadata")).toBeTruthy();

      // Check metadata format
      const metadata = JSON.parse(
        localStorage.getItem("flag-trainer-spaced-metadata")!,
      );
      expect(metadata.version).toBe("1.0");
      expect(metadata.deviceId).toMatch(/^device_/);
    });

    test("should not overwrite existing progress data", () => {
      // Setup existing data
      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify({ us: { flagCode: "us" } }),
      );

      const result = initializeStorage();

      expect(result).toBe(true);
      const storedData = JSON.parse(
        localStorage.getItem("flag-trainer-spaced-progress")!,
      );
      expect(storedData).toHaveProperty("us");
    });
  });

  describe("getAllProgressData", () => {
    test("should return empty object when no data exists", () => {
      const result = getAllProgressData();

      expect(result).toEqual({});
    });

    test("should return all stored progress", () => {
      // Setup test data
      const testData = {
        us: { flagCode: "us", interval: 1 },
        ca: { flagCode: "ca", interval: 2 },
      };
      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify(testData),
      );

      const result = getAllProgressData();

      expect(result).toEqual(testData);
    });
  });

  describe("getFlagProgress", () => {
    test("should return null for non-existent flag", () => {
      const result = getFlagProgress("not-exist");

      expect(result).toBeNull();
    });

    test("should return progress for specific flag", () => {
      // Setup test data
      const testData = {
        us: { flagCode: "us", interval: 1 },
        ca: { flagCode: "ca", interval: 2 },
      };
      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify(testData),
      );

      const result = getFlagProgress("us");

      expect(result).toEqual(testData.us);
    });
  });

  describe("updateFlagProgress", () => {
    beforeEach(() => {
      // Initialize storage
      initializeStorage();
    });

    test("should create new entry for new flag", () => {
      const result = updateFlagProgress("us", true);

      expect(result.flagCode).toBe("us");
      expect(result.totalReviews).toBe(1);
      expect(result.correctReviews).toBe(1);

      // Check that it was saved to localStorage
      const storedData = JSON.parse(
        localStorage.getItem("flag-trainer-spaced-progress")!,
      );
      expect(storedData).toHaveProperty("us");
      expect(storedData.us.flagCode).toBe("us");
    });

    test("should update existing flag progress on correct answer", () => {
      // First create an entry and discard the result
      updateFlagProgress("ca", true);

      // Then update it
      const result = updateFlagProgress("ca", true);

      expect(result.flagCode).toBe("ca");
      expect(result.totalReviews).toBe(2);
      expect(result.correctReviews).toBe(2);

      // After first correct answer, the interval should be 1
      expect(result.interval).toBe(1);
      expect(result.nextReviewDate).toBeTruthy();
    });

    test("should handle multiple correct answers with increasing intervals", () => {
      // Create a flag and train it multiple times
      updateFlagProgress("de", true); // First exposure
      updateFlagProgress("de", true); // Second correct answer
      const result = updateFlagProgress("de", true); // Third correct answer

      expect(result.totalReviews).toBe(3);
      expect(result.correctReviews).toBe(3);

      // After multiple correct answers, the interval should increase
      expect(result.interval).toBe(6); // Based on our algorithm implementation
    });

    test("should update existing flag progress on incorrect answer", () => {
      // First create an entry with multiple correct answers to build up interval
      updateFlagProgress("jp", true);
      updateFlagProgress("jp", true);
      updateFlagProgress("jp", true);

      // Get current state
      const beforeUpdate = getFlagProgress("jp");

      // Then make an incorrect answer
      const result = updateFlagProgress("jp", false);

      expect(result.flagCode).toBe("jp");
      expect(result.totalReviews).toBe(4);
      expect(result.correctReviews).toBe(3);

      // Interval should decrease for incorrect answers
      expect(result.interval).toBeLessThan(beforeUpdate!.interval);
    });
  });

  describe("getDueFlags", () => {
    beforeEach(() => {
      // Initialize storage
      initializeStorage();

      // Setup test data with different due dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const testData: Record<string, FlagProgress> = {
        // Due now
        us: {
          flagCode: "us",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: now.toISOString(),
          totalReviews: 1,
          correctReviews: 1,
          lastReviewedAt: now.toISOString(),
          createdAt: now.toISOString(),
        },
        // Due now
        ca: {
          flagCode: "ca",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: now.toISOString(),
          totalReviews: 1,
          correctReviews: 1,
          lastReviewedAt: now.toISOString(),
          createdAt: now.toISOString(),
        },
        // Not due yet
        jp: {
          flagCode: "jp",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: tomorrow.toISOString(),
          totalReviews: 1,
          correctReviews: 1,
          lastReviewedAt: now.toISOString(),
          createdAt: now.toISOString(),
        },
      };

      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify(testData),
      );
    });

    test("should return all due flags", () => {
      const result = getDueFlags();

      expect(result.length).toBe(2);
      expect(result).toContain("us");
      expect(result).toContain("ca");
      expect(result).not.toContain("jp");
    });

    test("should respect limit parameter", () => {
      const result = getDueFlags(1);

      expect(result.length).toBe(1);
    });
  });

  describe("getProgressStats", () => {
    beforeEach(() => {
      // Initialize storage
      initializeStorage();

      // Setup test data
      const now = new Date();
      const testData: Record<string, FlagProgress> = {
        us: {
          flagCode: "us",
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: now.toISOString(),
          totalReviews: 5,
          correctReviews: 4,
          lastReviewedAt: now.toISOString(),
          createdAt: now.toISOString(),
        },
        ca: {
          flagCode: "ca",
          easeFactor: 2.5,
          interval: 31, // Mastered
          nextReviewDate: now.toISOString(),
          totalReviews: 10,
          correctReviews: 8,
          lastReviewedAt: now.toISOString(),
          createdAt: now.toISOString(),
        },
      };

      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify(testData),
      );
    });

    test("should calculate correct statistics", () => {
      const stats = getProgressStats();

      expect(stats.flagCount).toBe(2);
      expect(stats.totalReviews).toBe(15);
      expect(stats.correctReviews).toBe(12);
      expect(stats.accuracy).toBeCloseTo(80, 0); // 12/15 = 80%
      expect(stats.dueCount).toBe(2);
      expect(stats.masteredCount).toBe(1);
    });
  });

  describe("clearAllProgress", () => {
    test("should clear all progress data", () => {
      // Setup test data
      localStorage.setItem(
        "flag-trainer-spaced-progress",
        JSON.stringify({
          us: { flagCode: "us" },
          ca: { flagCode: "ca" },
        }),
      );

      const result = clearAllProgress();

      expect(result).toBe(true);
      expect(
        JSON.parse(localStorage.getItem("flag-trainer-spaced-progress")!),
      ).toEqual({});
    });
  });
});
