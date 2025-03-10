"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Continent information with representative flags and descriptions
const continents = [
  {
    name: "Africa",
    code: "africa",
    description: "Explore flags from the African continent",
    flagCodes: ["za", "eg", "ng", "ke"], // South Africa, Egypt, Nigeria, Kenya
    color: "from-yellow-500 to-red-500",
  },
  {
    name: "Asia",
    code: "asia",
    description: "Learn flags from the Asian continent",
    flagCodes: ["jp", "cn", "in", "kr"], // Japan, China, India, South Korea
    color: "from-red-500 to-yellow-400",
  },
  {
    name: "Europe",
    code: "europe",
    description: "Study flags from European countries",
    flagCodes: ["fr", "de", "gb", "it"], // France, Germany, UK, Italy
    color: "from-blue-500 to-yellow-400",
  },
  {
    name: "North America",
    code: "north-america",
    description: "Discover flags from North America",
    flagCodes: ["us", "ca", "mx", "cu"], // USA, Canada, Mexico, Cuba
    color: "from-red-500 to-blue-500",
  },
  {
    name: "Oceania",
    code: "oceania",
    description: "Explore flags from Oceania",
    flagCodes: ["au", "nz", "fj", "pg"], // Australia, New Zealand, Fiji, Papua New Guinea
    color: "from-blue-500 to-green-400",
  },
  {
    name: "South America",
    code: "south-america",
    description: "Learn flags from South American countries",
    flagCodes: ["br", "ar", "cl", "co"], // Brazil, Argentina, Chile, Colombia
    color: "from-green-500 to-yellow-400",
  },
];

export default function ContinentSelectionPage() {
  const router = useRouter();

  return (
    <div className="container py-8">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-3xl font-bold">Learn Flags by Continent</h1>
        <p className="text-muted-foreground">
          Select a continent to focus your learning on a specific region.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {continents.map((continent) => (
          <Card
            key={continent.code}
            className="overflow-hidden h-full flex flex-col"
          >
            <div className={`h-16 bg-gradient-to-r ${continent.color}`} />
            <CardHeader>
              <CardTitle>{continent.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                {continent.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {continent.flagCodes.map((code) => (
                  <div
                    key={code}
                    className="relative w-12 h-8 overflow-hidden rounded-sm border"
                  >
                    <Image
                      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
                      alt={`Flag example`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/learn/continent/${continent.code}`)
                }
              >
                Start Learning
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
