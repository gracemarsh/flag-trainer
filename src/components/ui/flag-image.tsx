"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getFlagUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FlagImageProps {
  countryCode: string;
  altText?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onLoad?: () => void;
}

/**
 * FlagImage component that displays flags with fixed height while preserving aspect ratio
 *
 * @param countryCode The ISO country code (e.g., "US", "FR")
 * @param altText Alternative text for the image (defaults to "Flag")
 * @param size Size variant of the flag (sm: 40px, md: 80px, lg: 120px, xl: 160px height)
 * @param className Additional CSS classes
 * @param onLoad Callback for when the image loads
 */
export function FlagImage({
  countryCode,
  altText,
  size = "md",
  className,
  onLoad,
}: FlagImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Map size to fixed heights
  const heightMap = {
    sm: 40, // 40px height for small flags
    md: 80, // 80px height for medium flags
    lg: 120, // 120px height for large flags
    xl: 160, // 160px height for extra large flags
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Get flag URL with appropriate size (width parameter will scale proportionally)
  // We'll request a higher resolution to ensure quality
  const flagUrl = getFlagUrl(countryCode, heightMap[size] * 2);

  return (
    <div
      className={cn(
        "relative flag-container flex items-center justify-center",
        className,
      )}
      style={{
        height: `${heightMap[size]}px`,
        // No fixed width, allow it to be determined by the image
        minWidth: `${heightMap[size] / 2}px`, // Minimum width to prevent collapse
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <Image
        src={flagUrl}
        alt={altText || `Flag of ${countryCode}`}
        className={cn(
          "h-full w-auto object-contain transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={handleImageLoad}
        width={heightMap[size] * 2} // Set initial width for Next.js Image
        height={heightMap[size]} // Fixed height
        style={{
          height: heightMap[size],
          width: "auto", // Allow width to adjust based on aspect ratio
          maxWidth: "none", // Prevent image from being constrained by container
        }}
      />
    </div>
  );
}
