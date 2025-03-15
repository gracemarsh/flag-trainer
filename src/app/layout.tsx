import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/analytics";
import { SpeedInsights } from "@/components/speed-insights";
import { NavMenu } from "@/components/nav-menu";

// Import the reportWebVitals function
import { reportWebVitals } from "./reportWebVitals";

// Initialize web vitals reporting
if (typeof window !== "undefined") {
  reportWebVitals();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flag Trainer - Learn World Flags",
  description: "Learn all the flags of the world with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="border-b w-full">
              <div className="flex items-center justify-between h-16 px-4 md:px-6 w-full relative">
                <NavMenu />
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 md:py-8">
              <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 px-4 md:px-6">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} Flag Trainer. All rights
                  reserved.
                </p>
                <nav className="flex gap-4 sm:gap-6">
                  <Link
                    href="/about"
                    className="text-sm font-medium hover:underline underline-offset-4"
                  >
                    About
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm font-medium hover:underline underline-offset-4"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-sm font-medium hover:underline underline-offset-4"
                  >
                    Terms
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
