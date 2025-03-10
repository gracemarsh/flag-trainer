import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 sm:p-24">
      <div className="max-w-5xl w-full flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">Flag Trainer</h1>
        <p className="text-xl mb-8">
          Learn all the flags of the world with spaced repetition
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button asChild size="lg" className="text-lg">
            <Link href="/learn">Start Learning</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/library">Browse Flags</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            title="Learning Mode"
            description="Learn flags with flashcards and spaced repetition to efficiently memorize flags."
            link="/learn"
            linkText="Start Learning"
          />
          <FeatureCard
            title="Flag Library"
            description="Browse all flags of the world and learn about each country."
            link="/library"
            linkText="Browse Library"
          />
          <FeatureCard
            title="Progress Tracking"
            description="Track your progress and see how your knowledge improves over time."
            link="/stats"
            linkText="View Progress"
          />
        </div>
      </div>
    </main>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function FeatureCard({ title, description, link, linkText }: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full">
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
