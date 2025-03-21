import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { FlagQuizSession } from "@/components/flag-quiz-session";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function QuickSessionPage() {
  try {
    // Get 10 random flags for the quick session
    const randomFlags = await db.query.flags.findMany({
      orderBy: sql`RANDOM()`,
      limit: 10,
    });

    // If we have no flags, show a message to the user
    if (!randomFlags || randomFlags.length === 0) {
      return (
        <PageContainer>
          <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <h1 className="text-3xl font-bold">No Flags Available</h1>
            <p className="text-muted-foreground">
              There are no flags in the database. Please make sure the database
              is set up correctly.
            </p>
            <Button asChild>
              <Link href="/learn">Back to Learn</Link>
            </Button>
          </div>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <div className="flex flex-col items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Quick Learning Session</h1>
          <p className="text-muted-foreground">
            Test your knowledge with 10 random flags from around the world.
          </p>
        </div>

        <FlagQuizSession
          flags={randomFlags}
          sessionTitle="Quick Learning Session"
          exitPath="/learn"
          showHints={true}
        />
      </PageContainer>
    );
  } catch (error) {
    console.error("Error loading quick session:", error);

    return (
      <PageContainer>
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <h1 className="text-3xl font-bold">Error Loading Flags</h1>
          <p className="text-muted-foreground">
            There was an error loading the flags for your quick session. This
            could be due to a database connection issue.
          </p>
          <Button asChild>
            <Link href="/learn">Back to Learn</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }
}
