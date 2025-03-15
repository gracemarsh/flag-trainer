"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeSpacedRepetitionSystem } from "@/lib/spaced-repetition/initialize";

// Interface for continent data
interface ContinentStats {
  continent: string;
  total: number;
  learned: number;
  mastered: number;
}

export default function StatsContinentPage() {
  // Initialize the system
  useEffect(() => {
    initializeSpacedRepetitionSystem();
  }, []);

  // Placeholder for continent data (in a real app, this would come from an API)
  const [continentStats, setContinentStats] = useState<ContinentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress by Continent</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
                  <span className="font-medium">{continent.continent}</span>
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
                        width: `${
                          ((continent.learned - continent.mastered) /
                            continent.total) *
                          100
                        }%`,
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
  );
}
