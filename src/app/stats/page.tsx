"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressStats } from "@/lib/spaced-repetition/hooks";
import { initializeSpacedRepetitionSystem } from "@/lib/spaced-repetition/initialize";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverviewPage() {
  // Initialize the system
  useEffect(() => {
    initializeSpacedRepetitionSystem();
  }, []);

  // Get overall progress stats
  const {
    totalFlags,
    learnedFlags,
    masteredFlags,
    dueFlags,
    accuracy,
    isLoading,
    error,
  } = useProgressStats();

  return (
    <>
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
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
                  <Progress
                    value={(learnedFlags / totalFlags) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Flags Mastered</span>
                    <span className="text-sm font-medium">
                      {masteredFlags}/{learnedFlags || 1}
                    </span>
                  </div>
                  <Progress
                    value={(masteredFlags / (learnedFlags || 1)) * 100}
                    className="h-2"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-sm">
                    Overall Accuracy: {accuracy.toFixed(1)}%
                  </p>
                  <p className="text-sm">Flags Due for Review: {dueFlags}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Learning Streak Card */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">7</div>
            <p className="text-muted-foreground">days</p>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm">Learned 5 new flags</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        Date.now() - i * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
