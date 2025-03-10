import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { QuickLearningSession } from "@/components/quick-learning-session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Helper function to validate and format the continent name
function formatContinent(continentParam: string): string | null {
  const validContinents = [
    "africa",
    "asia",
    "europe",
    "north-america",
    "oceania",
    "south-america",
  ];

  if (!validContinents.includes(continentParam.toLowerCase())) {
    return null;
  }

  // Convert URL format to database format
  const formatMap: Record<string, string> = {
    africa: "Africa",
    asia: "Asia",
    europe: "Europe",
    "north-america": "North America",
    oceania: "Oceania",
    "south-america": "South America",
  };

  return formatMap[continentParam.toLowerCase()];
}

// Define the type for page props
type ContinentPageProps = {
  params: Promise<{ continent: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContinentLearningPage(props: ContinentPageProps) {
  // Always resolve params
  const resolvedParams = await props.params;
  const { continent: continentParam } = resolvedParams;

  const continentName = formatContinent(continentParam);

  // If continent is invalid, show 404
  if (!continentName) {
    notFound();
  }

  try {
    // Get flags from the selected continent
    const continentFlags = await db.query.flags.findMany({
      where: sql`continent = ${continentName}`,
      orderBy: sql`RANDOM()`,
      limit: 10, // Start with 10 flags for learning session
    });

    // If no flags found for this continent
    if (!continentFlags || continentFlags.length === 0) {
      return (
        <div className="container py-8">
          <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <h1 className="text-3xl font-bold">No Flags Available</h1>
            <p className="text-muted-foreground">
              There are no flags available for {continentName}. Please check the
              database.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/learn/continent">Back to Continents</Link>
              </Button>
              <Button asChild>
                <Link href="/learn">Back to Learn</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container py-8">
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">{continentName} Flags</h1>
          <p className="text-muted-foreground">
            Learn and test your knowledge of flags from {continentName}.
          </p>
        </div>

        <QuickLearningSession
          flags={continentFlags}
          sessionTitle={`${continentName} Learning Session`}
        />
      </div>
    );
  } catch (error) {
    console.error(`Error loading ${continentName} session:`, error);

    return (
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <h1 className="text-3xl font-bold">Error Loading Flags</h1>
          <p className="text-muted-foreground">
            There was an error loading flags from {continentName}. This could be
            due to a database connection issue.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/learn/continent">Back to Continents</Link>
            </Button>
            <Button asChild>
              <Link href="/learn">Back to Learn</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
