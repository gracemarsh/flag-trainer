"use client";

import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/react";

type SpeedInsightsProps = {
  /**
   * Whether to enable Vercel Speed Insights
   * @default process.env.NODE_ENV === 'production'
   */
  enabled?: boolean;
  /**
   * Whether to log debug information to the console
   * @default false
   */
  debug?: boolean;
  /**
   * Sample rate between 0 and 1
   * @default 1
   */
  sampleRate?: number;
  /**
   * Route change sampling strategy
   * @default 'all'
   */
  route?: "all" | "none";
};

/**
 * Speed Insights component that can be used to track performance metrics
 * This is a wrapper around Vercel Speed Insights that allows for configuration
 */
export function SpeedInsights({
  enabled = process.env.NODE_ENV === "production",
  debug = false,
  sampleRate = 1,
  route = "all",
}: SpeedInsightsProps) {
  if (!enabled) {
    return null;
  }

  return (
    <VercelSpeedInsights debug={debug} sampleRate={sampleRate} route={route} />
  );
}
