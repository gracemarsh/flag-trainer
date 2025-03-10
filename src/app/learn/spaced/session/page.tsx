"use client";

import { useState, useEffect } from "react";
import { useSpacedLearningSession } from "@/lib/spaced-repetition/hooks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SpacedLearningSessionPage() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Use the spaced learning hook with default parameters
  const {
    currentFlag,
    sessionProgress,
    answerFlag,
    sessionCompleted,
    results,
    isLoading,
    error,
    restartSession,
  } = useSpacedLearningSession({
    flagCount: 10,
    includeNewFlags: true,
    newFlagRatio: 0.3,
  });

  // Function to handle answer selection
  const handleAnswerSelect = (code: string) => {
    if (selectedAnswer) return; // Prevent multiple selections

    setSelectedAnswer(code);
    const isCorrect = code === currentFlag?.flagCode;

    // After a delay, record the answer and move to the next flag
    setTimeout(() => {
      answerFlag(isCorrect);
      setSelectedAnswer(null);
      setShowHint(false);
    }, 1500);
  };

  // Generate options (one correct, three random)
  const [options, setOptions] = useState<Array<{ code: string; name: string }>>(
    [],
  );

  useEffect(() => {
    if (!currentFlag) return;

    // This is a simplified approach. In a real application, you would:
    // 1. Get the correct flag details
    // 2. Get three random flags from your dataset
    // 3. Combine and shuffle them

    // For now, we'll simulate this with some hardcoded options
    const dummyOptions = [
      { code: currentFlag.flagCode, name: currentFlag.flagCode.toUpperCase() },
      { code: "dummy1", name: "Option 1" },
      { code: "dummy2", name: "Option 2" },
      { code: "dummy3", name: "Option 3" },
    ];

    // Shuffle the options
    setOptions([...dummyOptions].sort(() => Math.random() - 0.5));
  }, [currentFlag]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading your session...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Preparing your personalized learning session
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={restartSession}>Try Again</Button>
            <Button variant="outline" asChild className="ml-2">
              <Link href="/learn/spaced">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Display session completed state
  if (sessionCompleted) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Session Completed!</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-4xl font-bold text-green-600">
                  {results.correct.length}
                </p>
                <p className="text-green-600">Correct</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-4xl font-bold text-red-600">
                  {results.incorrect.length}
                </p>
                <p className="text-red-600">Incorrect</p>
              </div>
            </div>

            <div>
              <p className="text-center mb-2">Accuracy</p>
              <Progress
                value={
                  (results.correct.length /
                    (results.correct.length + results.incorrect.length)) *
                  100
                }
                className="h-2"
              />
              <p className="text-center mt-2 text-sm text-muted-foreground">
                {results.correct.length} out of{" "}
                {results.correct.length + results.incorrect.length} flags
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={restartSession}>Start New Session</Button>
            <Button variant="outline" asChild>
              <Link href="/learn/spaced">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Regular session display
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Flag {sessionProgress.completed + 1} of {sessionProgress.total}
          </span>
          <Progress value={sessionProgress.percentage} className="w-32 h-2" />
        </div>
      </div>

      {currentFlag && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {/* Flag Display */}
              <div className="relative w-72 h-48 mb-6 overflow-hidden rounded-lg border shadow-sm">
                {currentFlag.flagCode ? (
                  <Image
                    src={`/flags/${currentFlag.flagCode}.svg`}
                    alt="Flag to identify"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Skeleton className="w-full h-full" />
                )}
              </div>

              {/* Question */}
              <h2 className="text-xl font-semibold mb-6">
                Which country does this flag belong to?
              </h2>

              {/* Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-6">
                {options.map((option) => (
                  <Button
                    key={option.code}
                    onClick={() => handleAnswerSelect(option.code)}
                    disabled={!!selectedAnswer}
                    variant={
                      selectedAnswer === null
                        ? "outline"
                        : option.code === currentFlag.flagCode
                          ? "success"
                          : selectedAnswer === option.code
                            ? "destructive"
                            : "outline"
                    }
                    className={`h-16 text-lg justify-start px-4 ${
                      selectedAnswer !== null &&
                      option.code === currentFlag.flagCode
                        ? "ring-2 ring-green-500 ring-offset-2"
                        : ""
                    }`}
                  >
                    {option.name}
                  </Button>
                ))}
              </div>

              {/* Hint Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                disabled={!!selectedAnswer}
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>

              {/* Hint Content */}
              {showHint && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                  <p>
                    This flag belongs to a country in{" "}
                    {currentFlag.isNew ? "Unknown Region" : "Region Name"}.
                  </p>
                  <p className="mt-1">
                    It was first introduced in{" "}
                    {currentFlag.isNew ? "Unknown Year" : "Year"}.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="ghost" asChild>
              <Link href="/learn/spaced">Exit Session</Link>
            </Button>
            <div className="flex items-center text-sm space-x-1">
              <span className="font-medium">
                {currentFlag.isNew ? "New Flag" : "Review Flag"}
              </span>
              {!currentFlag.isNew && currentFlag.progress && (
                <span className="text-muted-foreground">
                  (Last seen:{" "}
                  {new Date(
                    currentFlag.progress.lastReviewedAt || "",
                  ).toLocaleDateString()}
                  )
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
