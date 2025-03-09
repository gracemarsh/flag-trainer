import { useEffect, useRef, useCallback } from 'react'
import { startMeasure, endMeasure, CustomMetric } from '@/lib/performance'

/**
 * Hook to measure component performance metrics
 * @param componentName Name of the component (used as prefix for metrics)
 * @param options Configuration options
 * @returns Object with performance measurement methods
 */
export function usePerformance(
  componentName: string,
  options: {
    /**
     * Whether to measure the component's mount time
     * @default true
     */
    measureMountTime?: boolean
    /**
     * Whether to measure the component's render time
     * @default false
     */
    measureRenderTime?: boolean
    /**
     * Whether to log measurements to console in development
     * @default true
     */
    debug?: boolean
  } = {}
) {
  const { measureMountTime = true, measureRenderTime = false, debug = true } = options

  // Refs to track measurements
  const mountTimeRef = useRef<number | null>(null)
  const renderCountRef = useRef(0)
  const renderStartTimeRef = useRef(0)

  // Start render time measurement
  if (measureRenderTime && typeof window !== 'undefined') {
    renderStartTimeRef.current = performance.now()
  }

  // Measure mount time
  useEffect(() => {
    if (measureMountTime) {
      const metricName = `${componentName}-mount` as CustomMetric
      startMeasure(metricName)

      // Use requestAnimationFrame to measure after first paint
      requestAnimationFrame(() => {
        mountTimeRef.current = endMeasure(metricName)

        if (debug && process.env.NODE_ENV !== 'production' && mountTimeRef.current) {
          console.log(
            `[Performance] ${componentName} mounted in ${mountTimeRef.current.toFixed(2)}ms`
          )
        }
      })
    }

    return () => {
      if (debug && process.env.NODE_ENV !== 'production') {
        console.log(
          `[Performance] ${componentName} unmounted after ${renderCountRef.current} renders`
        )
      }
    }
  }, [componentName, measureMountTime, debug])

  // Log render time if enabled
  useEffect(() => {
    renderCountRef.current += 1

    if (measureRenderTime && typeof window !== 'undefined') {
      const renderTime = performance.now() - renderStartTimeRef.current

      if (debug && process.env.NODE_ENV !== 'production') {
        console.log(
          `[Performance] ${componentName} render #${renderCountRef.current} took ${renderTime.toFixed(2)}ms`
        )
      }
    }
  })

  // Function to measure a specific operation
  const measureOperation = useCallback(
    (operationName: string, operation: () => void) => {
      const metricName = `${componentName}-${operationName}` as CustomMetric
      startMeasure(metricName)

      try {
        operation()
      } finally {
        const duration = endMeasure(metricName)

        if (debug && process.env.NODE_ENV !== 'production' && duration) {
          console.log(
            `[Performance] ${componentName}.${operationName} took ${duration.toFixed(2)}ms`
          )
        }
      }
    },
    [componentName, debug]
  )

  // Function to measure an async operation
  const measureAsyncOperation = useCallback(
    async <T>(operationName: string, asyncOperation: () => Promise<T>): Promise<T> => {
      const metricName = `${componentName}-${operationName}` as CustomMetric
      startMeasure(metricName)

      try {
        const result = await asyncOperation()
        return result
      } finally {
        const duration = endMeasure(metricName)

        if (debug && process.env.NODE_ENV !== 'production' && duration) {
          console.log(
            `[Performance] ${componentName}.${operationName} took ${duration.toFixed(2)}ms`
          )
        }
      }
    },
    [componentName, debug]
  )

  return {
    measureOperation,
    measureAsyncOperation,
    renderCount: renderCountRef.current,
  }
}
