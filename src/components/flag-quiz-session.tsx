"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import Image from "next/image";
import { getFlagUrl } from "@/lib/utils";
import {
  trackSessionStart,
  trackSessionComplete,
  trackAnswer,
} from "@/lib/analytics";
import { startMeasure, endMeasure, measureImageLoad } from "@/lib/performance";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

// Type for flag data
interface Flag {
  id: string;
  code: string;
  name: string;
  // Optional fields for spaced repetition
  isNew?: boolean;
  progress?: Record<string, unknown>; // Replace any with a more specific type
}

// Props for the component
interface FlagQuizSessionProps {
  flags: Flag[] | Record<string, unknown>[]; // Use Record instead of any
  sessionTitle?: string;
  exitPath?: string;
  showHints?: boolean;
  onAnswer?: (code: string, isCorrect: boolean) => void; // Callback for external answer handling
}

// Helper function to get country name from code
function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    // North America
    us: "United States",
    ca: "Canada",
    mx: "Mexico",
    cu: "Cuba",
    jm: "Jamaica",
    ht: "Haiti",
    do: "Dominican Republic",
    pr: "Puerto Rico",
    pa: "Panama",
    cr: "Costa Rica",
    ni: "Nicaragua",
    hn: "Honduras",
    sv: "El Salvador",
    gt: "Guatemala",
    bz: "Belize",
    bs: "Bahamas",

    // South America
    br: "Brazil",
    ar: "Argentina",
    cl: "Chile",
    co: "Colombia",
    pe: "Peru",
    ve: "Venezuela",
    ec: "Ecuador",
    bo: "Bolivia",
    py: "Paraguay",
    uy: "Uruguay",

    // Europe
    gb: "United Kingdom",
    fr: "France",
    de: "Germany",
    it: "Italy",
    es: "Spain",
    pt: "Portugal",
    nl: "Netherlands",
    be: "Belgium",
    ch: "Switzerland",
    at: "Austria",
    se: "Sweden",
    dk: "Denmark",
    no: "Norway",
    fi: "Finland",
    ie: "Ireland",
    pl: "Poland",
    gr: "Greece",
    ru: "Russia",
    ua: "Ukraine",
    cz: "Czech Republic",
    hu: "Hungary",
    ro: "Romania",
    bg: "Bulgaria",

    // Asia
    cn: "China",
    jp: "Japan",
    in: "India",
    kr: "South Korea",
    kp: "North Korea",
    vn: "Vietnam",
    th: "Thailand",
    id: "Indonesia",
    my: "Malaysia",
    sg: "Singapore",
    ph: "Philippines",

    // Middle East
    tr: "Turkey",
    il: "Israel",
    sa: "Saudi Arabia",
    ae: "United Arab Emirates",
    ir: "Iran",
    iq: "Iraq",
    sy: "Syria",

    // Africa
    za: "South Africa",
    eg: "Egypt",
    ng: "Nigeria",
    ke: "Kenya",
    dz: "Algeria",
    ma: "Morocco",
    tn: "Tunisia",
    gh: "Ghana",

    // Oceania
    au: "Australia",
    nz: "New Zealand",
    fj: "Fiji",
    pg: "Papua New Guinea",
  };

  return countryMap[countryCode.toLowerCase()] || `Unknown (${countryCode})`;
}

// Helper function to format a flag to our internal format
function adaptFlag(flag: Record<string, unknown>): Flag {
  // If the flag already has id, code, and name, use it
  if (
    typeof flag.id === "string" &&
    typeof flag.code === "string" &&
    typeof flag.name === "string"
  ) {
    return {
      id: flag.id,
      code: flag.code,
      name: flag.name,
      isNew: typeof flag.isNew === "boolean" ? flag.isNew : undefined,
      progress:
        typeof flag.progress === "object" && flag.progress
          ? (flag.progress as Record<string, unknown>)
          : undefined,
    };
  }

  // For spaced repetition format
  if (typeof flag.flagCode === "string") {
    return {
      id: typeof flag.id === "string" ? flag.id : (flag.flagCode as string),
      code: flag.flagCode as string,
      name:
        typeof flag.countryName === "string"
          ? flag.countryName
          : getCountryName(flag.flagCode as string),
      isNew: typeof flag.isNew === "boolean" ? flag.isNew : undefined,
      progress:
        typeof flag.progress === "object" && flag.progress
          ? (flag.progress as Record<string, unknown>)
          : undefined,
    };
  }

  // For database flag format (older format)
  return {
    id: typeof flag.id === "string" ? flag.id : String(Math.random()),
    code: typeof flag.code === "string" ? flag.code : "",
    name:
      typeof flag.name === "string"
        ? flag.name
        : typeof flag.code === "string"
          ? getCountryName(flag.code)
          : "Unknown",
  };
}

