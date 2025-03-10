/**
 * React Hooks for Spaced Repetition Learning
 * Provides custom hooks for managing spaced repetition learning sessions
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAllProgressData,
  updateFlagProgress,
  getDueFlags,
  getProgressStats,
  FlagProgress,
  getFlagProgress,
} from "./storage";
import { getSyncState, forceSynchronization, SyncState } from "./sync";
import {
  getOfflineStatus,
  shouldSkipNetworkRequests,
  OfflineStatus,
} from "./offline";
import {
  initializeSpacedRepetitionSystem,
  getSystemStatus,
  SpacedRepetitionStatus,
} from "./initialize";

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
  const {
    flagCount = 10,
    includeNewFlags = true,
    newFlagRatio = 0.3,
    continentFilter,
  } = config;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      setIsLoading(true);
      setError(null);

      // Make sure storage is initialized
      initializeSpacedRepetitionSystem();

      // Check offline status
      const skipNetworkRequests = shouldSkipNetworkRequests();

      // Get all available flags (would come from the database)
      let availableFlagCodes: string[] = [];

      try {
        if (!skipNetworkRequests) {
          // Try to fetch from API if online
          const fetchUrl = continentFilter
            ? `/api/flags?continent=${encodeURIComponent(continentFilter)}`
            : "/api/flags";

          availableFlagCodes = await fetch(fetchUrl)
            .then((res) => res.json())
            .then((data: Flag[]) => data.map((flag) => flag.code));
        }
      } catch (fetchError) {
        console.warn(
          "Failed to fetch flags from API, using fallback data:",
          fetchError,
        );
      }

      // Fallback if API fetch failed or we're offline
      if (availableFlagCodes.length === 0) {
        // Simple fallback with common flag codes for development/offline use
        availableFlagCodes = [
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

        // Apply continent filter to fallback data if needed
        if (continentFilter) {
          // This is a simplistic filter just for fallback - in reality we'd have proper mapping
          const continentMap: Record<string, string[]> = {
            "North America": ["us", "ca", "mx"],
            Europe: ["gb", "fr", "de", "es", "it"],
            Asia: ["jp", "cn"],
            "South America": ["br"],
            Oceania: ["au"],
            Africa: [],
          };

          availableFlagCodes =
            continentMap[continentFilter] || availableFlagCodes;
        }
      }

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
      const filteredDueFlags = continentFilter
        ? dueFlagCodes.filter((code) => availableFlagCodes.includes(code))
        : dueFlagCodes;

      const reviewFlags = filteredDueFlags.slice(
        0,
        flagCount - newFlagsToInclude,
      );
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
      const filteredNonDueFlags = continentFilter
        ? nonDueFlagCodes.filter((code) => availableFlagCodes.includes(code))
        : nonDueFlagCodes;

      const additionalReviewFlags = Math.max(
        0,
        flagCount - newFlagsToInclude - reviewFlags.length,
      );

      if (additionalReviewFlags > 0 && filteredNonDueFlags.length > 0) {
        const selectedNonDueFlagCodes = filteredNonDueFlags.slice(
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
      const filteredNewFlags = continentFilter
        ? newFlagCodes.filter((code) => availableFlagCodes.includes(code))
        : newFlagCodes;

      const remainingFlags = flagCount - session.length;
      const selectedNewFlagCodes = filteredNewFlags.slice(0, remainingFlags);

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
      setIsLoading(false);
    } catch (initError) {
      console.error("Error initializing learning session:", initError);
      setError("Failed to initialize learning session. Please try again.");
      setIsLoading(false);
    }
  }, [flagCount, includeNewFlags, newFlagRatio, continentFilter]);

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

    // Clean up when component unmounts
    return () => {
      // We don't want to clean up the entire system here as other components may be using it
      // That should happen at the app level
    };
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
    isLoading,
    error,
  };
}

/**
 * Hook to get progress statistics for spaced repetition learning
 */
