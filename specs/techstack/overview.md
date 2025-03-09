# Technology Stack Overview

## Core Technologies

Flag Trainer is built using a modern, TypeScript-based web stack focusing on performance, developer experience, and maintainability.

### Frontend

- **Next.js**: React framework with server-side rendering and static site generation capabilities
- **React**: Component-based UI library
- **TypeScript**: Typed JavaScript for improved developer experience and code quality
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn UI**: Component library built on Radix UI primitives and styled with Tailwind

### Backend

- **Next.js API Routes**: Serverless functions for backend API endpoints
- **TypeScript**: Shared types between frontend and backend

### Database

- **Turso**: Edge database built on libSQL (SQLite fork) designed for global distribution
- **SQLite**: Lightweight, file-based relational database with SQL support
- **Drizzle ORM**: Type-safe SQL query builder with schema migrations

### Authentication

- **NextAuth.js**: Authentication solution for Next.js applications
- **Email Authentication**: Email/password sign-up and sign-in flow

## Development Tools

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Storybook**: UI component development and documentation
- **Playwright**: End-to-end testing
- **Vitest**: Unit and integration testing
- **GitHub Actions**: CI/CD pipeline

## Infrastructure

- **Vercel**: Platform for frontend and serverless backend hosting
- **Turso Cloud**: Edge database hosting with global replication
- **Vercel Analytics**: Performance and usage analytics

## State Management

- **Zustand**: Lightweight state management library
- **React Query**: Data fetching and cache management

## Performance Optimization

- **Next.js Image Component**: Image optimization
- **Code Splitting**: Automatic code splitting by route
- **Edge Caching**: CDN caching for static assets and pages
- **Incremental Static Regeneration**: Updating static content without full rebuilds

## Tooling Justification

### Why Next.js?

- Built-in API routes eliminates need for separate backend
- Server-side rendering improves SEO and initial load performance
- File-based routing simplifies route management
- Built-in optimization features
- Strong TypeScript support

### Why Tailwind CSS with Shadcn UI?

- Utility-first approach speeds up development
- Consistent design system without writing custom CSS
- Highly customizable components
- Excellent responsive design support
- Small bundle size with purging of unused styles

### Why Turso and SQLite?

- Edge-optimized database with low latency for global users
- No complex database server setup required
- Strong SQLite compatibility with performance enhancements
- Generous free tier with 1 billion row reads per month
- Simple developer experience with CLI tools
- Seamless replication across multiple global locations
- Ideal for read-heavy applications like Flag Trainer

### Why Drizzle ORM?

- Type-safe SQL queries with TypeScript integration
- Better performance than traditional ORMs
- Schema migrations and validation
- Works well with both SQLite and other databases
- Simpler API compared to alternatives like Prisma

### Why Vercel?

- Native Next.js support with zero configuration
- Automatic deployments from Git
- Preview deployments for pull requests
- Edge functions for global low-latency APIs
- Easy integration with Turso databases

## Development Prerequisites

- Node.js 18+
- Turso CLI (for local development)
- Git
- npm or yarn
