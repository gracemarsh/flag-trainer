"use client";

import { useEffect, useState } from "react";
import { useProgressStats, useSyncStatus } from "@/lib/spaced-repetition/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { initializeSpacedRepetitionSystem } from "@/lib/spaced-repetition/initialize";
import OfflineStatusIndicator from "@/components/offline-status-indicator";
import { PageContainer } from "@/components/ui/page-container";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Create a client-only wrapper component
function ClientOnlySpacedLearningDashboard() {
  // Initialize the system when the component mounts
  useEffect(() => {
    initializeSpacedRepetitionSystem();
  }, []);

  // Get progress statistics
  const {
    totalFlags,
    learnedFlags,
    masteredFlags,
    dueFlags,
    accuracy,
    isLoading: statsLoading,
    error: statsError,
  } = useProgressStats();

  // Initialize sync status (for offline indicator)
  useSyncStatus(true);

  // Calculate progress percentages
  const learningProgress = totalFlags
    ? Math.round((learnedFlags / totalFlags) * 100)
    : 0;
  const masteryProgress = learnedFlags
    ? Math.round((masteredFlags / learnedFlags) * 100)
    : 0;

  return (
    <PageContainer className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Flag Learning Progress</h1>
        <div className="w-64">
          <OfflineStatusIndicator />
        </div>
      </div>

      {statsError && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{statsError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your learning progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Flags Learned</span>
                    <span className="text-sm font-medium">
                      {learnedFlags}/{totalFlags}
                    </span>
                  </div>
                  <Progress value={learningProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Flags Mastered</span>
                    <span className="text-sm font-medium">
                      {masteredFlags}/{learnedFlags}
                    </span>
                  </div>
                  <Progress value={masteryProgress} className="h-2" />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium">
                    Overall Accuracy: {accuracy.toFixed(1)}%
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/library">Browse Flag Library</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Due for Review Card */}
        <Card>
          <CardHeader>
            <CardTitle>Due for Review</CardTitle>
            <CardDescription>Flags that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-5xl font-bold">{dueFlags}</p>
                <p className="text-muted-foreground">flags due for review</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild disabled={dueFlags === 0} className="w-full">
              <Link href="/learn/spaced/session">Start Review Session</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Learning Options Card */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Options</CardTitle>
            <CardDescription>Choose how you want to learn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/learn/continent">
                  <span className="text-xs uppercase">Learn by</span>
                  <span className="text-lg font-bold">Continent</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/learn/quick">
                  <span className="text-xs uppercase">Start a</span>
                  <span className="text-lg font-bold">Quick Session</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/library">
                  <span className="text-xs uppercase">Find</span>
                  <span className="text-lg font-bold">Specific Flag</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/stats">
                  <span className="text-xs uppercase">View Your</span>
                  <span className="text-lg font-bold">Statistics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

// Main component with client-side rendering
export default function SpacedLearningDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show a loading state during SSR
  if (!isMounted) {
    return (
      <PageContainer className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Flag Learning Progress</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Render the client-only component once mounted
  return <ClientOnlySpacedLearningDashboard />;
}
