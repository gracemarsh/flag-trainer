"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FlagQuizSession } from "@/components/flag-quiz-session";
import { PageContainer } from "@/components/ui/page-container";

export default function SpacedLearningSessionPage() {
  // Use the spaced learning hook with default parameters
  const {
    answerFlag,
    sessionCompleted,
    results,
    isLoading,
    error,
    restartSession,
    sessionFlags,
  } = useSpacedLearningSession({
    flagCount: 10,
    includeNewFlags: true,
    newFlagRatio: 0.3,
  });

  // Format flags for the FlagQuizSession component
  const [formattedFlags, setFormattedFlags] = useState<
    Array<{
      id: string;
      code: string;
      name: string;
      isNew?: boolean;
      progress?: unknown;
    }>
  >([]);
  const [debugMessage, setDebugMessage] = useState<string>("");

  // Debug function to help identify issues
  useEffect(() => {
    if (sessionFlags) {
      console.log("Session flags available:", sessionFlags.length);
      console.log(
        "Sample flag data:",
        sessionFlags.length > 0 ? sessionFlags[0] : "No flags",
      );
      setDebugMessage(`Session flags: ${sessionFlags.length}`);
    } else {
      console.log("No session flags available");
      setDebugMessage("No session flags available");
    }
  }, [sessionFlags]);

  // Prepare the flags for the session
  useEffect(() => {
    if (sessionFlags && sessionFlags.length > 0) {
      // Map session flags to our internal format with proper country names
      const formatted = sessionFlags.map((flag) => ({
        id: flag.flagCode, // Use flagCode as the ID since it's unique
        code: flag.flagCode,
        name: flag.flagCode, // Just use the code here, adaptFlag will look up the proper name
        isNew: flag.isNew,
        progress: flag.progress,
      }));

      console.log("Formatted flags:", formatted);
      setFormattedFlags(formatted);
    }
  }, [sessionFlags]);

  // Custom answer handler that will be passed to FlagQuizSession
  const handleSpacedAnswer = useCallback(
    (code: string, isCorrect: boolean) => {
      console.log(`Answer received: ${code}, correct: ${isCorrect}`);
      answerFlag(isCorrect);
    },
    [answerFlag],
  );

  // Display loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
          <p className="text-muted-foreground">
            Preparing your personalized learning experience...
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loading your session...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Analyzing your previous learning data
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Display error state
  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
          <p className="text-muted-foreground">
            There was an error loading your personalized session.
          </p>
        </div>

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
      </PageContainer>
    );
  }

  // Display session completed state
  if (sessionCompleted) {
    return (
      <PageContainer>
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Session Completed!</h1>
          <p className="text-muted-foreground">
            Great job! Your progress has been saved for optimal spaced
            repetition.
          </p>
        </div>

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
      </PageContainer>
    );
  }

  // Show debug information if no flags are available
  if (!formattedFlags || formattedFlags.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
          <p className="text-muted-foreground">
            Waiting for your personalized flag data to become available.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loading Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your personalized spaced repetition session is being prepared...
            </p>
            <p className="text-sm text-muted-foreground mt-2">{debugMessage}</p>
            {sessionFlags && (
              <div className="mt-4">
                <p>Session flags count: {sessionFlags.length}</p>
                <pre className="text-xs mt-2 p-2 bg-slate-100 rounded overflow-auto max-h-40">
                  {JSON.stringify(sessionFlags.slice(0, 2), null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Regular session display with FlagQuizSession
  return (
    <PageContainer>
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-3xl font-bold">Spaced Learning Session</h1>
        <p className="text-muted-foreground">
          Review flags based on your learning history using spaced repetition
          for optimal retention.
        </p>
      </div>

      <FlagQuizSession
        flags={formattedFlags}
        sessionTitle="Spaced Learning Session"
        exitPath="/learn/spaced"
        showHints={true}
        onAnswer={handleSpacedAnswer}
      />
    </PageContainer>
  );
}
