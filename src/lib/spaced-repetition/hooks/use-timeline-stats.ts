/**
 * Hook for retrieving timeline statistics from the spaced repetition system
 */

import { useState, useEffect } from "react";
import {
  AggregatedTimelineData,
  TimeRange,
  generateMockTimelineData,
} from "../timeline-utils";

/**
 * Hook that returns timeline statistics for the spaced repetition system.
 * Currently uses mock data but would eventually pull from localStorage/server.
 */
export function useTimelineStats(range: TimeRange = "30days") {
  const [data, setData] = useState<AggregatedTimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: In the future, this would fetch real data from the spaced repetition system
      // by parsing localStorage data and aggregating it based on the selected time range.
      // For now, we use mock data.

      // Simulate network delay for mock data
      const timeoutId = setTimeout(() => {
        const timelineData = generateMockTimelineData(range);
        setData(timelineData);
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error("Error fetching timeline data", err);
      setError("Failed to fetch timeline data");
      setIsLoading(false);
    }
  }, [range]);

  return {
    data,
    isLoading,
    error,
  };
}
