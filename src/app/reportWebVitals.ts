import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";
import { track } from "@vercel/analytics";

export function reportWebVitals() {
  // Only run in production to avoid skewing analytics data
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // CLS - Cumulative Layout Shift
  onCLS((metric) => {
    track("web-vitals", {
      name: "CLS",
      value: metric.value,
      id: metric.id,
      label: metric.navigationType,
    });
  });

  // FID - First Input Delay
  onFID((metric) => {
    track("web-vitals", {
      name: "FID",
      value: metric.value,
      id: metric.id,
      label: metric.navigationType,
    });
  });

  // LCP - Largest Contentful Paint
  onLCP((metric) => {
    track("web-vitals", {
      name: "LCP",
      value: metric.value,
      id: metric.id,
      label: metric.navigationType,
    });
  });

  // FCP - First Contentful Paint
  onFCP((metric) => {
    track("web-vitals", {
      name: "FCP",
      value: metric.value,
      id: metric.id,
      label: metric.navigationType,
    });
  });

  // TTFB - Time to First Byte
  onTTFB((metric) => {
    track("web-vitals", {
      name: "TTFB",
      value: metric.value,
      id: metric.id,
      label: metric.navigationType,
    });
  });
}
