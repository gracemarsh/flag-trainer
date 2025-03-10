import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlagImage } from "@/components/ui/flag-image";

export default async function LibraryPage() {
  const flags = await db.query.flags.findMany({
    orderBy: (flags, { asc }) => [asc(flags.name)],
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-3xl font-bold">Flag Library</h1>
        <p className="text-muted-foreground">
          Browse all flags of the world and learn about each country.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flags.map((flag) => (
          <Card key={flag.id} className="overflow-hidden flex flex-col">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{flag.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 pb-2 flex-grow">
              <div className="aspect-video relative overflow-hidden rounded-md border mb-3 flex items-center justify-center bg-muted/20 p-2">
                <FlagImage
                  countryCode={flag.code}
                  altText={`Flag of ${flag.name}`}
                  size="md"
                  className="mx-auto"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Continent: {flag.continent}</p>
                <p>Difficulty: {flag.difficulty}/5</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/library/${flag.code}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
