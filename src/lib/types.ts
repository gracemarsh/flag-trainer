/**
 * Type definitions for Next.js 15 dynamic routes
 * These types help ensure compatibility with Next.js 15's stricter type system
 */

// Base type for dynamic route parameters
export type RouteParams = Record<string, string>

// Type for Next.js page props in dynamic routes
export interface NextPageProps<T extends RouteParams = RouteParams> {
  params: T
  searchParams?: Record<string, string | string[] | undefined>
}

// Specific type for dynamic flag route
export type FlagRouteParams = {
  code: string
}

// Export commonly used specialized types
export type FlagDetailPageProps = NextPageProps<FlagRouteParams>
