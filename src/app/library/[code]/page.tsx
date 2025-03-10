import type { Metadata } from "next";
import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { eq } from "drizzle-orm";
import { getFlagUrl } from "@/lib/utils";

// Define params type using Promise
type PageParams = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
//usevia.app/#/

// Metadata generator
https: export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const resolvedParams = await params;

  const flag = await db.query.flags.findFirst({
    where: eq(schema.flags.code, resolvedParams.code.toUpperCase()),
  });

  if (!flag) {
    return {
      title: "Flag Not Found",
    };
  }

  return {
    title: `${flag.name} Flag | Flag Trainer`,
    description: `Learn about the flag of ${flag.name} and its details.`,
  };
}

// Main page component
export default async function FlagDetailPage({ params }: PageParams) {
  const resolvedParams = await params;
  const { code } = resolvedParams;

  const flag = await db.query.flags.findFirst({
    where: eq(schema.flags.code, code.toUpperCase()),
  });

  if (!flag) {
    notFound();
  }

  // Parse fun facts from JSON string
  const funFacts = flag.funFacts ? JSON.parse(flag.funFacts as string) : [];

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <div className="aspect-video relative overflow-hidden rounded-lg border">
              <Image
                src={getFlagUrl(flag.code, 640)}
                alt={`Flag of ${flag.name}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{flag.name}</h1>
            <p className="text-muted-foreground mb-6">
              Country Code: {flag.code}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium mb-1">Continent</h3>
                <p>{flag.continent}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Population</h3>
                <p>{flag.population?.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Languages</h3>
                <p>{flag.languages}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Difficulty</h3>
                <p>{flag.difficulty}/5</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild>
                <Link href="/learn">Start Learning</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/library">Back to Library</Link>
              </Button>
            </div>
          </div>
        </div>

        {funFacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fun Facts</CardTitle>
              <CardDescription>
                Interesting facts about {flag.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {funFacts.map((fact: string, index: number) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
