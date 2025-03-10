/**
 * Utility for performance monitoring using the Web Performance API
 * and integrating with Vercel Speed Insights
 */

// Define custom performance metrics
export type CustomMetric =
  | "flag-image-load"
  | "quiz-answer-time"
  | "session-load-time"
  | "library-search-time";

/**
 * Start measuring a custom performance metric
 * @param metricName Name of the metric to measure
 * @param id Optional ID to distinguish between multiple instances of the same metric
 */
export function startMeasure(metricName: CustomMetric, id?: string): void {
  if (
    typeof window === "undefined" ||
    !window.performance ||
    !window.performance.mark
  ) {
    return;
  }

  const markName = id ? `${metricName}-${id}-start` : `${metricName}-start`;
  window.performance.mark(markName);
}

/**
 * End measuring a custom performance metric and record it
 * @param metricName Name of the metric that was being measured
 * @param id Optional ID matching the one used in startMeasure
 * @returns The duration in milliseconds, or undefined if measurement failed
 */
export function endMeasure(
  metricName: CustomMetric,
  id?: string,
): number | undefined {
  if (
    typeof window === "undefined" ||
    !window.performance ||
    !window.performance.mark ||
    !window.performance.measure
  ) {
    return undefined;
  }

  const startMarkName = id
    ? `${metricName}-${id}-start`
    : `${metricName}-start`;
  const endMarkName = id ? `${metricName}-${id}-end` : `${metricName}-end`;

  // Mark the end
  window.performance.mark(endMarkName);

  try {
    // Create a measure between start and end mark
    const measureName = id ? `${metricName}-${id}` : metricName;
    window.performance.measure(measureName, startMarkName, endMarkName);

    // Get the measure
    const entries = window.performance.getEntriesByName(measureName, "measure");
    if (entries.length > 0) {
      const duration = entries[0].duration;

      // Report the measure to console in development
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `Performance: ${measureName} took ${duration.toFixed(2)}ms`,
        );
      }

      return duration;
    }
  } catch (error) {
    console.error(`Error measuring performance for ${metricName}:`, error);
  }

  return undefined;
}

/**
 * Measure the time it takes to execute a function
 * @param metricName Name of the metric to measure
 * @param fn Function to measure
 * @param id Optional ID to distinguish between multiple instances of the same metric
 * @returns The result of the function
 */
export async function measureAsync<T>(
  metricName: CustomMetric,
  fn: () => Promise<T>,
  id?: string,
): Promise<T> {
  startMeasure(metricName, id);

  try {
    const result = await fn();
    endMeasure(metricName, id);
    return result;
  } catch (error) {
    endMeasure(metricName, id);
    throw error;
  }
}

/**
 * Measure the load time of an image
 * @param src Image source URL
 * @param id Optional ID to distinguish between multiple images
 * @returns A promise that resolves when the image is loaded
 */
export function measureImageLoad(src: string, id?: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const metricId = id || src.substring(src.lastIndexOf("/") + 1);
    startMeasure("flag-image-load", metricId);

    const img = new Image();
    img.onload = () => {
      endMeasure("flag-image-load", metricId);
      resolve();
    };
    img.onerror = () => {
      // Still end measurement even if there's an error
      endMeasure("flag-image-load", metricId);
      resolve();
    };
    img.src = src;
  });
}
