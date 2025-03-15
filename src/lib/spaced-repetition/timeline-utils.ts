/**
 * Utility functions and types for timeline visualization
 */

import { format, isSameDay, subDays } from "date-fns";

// Types for timeline data
export interface LearningEvent {
  date: Date;
  flagsLearned: number;
  flagsReviewed: number;
  accuracy: number;
}

export interface DayOfWeekData {
  day: string;
  flagsLearned: number;
  flagsReviewed: number;
  accuracy: number;
}

export interface AggregatedTimelineData {
  dailyActivity: LearningEvent[];
  weekdayBreakdown: DayOfWeekData[];
  progressOverTime: LearningEvent[];
}

export type TimeRange = "7days" | "30days" | "90days" | "all";
export type MetricType = "learned" | "reviewed" | "accuracy";
export type GranularityType = "daily" | "weekly" | "monthly";

// Mock data generator (will be replaced with real data from localStorage)
export function generateMockTimelineData(
  range: TimeRange = "30days",
): AggregatedTimelineData {
  const today = new Date();
  let days = 30;

  switch (range) {
    case "7days":
      days = 7;
      break;
    case "30days":
      days = 30;
      break;
    case "90days":
      days = 90;
      break;
    case "all":
      days = 180; // Simulate "all time" as 6 months for mock data
      break;
  }

  // Generate daily activity
  const dailyActivity: LearningEvent[] = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    // Skip some days randomly to create a more realistic pattern
    if (Math.random() > 0.3) {
      const flagsLearned = Math.floor(Math.random() * 10);
      const flagsReviewed = Math.floor(Math.random() * 15) + flagsLearned;
      const accuracy = Math.min(100, Math.floor(Math.random() * 30) + 70); // 70-100%

      dailyActivity.push({
        date,
        flagsLearned,
        flagsReviewed,
        accuracy,
      });
    }
  }

  // Generate day of week breakdown
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayBreakdown: DayOfWeekData[] = weekdays.map((day) => ({
    day,
    flagsLearned: Math.floor(Math.random() * 20) + 5,
    flagsReviewed: Math.floor(Math.random() * 30) + 10,
    accuracy: Math.min(100, Math.floor(Math.random() * 20) + 75),
  }));

  // Generate cumulative progress (should generally increase over time)
  const progressOverTime: LearningEvent[] = [];
  let totalLearned = 0;
  let totalReviewed = 0;
  let cumulativeAccuracy = 85;

  // Use weekly points for smoother line
  const interval = Math.max(1, Math.floor(days / 10));
  for (let i = days; i >= 0; i -= interval) {
    const date = subDays(today, i);

    // Gradually increase totals
    totalLearned += Math.floor(Math.random() * 10) + 3;
    totalReviewed += Math.floor(Math.random() * 15) + 5;

    // Slight random fluctuation in accuracy, but generally improving
    cumulativeAccuracy = Math.min(
      98,
      cumulativeAccuracy +
        (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? 0 : -0.5),
    );

    progressOverTime.push({
      date,
      flagsLearned: totalLearned,
      flagsReviewed: totalReviewed,
      accuracy: cumulativeAccuracy,
    });
  }

  return {
    dailyActivity,
    weekdayBreakdown,
    progressOverTime,
  };
}

// Format date for display in charts
export function formatChartDate(date: Date): string {
  return format(date, "MMM d");
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

// Get a percentage of total flags
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Extract data for a specific metric
export function getMetricData(
  data: LearningEvent[],
  metric: MetricType,
  normalizeToPercentage = false,
  total = 0,
): { date: Date; value: number }[] {
  return data.map((event) => {
    let value = 0;

    switch (metric) {
      case "learned":
        value = normalizeToPercentage
          ? calculatePercentage(event.flagsLearned, total)
          : event.flagsLearned;
        break;
      case "reviewed":
        value = normalizeToPercentage
          ? calculatePercentage(event.flagsReviewed, total)
          : event.flagsReviewed;
        break;
      case "accuracy":
        value = event.accuracy;
        break;
    }

    return {
      date: event.date,
      value,
    };
  });
}

// Aggregate data based on granularity
export function aggregateDataByGranularity(
  data: LearningEvent[],
  granularity: GranularityType,
): LearningEvent[] {
  if (granularity === "daily" || data.length === 0) {
    return data;
  }

  const aggregated: LearningEvent[] = [];
  let currentPeriodData: LearningEvent[] = [];
  let currentPeriodStart: Date | null = null;

  for (const event of data) {
    if (!currentPeriodStart) {
      currentPeriodStart = event.date;
      currentPeriodData = [event];
      continue;
    }

    const isSamePeriod =
      (granularity === "weekly" &&
        isSameWeek(currentPeriodStart, event.date)) ||
      (granularity === "monthly" &&
        isSameMonth(currentPeriodStart, event.date));

    if (isSamePeriod) {
      currentPeriodData.push(event);
    } else {
      aggregated.push(
        calculateAggregatedData(currentPeriodData, currentPeriodStart),
      );
      currentPeriodStart = event.date;
      currentPeriodData = [event];
    }
  }

  // Add the last period
  if (currentPeriodData.length > 0 && currentPeriodStart) {
    aggregated.push(
      calculateAggregatedData(currentPeriodData, currentPeriodStart),
    );
  }

  return aggregated;
}

// Helper function to check if two dates are in the same week
function isSameWeek(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If dates are more than 7 days apart, they can't be in the same week
  if (diffDays > 7) return false;

  // Check if they're in the same Sunday-to-Saturday week
  const day1 = date1.getDay();
  const day2 = date2.getDay();

  // Get the start of the week for both dates (Sunday)
  const startOfWeek1 = subDays(date1, day1);
  const startOfWeek2 = subDays(date2, day2);

  return isSameDay(startOfWeek1, startOfWeek2);
}

// Helper function to check if two dates are in the same month
function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

// Calculate aggregated data for a period
function calculateAggregatedData(
  events: LearningEvent[],
  periodStart: Date,
): LearningEvent {
  if (events.length === 0) {
    return {
      date: periodStart,
      flagsLearned: 0,
      flagsReviewed: 0,
      accuracy: 0,
    };
  }

  const totalFlagsLearned = events.reduce(
    (sum, event) => sum + event.flagsLearned,
    0,
  );
  const totalFlagsReviewed = events.reduce(
    (sum, event) => sum + event.flagsReviewed,
    0,
  );

  // Weighted accuracy based on the number of reviews
  const totalAccuracy = events.reduce(
    (sum, event) => sum + event.accuracy * event.flagsReviewed,
    0,
  );
  const weightedAccuracy =
    totalFlagsReviewed > 0
      ? totalAccuracy / totalFlagsReviewed
      : events.reduce((sum, event) => sum + event.accuracy, 0) / events.length;

  return {
    date: periodStart,
    flagsLearned: totalFlagsLearned,
    flagsReviewed: totalFlagsReviewed,
    accuracy: weightedAccuracy,
  };
}
