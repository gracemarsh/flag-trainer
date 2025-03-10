import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
 * @param size Size of the flag image (width in pixels)
 * @returns URL to the flag image
 */
export function getFlagUrl(
  countryCode: string | undefined,
  size: number = 320,
): string {
  // Safety check for undefined or invalid country code
  if (!countryCode) {
    console.warn("Warning: Invalid country code provided to getFlagUrl");
    return "/placeholder-flag.png"; // Fallback image path
  }

  // Use the flagcdn.com URL
  return getFlagImageUrl(countryCode, size);

  // For fallback, we could return a local path if needed:
  // return `/flags/${countryCode.toLowerCase()}.svg`;
}
