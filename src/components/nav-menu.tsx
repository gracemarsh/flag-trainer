"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if the given path is the current path
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <span className="hidden sm:flex items-center">
          <span className="mr-1">🚩</span>
          <span className="text relative top-0.5">🏃‍♂️</span>
        </span>
        Flag Trainer
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <Link
          href="/learn"
          className={cn(
            "font-medium transition-colors hover:text-primary",
            isActive("/learn") && "text-primary",
          )}
        >
          Learn
        </Link>
        <Link
          href="/library"
          className={cn(
            "font-medium transition-colors hover:text-primary",
            isActive("/library") && "text-primary",
          )}
        >
          Library
        </Link>
        <Link
          href="/stats"
          className={cn(
            "font-medium transition-colors hover:text-primary",
            isActive("/stats") && "text-primary",
          )}
        >
          Stats
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button asChild variant="outline" size="sm" className="hidden md:flex">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="sm" className="hidden md:flex">
          <Link href="/signup">Sign Up</Link>
        </Button>

        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-16 left-0 right-0 z-50 bg-background border-b shadow-lg"
        >
          <nav className="flex flex-col p-4">
            <Link
              href="/learn"
              className={cn(
                "py-2 px-4 font-medium transition-colors hover:text-primary rounded-md hover:bg-muted",
                isActive("/learn") && "text-primary bg-muted",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>
            <Link
              href="/library"
              className={cn(
                "py-2 px-4 font-medium transition-colors hover:text-primary rounded-md hover:bg-muted",
                isActive("/library") && "text-primary bg-muted",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Library
            </Link>
            <Link
              href="/stats"
              className={cn(
                "py-2 px-4 font-medium transition-colors hover:text-primary rounded-md hover:bg-muted",
                isActive("/stats") && "text-primary bg-muted",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Stats
            </Link>
            <div className="h-px w-full bg-border my-2"></div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="justify-center"
              >
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="justify-center">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
