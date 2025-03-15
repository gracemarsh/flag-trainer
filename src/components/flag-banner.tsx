"use client";

import React, { useEffect, useState } from "react";
import { FlagImage } from "@/components/ui/flag-image";
import { getFlagRows } from "@/lib/country-codes";

interface FlagBannerProps {
  children: React.ReactNode;
}

export function FlagBanner({ children }: FlagBannerProps) {
  const [flagRows, setFlagRows] = useState<{
    row1: string[];
    row2: string[];
    row3: string[];
    row4: string[];
  }>({
    row1: [],
    row2: [],
    row3: [],
    row4: [],
  });

  // Initialize flag rows on component mount
  useEffect(() => {
    const rows = getFlagRows();
    console.log("Flag rows loaded:", rows);
    setFlagRows(rows);
  }, []);

  // Add debug placeholder flags if rows are empty
  const row1 =
    flagRows.row1.length > 0 ? flagRows.row1 : ["us", "ca", "gb", "fr", "de"];
  const row2 =
    flagRows.row2.length > 0 ? flagRows.row2 : ["jp", "cn", "in", "br", "ru"];
  const row3 =
    flagRows.row3.length > 0 ? flagRows.row3 : ["au", "za", "mx", "ar", "it"];
  const row4 =
    flagRows.row4.length > 0 ? flagRows.row4 : ["es", "pt", "gr", "ch", "se"];

  return (
    <div className="relative w-full py-16 md:py-24 bg-muted/20 h-[600px] md:h-[700px] flex items-center">
      <div className="absolute inset-0 opacity-80">
        {/* Row 1 - Left to Right - No offset */}
        <div className="flag-banner-row">
          <div className="inline-flex animate-slide-left">
            {/* Display each flag once, then repeat the entire row */}
            {[...row1, ...row1].map((code, index) => (
              <div key={`row1-${code}-${index}`} className="px-3">
                <div className="w-60 h-36">
                  <FlagImage countryCode={code} size="lg" className="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right to Left - 25% offset */}
        <div className="flag-banner-row my-2">
          <div
            className="inline-flex animate-slide-right"
            style={{ transform: "translateX(-25%)" }}
          >
            {/* Display each flag once, then repeat the entire row */}
            {[...row2, ...row2].map((code, index) => (
              <div key={`row2-${code}-${index}`} className="px-3">
                <div className="w-60 h-36">
                  <FlagImage countryCode={code} size="lg" className="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - Left to Right - 12.5% offset */}
        <div className="flag-banner-row my-2">
          <div
            className="inline-flex animate-slide-left"
            style={{ transform: "translateX(-12.5%)" }}
          >
            {/* Display each flag once, then repeat the entire row */}
            {[...row3, ...row3].map((code, index) => (
              <div key={`row3-${code}-${index}`} className="px-3">
                <div className="w-60 h-36">
                  <FlagImage countryCode={code} size="lg" className="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 - Right to Left - 37.5% offset */}
        <div className="flag-banner-row">
          <div
            className="inline-flex animate-slide-right"
            style={{ transform: "translateX(-37.5%)" }}
          >
            {/* Display each flag once, then repeat the entire row */}
            {[...row4, ...row4].map((code, index) => (
              <div key={`row4-${code}-${index}`} className="px-3">
                <div className="w-60 h-36">
                  <FlagImage countryCode={code} size="lg" className="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="flag-banner-gradient-left" />
        <div className="flag-banner-gradient-right" />
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex items-center justify-center w-full">
        <div className="text-center bg-background/85 px-8 py-10 rounded-lg backdrop-blur-sm shadow-lg max-w-3xl mx-4">
          {children}
        </div>
      </div>
    </div>
  );
}