// Helper function to get a country's continent
function getCountryContinent(countryCode: string): string {
  const continentMap: Record<string, string> = {
    // North America
    us: "North America",
    ca: "North America",
    mx: "North America",
    // South America
    br: "South America",
    ar: "South America",
    cl: "South America",
    co: "South America",
    pe: "South America",
    // Europe
    gb: "Europe",
    fr: "Europe",
    de: "Europe",
    it: "Europe",
    es: "Europe",
    pt: "Europe",
    nl: "Europe",
    be: "Europe",
    ch: "Europe",
    at: "Europe",
    se: "Europe",
    no: "Europe",
    dk: "Europe",
    fi: "Europe",
    gr: "Europe",
    pl: "Europe",
    ru: "Europe",
    cz: "Europe",
    hu: "Europe",
    // Asia
    cn: "Asia",
    jp: "Asia",
    in: "Asia",
    kr: "Asia",
    id: "Asia",
    th: "Asia",
    vn: "Asia",
    my: "Asia",
    sg: "Asia",
    ph: "Asia",
    sa: "Asia",
    ae: "Asia",
    il: "Asia",
    tr: "Asia",
    // Oceania
    au: "Oceania",
    nz: "Oceania",
    // Africa
    za: "Africa",
    eg: "Africa",
    ng: "Africa",
    ke: "Africa",
  };

  return continentMap[countryCode.toLowerCase()] || "Unknown Region";
}

// Helper function to get an additional hint about the country
function getCountryHint(countryCode: string): string {
  const hintMap: Record<string, string> = {
    us: "This country is known for its 50 stars representing states and 13 stripes for the original colonies.",
    ca: "This country has a red and white flag with a maple leaf in the center.",
    mx: "This country's flag has green, white, and red vertical stripes with a coat of arms in the center.",
    br: "This country's flag features a yellow diamond on a green background with a blue circle and stars.",
    ar: "This country's flag has light blue and white horizontal stripes with a sun in the center.",
    gb: "This country's flag is also known as the Union Jack.",
    fr: "This country's flag has vertical stripes of blue, white, and red.",
    de: "This country's flag has horizontal stripes of black, red, and gold.",
    it: "This country's flag has vertical stripes of green, white, and red.",
    es: "This country's flag has horizontal stripes of red and yellow, with a coat of arms.",
    jp: "This country's flag features a red circle on a white background.",
    cn: "This country's flag is red with five yellow stars in the upper left corner.",
    in: "This country's flag has orange, white, and green horizontal stripes with a blue wheel in the center.",
    au: "This country's flag features the Union Jack in the upper left and the Southern Cross constellation.",
    za: "This country's flag has a Y-shaped design with six colors.",
    ru: "This country's flag has white, blue, and red horizontal stripes.",
    kr: "This country's flag features a red and blue symbol (taeguk) on a white background.",
  };

  return (
    hintMap[countryCode.toLowerCase()] ||
    "Look carefully at the colors and symbols on the flag."
  );
}

// Helper to get a stable set of options for a flag
function getOptionsForFlag(currentFlag: Flag, allFlags: Flag[], count = 4) {
  console.log("Current flag:", currentFlag);
  console.log("All flags sample:", allFlags.slice(0, 2));

  // Always include the correct answer
  const options = [currentFlag];

  // Create a pool of flags excluding the current one
  const pool = allFlags.filter((f) => f.code !== currentFlag.code);

  // Shuffle the pool
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  // Add unique options up to the count
  while (options.length < count && shuffledPool.length > 0) {
    const option = shuffledPool.pop();
    if (option) {
      options.push(option);
    }
  }

  // Ensure all options have proper names (additional safety check)
  const processedOptions = options.map((option) => {
    // If the name is just a country code, try to get the proper name
    if (option.name === option.code || option.name.length <= 3) {
      return {
        ...option,
        name: getCountryName(option.code) || option.name,
      };
    }
    return option;
  });

  console.log("Options after processing:", processedOptions);

  // Shuffle the options
  return processedOptions.sort(() => Math.random() - 0.5);
}

