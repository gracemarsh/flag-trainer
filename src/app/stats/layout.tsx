"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/stats", current: pathname === "/stats" },
    {
      name: "By Continent",
      href: "/stats/continent",
      current: pathname === "/stats/continent",
    },
    {
      name: "Timeline",
      href: "/stats/timeline",
      current: pathname === "/stats/timeline",
    },
  ];

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold">Your Learning Progress</h1>

      <nav className="inline-flex space-x-1 rounded-md bg-muted p-1 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              tab.current
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.name}
          </Link>
        ))}
      </nav>

      {children}
    </PageContainer>
  );
}
