// Common types for Next.js App Router

export interface RouteParams {
  [key: string]: string;
}

export interface PageProps<T extends RouteParams = RouteParams> {
  params: T;
}
