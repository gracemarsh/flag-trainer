import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sql } from "drizzle-orm";

export default async function LearnPage() {
  // Get total count of flags
  const flagCount = await db
    .select({
      count: sql`count(*)`,
    })
    .from(schema.flags);
  const totalFlags = flagCount[0].count;

  return (
    <div className="container py-8">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-3xl font-bold">Learn Flags</h1>
        <p className="text-muted-foreground">
          Learn all the flags of the world with spaced repetition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Session</CardTitle>
            <CardDescription>
              A quick 5-minute session with random flags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test your knowledge with a quick session of 10 random flags from
              around the world. Perfect for a short break or daily practice.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/learn/quick">Start Quick Session</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spaced Repetition</CardTitle>
            <CardDescription>
              Learn efficiently with personalized review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our spaced repetition system shows you flags at optimal intervals
              based on your performance. The most effective way to memorize all
              flags.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/learn/spaced">Start Spaced Learning</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Continent</CardTitle>
            <CardDescription>
              Focus on flags from a specific region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose a specific continent or region to focus your learning.
              Master one area at a time for more structured learning.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/learn/continent">Choose Continent</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg flex flex-col items-center">
                  <div className="text-muted-foreground mb-2">Total Flags</div>
                  <span className="font-medium">
                    {totalFlags as React.ReactNode}
                  </span>
                </div>
                <div className="bg-muted p-4 rounded-lg flex flex-col items-center">
                  <div className="text-muted-foreground mb-2">
                    Your Progress
                  </div>
                  <span className="font-medium">
                    0/{totalFlags as React.ReactNode}
                  </span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: "0%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to track your progress and unlock personalized learning
                features.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
