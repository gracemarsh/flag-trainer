import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer component provides consistent layout with responsive margins
 * and proper content centering across different pages.
 *
 * @param children The content to be displayed within the container
 * @param className Additional CSS classes to be applied to the container
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        // Base container styles
        "container mx-auto px-4 sm:px-6 md:px-8 py-8",
        // Allow additional classes to be passed in
        className,
      )}
    >
      {children}
    </div>
  );
}
