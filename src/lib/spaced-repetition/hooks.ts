/**
 * React Hooks for Spaced Repetition Learning
 * Provides custom hooks for managing spaced repetition learning sessions
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  initializeStorage,
  getAllProgressData,
  updateFlagProgress,
  getDueFlags,
  getProgressStats,
  FlagProgress,
} from "./storage";

// Types for the hooks
export interface SpacedLearningSessionConfig {
  flagCount?: number;
  includeNewFlags?: boolean;
  newFlagRatio?: number; // 0-1 representing percentage of new flags to include
  continentFilter?: string;
}

export interface FlagWithProgress {
  flagCode: string;
  isNew: boolean;
  progress?: FlagProgress;
}

export interface SpacedLearningStats {
  totalFlags: number;
  learnedFlags: number;
  masteredFlags: number;
  dueFlags: number;
  accuracy: number;
}

// Define a basic Flag type for API responses
interface Flag {
  code: string;
  name: string;
}

/**
 * Hook to manage a spaced repetition learning session
 * @param config Configuration for the learning session
 */
export function useSpacedLearningSession(
  config: SpacedLearningSessionConfig = {},
) {
  const { flagCount = 10, includeNewFlags = true, newFlagRatio = 0.3 } = config;

  // State for the current session
  const [sessionFlags, setSessionFlags] = useState<FlagWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [results, setResults] = useState<{
    correct: string[];
    incorrect: string[];
  }>({
    correct: [],
    incorrect: [],
  });

  // Get the current flag
  const currentFlag = useMemo(
    () =>
      sessionFlags.length > 0 && currentIndex < sessionFlags.length
        ? sessionFlags[currentIndex]
        : null,
    [sessionFlags, currentIndex],
  );

  // Initialize the session by selecting flags
  const initializeSession = useCallback(async () => {
    // Make sure storage is initialized
    initializeStorage();

    // Get all available flags (would come from the database)
    // For this implementation, we'll mock this with a simplified approach
    // In a real implementation, we would get this from an API or database
    const availableFlagCodes = await fetch("/api/flags")
      .then((res) => res.json())
      .then((data: Flag[]) => data.map((flag: Flag) => flag.code))
      .catch(() => {
        // Fallback for demo/development - we'll use a simple array of flag codes
        return [
          "us",
          "ca",
          "gb",
          "au",
          "fr",
          "de",
          "jp",
          "cn",
          "br",
          "mx",
          "es",
          "it",
        ];
      });

    // Get due flags for review
    const dueFlagCodes = getDueFlags();

    // Determine how many new flags to include
    const newFlagsToInclude = includeNewFlags
      ? Math.floor(flagCount * newFlagRatio)
      : 0;

    // Get flags that have never been seen before
    const allProgress = getAllProgressData();
    const learnedFlagCodes = Object.keys(allProgress);
    const newFlagCodes = availableFlagCodes.filter(
      (code: string) => !learnedFlagCodes.includes(code),
    );

    // Create the session flags array
    const session: FlagWithProgress[] = [];

    // Add due flags first (up to flagCount - newFlagsToInclude)
    const reviewFlags = dueFlagCodes.slice(0, flagCount - newFlagsToInclude);
    reviewFlags.forEach((code) => {
      session.push({
        flagCode: code,
        isNew: false,
        progress: allProgress[code],
      });
    });

    // If we need more review flags, add some that aren't due yet
    const nonDueFlagCodes = learnedFlagCodes.filter(
      (code) => !dueFlagCodes.includes(code),
    );
    const additionalReviewFlags = Math.max(
      0,
      flagCount - newFlagsToInclude - reviewFlags.length,
    );

    if (additionalReviewFlags > 0 && nonDueFlagCodes.length > 0) {
      const selectedNonDueFlagCodes = nonDueFlagCodes.slice(
        0,
        additionalReviewFlags,
      );

      selectedNonDueFlagCodes.forEach((code) => {
        session.push({
          flagCode: code,
          isNew: false,
          progress: allProgress[code],
        });
      });
    }

    // Add new flags to complete the session
    const selectedNewFlagCodes = newFlagCodes.slice(0, newFlagsToInclude);

    selectedNewFlagCodes.forEach((code: string) => {
      session.push({
        flagCode: code,
        isNew: true,
      });
    });

    // Shuffle the session flags for variety
    const shuffledSession = [...session].sort(() => Math.random() - 0.5);

    setSessionFlags(shuffledSession);
    setCurrentIndex(0);
    setSessionCompleted(false);
    setResults({ correct: [], incorrect: [] });
  }, [flagCount, includeNewFlags, newFlagRatio]);

  // Answer the current flag
  const answerFlag = useCallback(
    (isCorrect: boolean) => {
      if (!currentFlag || sessionCompleted) return;

      // Update the flag's progress in localStorage
      updateFlagProgress(currentFlag.flagCode, isCorrect);

      // Track results for this session
      setResults((prev) => {
        const list = isCorrect ? [...prev.correct] : [...prev.incorrect];
        list.push(currentFlag.flagCode);

        return {
          ...prev,
          correct: isCorrect ? list : prev.correct,
          incorrect: !isCorrect ? list : prev.incorrect,
        };
      });

      // Move to the next flag or complete the session
      if (currentIndex < sessionFlags.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setSessionCompleted(true);
      }
    },
    [currentFlag, currentIndex, sessionCompleted, sessionFlags.length],
  );

  // Get session progress
  const sessionProgress = useMemo(
    () => ({
      total: sessionFlags.length,
      completed: currentIndex,
      correct: results.correct.length,
      incorrect: results.incorrect.length,
      percentage:
        sessionFlags.length > 0
          ? Math.round((currentIndex / sessionFlags.length) * 100)
          : 0,
    }),
    [sessionFlags.length, currentIndex, results],
  );

  // Restart session
  const restartSession = useCallback(() => {
    initializeSession();
  }, [initializeSession]);

  // Initialize the session when the component mounts
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    currentFlag,
    sessionFlags,
    currentIndex,
    sessionCompleted,
    results,
    sessionProgress,
    answerFlag,
    restartSession,
  };
}

