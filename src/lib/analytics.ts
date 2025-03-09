import { track } from '@vercel/analytics'

/**
 * Flag training events that can be tracked
 */
export type TrainingEvent =
  | 'session_start'
  | 'session_complete'
  | 'answer_correct'
  | 'answer_incorrect'
  | 'flag_viewed'
  | 'library_search'
  | 'difficulty_changed'
  | 'theme_changed'

/**
 * Track a user action in the application
 * @param event The event name
 * @param properties Additional properties to track with the event
 */
export function trackEvent(
  event: TrainingEvent,
  properties?: Record<string, string | number | boolean>
) {
  // Wrap in try/catch to prevent tracking errors from breaking the app
  try {
    track(event, properties)
  } catch (error) {
    // Log tracking errors only in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error tracking event:', error)
    }
  }
}

/**
 * Helper to track when a user starts a learning session
 * @param sessionType The type of session (quick, beginner, expert, etc.)
 * @param flagCount Number of flags in the session
 */
export function trackSessionStart(sessionType: string, flagCount: number) {
  trackEvent('session_start', {
    sessionType,
    flagCount,
  })
}

/**
 * Helper to track when a user completes a learning session
 * @param sessionType The type of session
 * @param score The score achieved
 * @param totalFlags Total number of flags in the session
 * @param timeSpentSeconds Time spent in seconds
 */
export function trackSessionComplete(
  sessionType: string,
  score: number,
  totalFlags: number,
  timeSpentSeconds: number
) {
  trackEvent('session_complete', {
    sessionType,
    score,
    totalFlags,
    accuracy: Math.round((score / totalFlags) * 100),
    timeSpentSeconds,
  })
}

/**
 * Helper to track when a user views a flag details
 * @param flagCode ISO code of the flag
 * @param flagName Name of the country
 * @param continent Continent of the country
 */
export function trackFlagViewed(flagCode: string, flagName: string, continent: string) {
  trackEvent('flag_viewed', {
    flagCode,
    flagName,
    continent,
  })
}

/**
 * Helper to track answer correctness in training sessions
 * @param flagCode ISO code of the flag
 * @param isCorrect Whether the answer was correct
 * @param responseTimeMs Time taken to answer in milliseconds
 */
export function trackAnswer(flagCode: string, isCorrect: boolean, responseTimeMs: number) {
  trackEvent(isCorrect ? 'answer_correct' : 'answer_incorrect', {
    flagCode,
    responseTimeMs,
  })
}
