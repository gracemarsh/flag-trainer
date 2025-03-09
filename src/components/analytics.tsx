'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

type AnalyticsProps = {
  /**
   * Whether to enable Vercel Analytics
   * @default process.env.NODE_ENV === 'production'
   */
  enabled?: boolean
  /**
   * Whether to collect additional information
   * such as the user's preferred language, screen size, etc.
   * @default false
   */
  debug?: boolean
  /**
   * The mode to run the analytics in
   * @default 'auto'
   */
  mode?: 'auto' | 'development' | 'production'
}

/**
 * Analytics component that can be used to track page views and other events
 * This is a wrapper around Vercel Analytics that allows for configuration
 */
export function Analytics({
  enabled = process.env.NODE_ENV === 'production',
  debug = false,
  mode = 'auto',
}: AnalyticsProps) {
  return <VercelAnalytics debug={debug} mode={mode} />
}
