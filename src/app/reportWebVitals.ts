import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'
import { inject } from '@vercel/analytics'

export function reportWebVitals() {
  // Only run in production to avoid skewing analytics data
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // CLS - Cumulative Layout Shift
  onCLS((metric) => {
    inject({
      event: 'web-vitals',
      data: {
        name: 'CLS',
        value: metric.value,
        id: metric.id,
        label: metric.navigationType,
      },
    })
  })

  // FID - First Input Delay
  onFID((metric) => {
    inject({
      event: 'web-vitals',
      data: {
        name: 'FID',
        value: metric.value,
        id: metric.id,
        label: metric.navigationType,
      },
    })
  })

  // LCP - Largest Contentful Paint
  onLCP((metric) => {
    inject({
      event: 'web-vitals',
      data: {
        name: 'LCP',
        value: metric.value,
        id: metric.id,
        label: metric.navigationType,
      },
    })
  })

  // FCP - First Contentful Paint
  onFCP((metric) => {
    inject({
      event: 'web-vitals',
      data: {
        name: 'FCP',
        value: metric.value,
        id: metric.id,
        label: metric.navigationType,
      },
    })
  })

  // TTFB - Time to First Byte
  onTTFB((metric) => {
    inject({
      event: 'web-vitals',
      data: {
        name: 'TTFB',
        value: metric.value,
        id: metric.id,
        label: metric.navigationType,
      },
    })
  })
}
