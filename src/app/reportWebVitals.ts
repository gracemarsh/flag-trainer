import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'
import { type MetricObject } from '@vercel/analytics'
import { sendAnalyticsEvent } from '@vercel/analytics/web'

export function reportWebVitals() {
  // Only run in production to avoid skewing analytics data
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // CLS - Cumulative Layout Shift
  onCLS((metric) => {
    const vitalsMetric: MetricObject = {
      name: 'CLS',
      value: metric.value,
      id: metric.id,
    }
    sendAnalyticsEvent('web-vitals', vitalsMetric)
  })

  // FID - First Input Delay
  onFID((metric) => {
    const vitalsMetric: MetricObject = {
      name: 'FID',
      value: metric.value,
      id: metric.id,
    }
    sendAnalyticsEvent('web-vitals', vitalsMetric)
  })

  // LCP - Largest Contentful Paint
  onLCP((metric) => {
    const vitalsMetric: MetricObject = {
      name: 'LCP',
      value: metric.value,
      id: metric.id,
    }
    sendAnalyticsEvent('web-vitals', vitalsMetric)
  })

  // FCP - First Contentful Paint
  onFCP((metric) => {
    const vitalsMetric: MetricObject = {
      name: 'FCP',
      value: metric.value,
      id: metric.id,
    }
    sendAnalyticsEvent('web-vitals', vitalsMetric)
  })

  // TTFB - Time to First Byte
  onTTFB((metric) => {
    const vitalsMetric: MetricObject = {
      name: 'TTFB',
      value: metric.value,
      id: metric.id,
    }
    sendAnalyticsEvent('web-vitals', vitalsMetric)
  })
}