export function useProgressStats(): SpacedLearningStats & {
  isLoading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState<SpacedLearningStats>({
    totalFlags: 0,
    learnedFlags: 0,
    masteredFlags: 0,
    dueFlags: 0,
    accuracy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Make sure storage is initialized
        initializeSpacedRepetitionSystem();

        // Get stats from localStorage
        const progressStats = getProgressStats();

        // Initial stats update without total flags
        if (isMounted) {
          setStats({
            totalFlags: 0,
            learnedFlags: progressStats.flagCount,
            masteredFlags: progressStats.masteredCount,
            dueFlags: progressStats.dueCount,
            accuracy: progressStats.accuracy,
          });
        }

        // Check if we should skip network requests
        if (!shouldSkipNetworkRequests()) {
          try {
            // Fetch total flags count from API if online
            const totalData = await fetch("/api/flags/count").then((res) =>
              res.json(),
            );

            if (isMounted) {
              setStats((s) => ({
                ...s,
                totalFlags: totalData.count,
              }));
            }
          } catch (fetchError) {
            console.warn(
              "Failed to fetch total flags count, using fallback:",
              fetchError,
            );
            // Use a fallback value for offline or API failure
            if (isMounted) {
              setStats((s) => ({
                ...s,
                totalFlags: 195, // Approximate number of countries in the world
              }));
            }
          }
        } else {
          // Use fallback for offline mode
          if (isMounted) {
            setStats((s) => ({
              ...s,
              totalFlags: 195, // Approximate number of countries in the world
            }));
          }
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (statsError) {
        console.error("Error fetching progress stats:", statsError);
        if (isMounted) {
          setError("Failed to load learning statistics");
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...stats,
    isLoading,
    error,
  };
}

/**
 * Hook to get the next review date for a specific flag
 * @param flagCode The country code to get the next review date for
 */
export function useNextReviewDate(flagCode: string): {
  nextReviewDate: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNextReviewDate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize if needed
        initializeSpacedRepetitionSystem();

        const progress = getFlagProgress(flagCode);

        if (isMounted) {
          setNextReviewDate(progress?.nextReviewDate || null);
          setIsLoading(false);
        }
      } catch (dateError) {
        console.error(
          `Error fetching next review date for ${flagCode}:`,
          dateError,
        );
        if (isMounted) {
          setError("Failed to load review date");
          setIsLoading(false);
        }
      }
    };

    fetchNextReviewDate();

    return () => {
      isMounted = false;
    };
  }, [flagCode]);

  return { nextReviewDate, isLoading, error };
}

/**
 * Hook to monitor sync status and manage sync operations
 * @param autoInitialize Whether to automatically initialize the sync system
 */
export function useSyncStatus(autoInitialize = true): {
  syncState: SyncState;
  offlineStatus: OfflineStatus;
  systemStatus: SpacedRepetitionStatus;
  forceSynchronization: () => Promise<void>;
  isInitialized: boolean;
} {
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [offlineStatus, setOfflineStatus] =
    useState<OfflineStatus>(getOfflineStatus());
  const [systemStatus, setSystemStatus] =
    useState<SpacedRepetitionStatus>(getSystemStatus());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      // Initialize the system
      initializeSpacedRepetitionSystem();
      setIsInitialized(true);

      // Update state immediately after initialization
      setSyncState(getSyncState());
      setOfflineStatus(getOfflineStatus());
      setSystemStatus(getSystemStatus());
    }

    // Set up polling to regularly update the status
    const intervalId = setInterval(() => {
      setSyncState(getSyncState());
      setOfflineStatus(getOfflineStatus());
      setSystemStatus(getSystemStatus());
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(intervalId);

      // Don't clean up the system here, as other components might be using it
      // That should happen at the app level
    };
  }, [autoInitialize, isInitialized]);

  return {
    syncState,
    offlineStatus,
    systemStatus,
    forceSynchronization,
    isInitialized,
  };
}