/**
 * Hook to get progress statistics for spaced repetition learning
 */
export function useProgressStats(): SpacedLearningStats {
  const [stats, setStats] = useState<SpacedLearningStats>({
    totalFlags: 0,
    learnedFlags: 0,
    masteredFlags: 0,
    dueFlags: 0,
    accuracy: 0,
  });

  useEffect(() => {
    // Make sure storage is initialized
    initializeStorage();

    // Get stats from localStorage
    const progressStats = getProgressStats();

    setStats({
      totalFlags: 0, // We'd get this from the database in a real implementation
      learnedFlags: progressStats.flagCount,
      masteredFlags: progressStats.masteredCount,
      dueFlags: progressStats.dueCount,
      accuracy: progressStats.accuracy,
    });

    // In a real implementation, we would fetch the total flags count from an API
    fetch("/api/flags/count")
      .then((res) => res.json())
      .then((data) => {
        setStats((s) => ({
          ...s,
          totalFlags: data.count,
        }));
      })
      .catch(() => {
        // Fallback for demo/development
        setStats((s) => ({
          ...s,
          totalFlags: 196, // Approximate number of countries
        }));
      });
  }, []);

  return stats;
}

/**
 * Hook to get the next review date for a specific flag
 * @param flagCode The country code to get the next review date for
 */
export function useNextReviewDate(flagCode: string): string | null {
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);

  useEffect(() => {
    // Make sure storage is initialized
    initializeStorage();

    // Get the flag's progress
    const progress = getAllProgressData()[flagCode];

    if (progress) {
      setNextReviewDate(progress.nextReviewDate);
    }
  }, [flagCode]);

  return nextReviewDate;
}
