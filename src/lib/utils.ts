import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if localStorage is available (for SSR compatibility)
 * @returns boolean indicating if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Test if localStorage is available and functioning
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if navigator is available (for SSR compatibility)
 * @returns boolean indicating if navigator is available
 */
export function isNavigatorAvailable(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

/**
 * Get a flag image URL from flagcdn.com
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g. 'US', 'GB')
 * @param size Size of the flag image (width in pixels)
 * @returns URL to the flag image
 */
export function getFlagImageUrl(
  countryCode: string,
  size: number = 320,
): string {
  if (!countryCode) {
    console.warn("Warning: Invalid country code provided to getFlagImageUrl");
    return "/placeholder-flag.png"; // Fallback image path
  }
  return `https://flagcdn.com/w${size}/${countryCode.toLowerCase()}.png`;
}

/**
 * Get a flag SVG URL from flagcdn.com
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g. 'US', 'GB')
 * @returns URL to the flag SVG
 */
export function getFlagSvgUrl(countryCode: string): string {
  if (!countryCode) {
    console.warn("Warning: Invalid country code provided to getFlagSvgUrl");
    return "/placeholder-flag.svg"; // Fallback image path
  }
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}

/**
 * Get a flag image URL with a fallback to local SVGs
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g. 'US', 'GB')
 * @param size Size of the flag image (width in pixels) - only used for PNG fallback
 * @returns URL to the flag image
 */
export function getFlagUrl(
  countryCode: string | undefined,
  size: number = 320,
): string {
  // Safety check for undefined or invalid country code
  if (!countryCode) {
    console.warn("Warning: Invalid country code provided to getFlagUrl");
    return "/placeholder-flag.svg"; // Fallback image path
  }

  // For high-resolution displays, we might want to use PNG instead of SVG
  // This is just a placeholder for future implementation
  const useHighResPng = false;

  if (useHighResPng && size > 320) {
    return getFlagImageUrl(countryCode, size);
  }

  // Use SVG from flagcdn.com for better quality and scalability
  return getFlagSvgUrl(countryCode);
}