export function FlagQuizSession({
  flags,
  sessionTitle = "Learning Session",
  exitPath = "/learn",
  showHints = true,
  onAnswer,
}: FlagQuizSessionProps) {
  // Format flags to our internal format - Use useMemo to prevent recreation on every render
  // Use type assertion since we're handling the conversion safely in adaptFlag
  const formattedFlags = useMemo(() => {
    return flags.map((item) => adaptFlag(item as Record<string, unknown>));
  }, [flags]);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [answerStartTime, setAnswerStartTime] = useState(() => Date.now());
  const [options, setOptions] = useState<Array<{ code: string; name: string }>>(
    [],
  );
  const sessionLoadTimeRef = useRef<number | null>(null);
  const [currentFlag, setCurrentFlag] = useState<Flag | null>(null);

  // These state variables are set but not directly used in render
  // They're tracked for analytics or callback purposes
  const [, setIsCorrect] = useState<boolean | null>(null);
  const [, setResults] = useState<{ correct: string[]; incorrect: string[] }>({
    correct: [],
    incorrect: [],
  });

  // Get current flag
  useEffect(() => {
    if (formattedFlags.length > 0 && currentIndex < formattedFlags.length) {
      setCurrentFlag(formattedFlags[currentIndex]);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
    } else if (
      formattedFlags.length > 0 &&
      currentIndex >= formattedFlags.length
    ) {
      setIsSessionComplete(true);
    }
  }, [currentIndex, formattedFlags]);

  // Generate options for the current flag
  useEffect(() => {
    if (currentFlag && formattedFlags.length > 0) {
      // Create a stable set of options
      const newOptions = getOptionsForFlag(currentFlag, formattedFlags);

      // Ensure options don't cause re-renders by doing a single state update
      setOptions(newOptions);
    }
  }, [currentFlag, formattedFlags]);

  // Track session start and measure session load time
  useEffect(() => {
    if (formattedFlags && formattedFlags.length > 0) {
      startMeasure("session-load-time");
      trackSessionStart(sessionTitle, formattedFlags.length);
    }

    return () => {
      if (formattedFlags && formattedFlags.length > 0) {
        endMeasure("session-load-time");
      }
    };
  }, [formattedFlags, sessionTitle]);

  // Measure image load time when currentFlag changes
  useEffect(() => {
    if (currentFlag) {
      measureImageLoad(getFlagUrl(currentFlag.code, 640), currentFlag.code);
    }
  }, [currentIndex, currentFlag]);

  // Handler for selecting an answer
  const handleAnswerSelect = (code: string) => {
    if (selectedAnswer) return; // Prevent multiple selections

    setSelectedAnswer(code);
    const correct = code === currentFlag?.code;
    setIsCorrect(correct);

    // Track the answer with analytics
    const responseTimeMs = Date.now() - answerStartTime;
    trackAnswer(currentFlag?.code || "", correct, responseTimeMs);

    if (correct) {
      setScore(score + 1);
    }

    // Call external onAnswer callback if provided (for spaced repetition)
    if (onAnswer) {
      onAnswer(code, correct);
    }

    // Update results
    setResults((prev) => {
      if (correct) {
        return {
          ...prev,
          correct: [...prev.correct, currentFlag?.code || ""],
        };
      } else {
        return {
          ...prev,
          incorrect: [...prev.incorrect, currentFlag?.code || ""],
        };
      }
    });

    // After a delay, move to the next flag
    setTimeout(() => {
      if (currentIndex < formattedFlags.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowHint(false);
        setAnswerStartTime(Date.now());
      } else {
        completeSession();
      }
    }, 1500);
  };

  // Complete the session
  const completeSession = () => {
    setIsSessionComplete(true);

    // End session load time measurement if not already ended
    if (!sessionLoadTimeRef.current) {
      sessionLoadTimeRef.current = endMeasure("session-load-time") || 0;
    }

    // Track session completion
    const sessionDurationSeconds = Math.floor((Date.now() - startTime) / 1000);
    trackSessionComplete(
      sessionTitle,
      score + (selectedAnswer === currentFlag?.code ? 1 : 0),
      formattedFlags.length,
      sessionDurationSeconds,
    );
  };

  // Reset the session
  const resetSession = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setIsSessionComplete(false);
    setStartTime(Date.now());
    setAnswerStartTime(Date.now());
    trackSessionStart(sessionTitle, formattedFlags.length);
  };

  // Guard clause for empty flags array
  if (!formattedFlags || formattedFlags.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Flags Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">
            There are no flags available for this session.
          </p>
          <p className="text-sm text-muted-foreground">
            Debug: Received {flags?.length || 0} flags input.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={exitPath}>Back to Learn</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Guard clause for current flag
  if (!currentFlag) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">
            There was an error loading the current flag.
          </p>
          <p className="text-sm text-muted-foreground">
            Debug: Current index {currentIndex}, total flags:{" "}
            {formattedFlags.length}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={exitPath}>Back to Learn</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Display session completed state
  if (isSessionComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{sessionTitle} Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-4xl font-bold text-green-600">{score}</p>
              <p className="text-green-600">Correct</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-4xl font-bold text-red-600">
                {formattedFlags.length - score}
              </p>
              <p className="text-red-600">Incorrect</p>
            </div>
          </div>

          <div>
            <p className="text-center mb-2">Accuracy</p>
            <Progress
              value={(score / formattedFlags.length) * 100}
              className="h-2"
            />
            <p className="text-center mt-2 text-sm text-muted-foreground">
              {score} out of {formattedFlags.length} flags
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetSession}>
            Try Again
          </Button>
          <Button asChild>
            <Link href={exitPath}>Return to Learn</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show additional information for spaced repetition
  const showSpacedInfo =
    currentFlag.isNew !== undefined || currentFlag.progress !== undefined;

  // Regular session display
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{sessionTitle}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Flag {currentIndex + 1} of {formattedFlags.length}
          </span>
          <Progress
            value={(currentIndex / formattedFlags.length) * 100}
            className="w-32 h-2"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            {/* Flag Display */}
            <div className="relative w-72 h-48 mb-6 overflow-hidden rounded-lg border shadow-sm">
              <Image
                src={getFlagUrl(currentFlag.code)}
                alt={`Flag of ${currentFlag.name}`}
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  // If the flag image fails to load, use the placeholder
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-flag.svg";
                }}
              />
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
                      : selectedAnswer === option.code &&
                          option.code !== currentFlag.code
                        ? "destructive"
                        : "outline"
                  }
                  className={`h-16 text-lg justify-start px-4 ${
                    selectedAnswer !== null && option.code === currentFlag.code
                      ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-500"
                      : ""
                  }`}
                >
                  {option.name}
                </Button>
              ))}
            </div>

            {/* Hint Button */}
            {showHints && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  disabled={!!selectedAnswer}
                >
                  <Lightbulb className="mr-1 h-4 w-4" />
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Button>

                {/* Hint Content */}
                {showHint && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
                    <p>
                      This flag belongs to a country in{" "}
                      {getCountryContinent(currentFlag.code) ||
                        "Unknown Region"}
                      .
                    </p>
                    <p className="mt-1">
                      {getCountryHint(currentFlag.code) ||
                        "No additional hints available."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="ghost" asChild>
            <Link href={exitPath}>Exit Session</Link>
          </Button>

          {/* Score Display (Middle) */}
          <div className="flex items-center text-sm">
            <span className="font-medium">
              Score: {score}/{currentIndex}
            </span>
          </div>

          {/* Flag Status (Right) */}
          {showSpacedInfo && (
            <div className="flex items-center text-sm text-right">
              <span>
                {currentFlag.isNew ? (
                  <Badge variant="outline" className="bg-yellow-50">
                    New Flag
                  </Badge>
                ) : !currentFlag.isNew && currentFlag.progress ? (
                  <span className="text-muted-foreground">
                    {currentFlag.progress.lastReviewedAt &&
                    typeof currentFlag.progress.lastReviewedAt === "number"
                      ? `Last seen: ${new Date(currentFlag.progress.lastReviewedAt as number).toLocaleDateString()}`
                      : "Previously viewed"}
                  </span>
                ) : null}
              </span>
            </div>
          )}

          {/* Empty div to maintain layout when no spaced info */}
          {!showSpacedInfo && <div></div>}
        </CardFooter>
      </Card>
    </div>
  );
}
