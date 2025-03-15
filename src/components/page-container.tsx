import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn("w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8", className)}
    >
      {children}
    </div>
  );
}
