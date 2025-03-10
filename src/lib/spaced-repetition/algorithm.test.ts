import {
  calculateNextReview,
  getInitialLearningParameters,
  formatNextReviewTime,
} from "./algorithm";

describe("Spaced Repetition Algorithm", () => {
  describe("calculateNextReview", () => {
    test("should handle first correct answer", () => {
      const initialEaseFactor = 2.5;
      const initialInterval = 0;

      const result = calculateNextReview(
        true,
        initialEaseFactor,
        initialInterval,
      );

      expect(result.interval).toBe(1);
      // With quality rating 4, the ease factor doesn't change much on first round
      expect(result.easeFactor).toBeCloseTo(2.5, 1);
      expect(result.nextReviewDate).toBeInstanceOf(Date);

      // Next review should be 1 day from now
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 1);
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });

    test("should handle second correct answer", () => {
      const previousEaseFactor = 2.5;
      const previousInterval = 1;

      const result = calculateNextReview(
        true,
        previousEaseFactor,
        previousInterval,
      );

      expect(result.interval).toBe(6);
      // The precise value is 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02)) = 2.5 + 0.02 = 2.52
      expect(result.easeFactor).toBeCloseTo(2.52, 2);
      expect(result.nextReviewDate).toBeInstanceOf(Date);

      // Next review should be 6 days from now
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 6);
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });

    test("should handle subsequent correct answers", () => {
      const previousEaseFactor = 2.52;
      const previousInterval = 6;

      const result = calculateNextReview(
        true,
        previousEaseFactor,
        previousInterval,
      );

      // 6 days * 2.52 ease factor ≈ 15 days (rounded)
      expect(result.interval).toBe(Math.round(6 * 2.52));
      expect(result.easeFactor).toBeCloseTo(2.54, 2); // The ease factor increases slightly
      expect(result.nextReviewDate).toBeInstanceOf(Date);

      // Next review should be about 15 days from now
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + Math.round(6 * 2.52));
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });

    test("should handle incorrect answers", () => {
      const previousEaseFactor = 2.5;
      const previousInterval = 6;

      const result = calculateNextReview(
        false,
        previousEaseFactor,
        previousInterval,
      );

      // Should reduce interval by about half, but at least 1 day
      expect(result.interval).toBe(3);
      // The ease factor decreases significantly with incorrect answers
      expect(result.easeFactor).toBeCloseTo(1.96, 2);
      expect(result.nextReviewDate).toBeInstanceOf(Date);

      // Next review should be 3 days from now
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3);
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });

    test("should enforce minimum ease factor", () => {
      const veryLowEaseFactor = 1.1; // Below minimum
      const previousInterval = 10;

      const result = calculateNextReview(
        false,
        veryLowEaseFactor,
        previousInterval,
      );

      expect(result.easeFactor).toBe(1.3); // Should be capped at minimum
    });

    test("should enforce maximum interval", () => {
      const highEaseFactor = 2.5;
      const veryLargeInterval = 200;

      // This would normally result in a very large interval: 200 * 2.5 = 500
      const result = calculateNextReview(
        true,
        highEaseFactor,
        veryLargeInterval,
      );

      expect(result.interval).toBe(365); // Should be capped at 365 days
    });
  });

  describe("getInitialLearningParameters", () => {
    test("should return correct initial parameters", () => {
      const result = getInitialLearningParameters();

      expect(result.easeFactor).toBe(2.5);
      expect(result.interval).toBe(0);
      expect(result.nextReviewDate).toBeInstanceOf(Date);

      // Should be today's date
      const today = new Date();
      expect(result.nextReviewDate.getDate()).toBe(today.getDate());
    });
  });

  describe("formatNextReviewTime", () => {
    test("should format today correctly", () => {
      const today = new Date();

      const result = formatNextReviewTime(today);

      expect(result).toBe("today");
    });

    test("should format tomorrow correctly", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = formatNextReviewTime(tomorrow);

      expect(result).toBe("tomorrow");
    });

    test("should format future days correctly", () => {
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

      const result = formatNextReviewTime(fiveDaysLater);

      expect(result).toBe("in 5 days");
    });
  });
});
