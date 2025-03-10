"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useProgressStats } from "@/lib/spaced-repetition/hooks";
import { initializeSpacedRepetitionSystem } from "@/lib/spaced-repetition/initialize";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for continent data
interface ContinentStats {
  continent: string;
  total: number;
  learned: number;
  mastered: number;
}

export default function ProgressVisualization() {
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

  // Placeholder for continent data (in a real app, this would come from an API)
  const [continentStats, setContinentStats] = useState<ContinentStats[]>([]);
  const [continentLoading, setContinentLoading] = useState(true);

  // Simulate loading continent data
  useEffect(() => {
    const timer = setTimeout(() => {
      setContinentStats([
        { continent: "Africa", total: 54, learned: 12, mastered: 5 },
        { continent: "Asia", total: 48, learned: 15, mastered: 8 },
        { continent: "Europe", total: 44, learned: 22, mastered: 16 },
        { continent: "North America", total: 23, learned: 8, mastered: 4 },
        { continent: "Oceania", total: 14, learned: 3, mastered: 1 },
        { continent: "South America", total: 12, learned: 6, mastered: 3 },
      ]);
      setContinentLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Learning Progress</h1>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="continents">By Continent</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
                        <span className="text-sm font-medium">
                          Flags Learned
                        </span>
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
                        <span className="text-sm font-medium">
                          Flags Mastered
                        </span>
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
                      <p className="text-sm">
                        Flags Due for Review: {dueFlags}
                      </p>
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
        </TabsContent>

        <TabsContent value="continents">
          <Card>
            <CardHeader>
              <CardTitle>Progress by Continent</CardTitle>
            </CardHeader>
            <CardContent>
              {continentLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-full h-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {continentStats.map((continent) => (
                    <div key={continent.continent} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {continent.continent}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {continent.learned}/{continent.total} learned,{" "}
                          {continent.mastered} mastered
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{
                              width: `${(continent.mastered / continent.total) * 100}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                          ></div>
                          <div
                            style={{
                              width: `${((continent.learned - continent.mastered) / continent.total) * 100}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                        <div className="flex text-xs mt-1">
                          <span className="inline-block w-3 h-3 mr-1 bg-green-500 rounded-sm"></span>
                          <span className="mr-3">Mastered</span>
                          <span className="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-sm"></span>
                          <span>In Progress</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Learning Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg">
                <p className="text-muted-foreground">
                  Timeline visualization coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
