# Backend Architecture

## Technology Stack

### Core Technologies

- **Next.js API Routes**: Serverless backend functions
- **TypeScript**: Type-safe code
- **Drizzle ORM**: SQL query builder and schema management
- **Turso**: Edge database built on libSQL (SQLite fork)
- **NextAuth.js**: Authentication framework

## API Structure

The backend is built using Next.js API Routes, which provide a serverless architecture. Each route is a separate function deployed to the Vercel edge network.

```
app/
├── api/
│   ├── auth/          # Authentication endpoints (managed by NextAuth.js)
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── flags/         # Flag-related endpoints
│   │   ├── route.ts   # GET: List all flags with filtering
│   │   ├── [id]/
│   │   │   └── route.ts  # GET: Get flag by ID
│   │   ├── random/
│   │   │   └── route.ts  # GET: Get random flag
│   │   └── quiz/
│   │       └── route.ts  # GET: Get flag with quiz options
│   ├── progress/      # Learning progress endpoints
│   │   ├── route.ts   # GET: Get user's progress
│   │   ├── [flagId]/
│   │   │   └── route.ts  # GET/POST: Get/update flag progress
│   │   └── next/
│   │       └── route.ts  # GET: Get next flag to review
│   ├── competition/   # Competition-related endpoints
│   │   └── scores/
│   │       ├── route.ts  # GET: Get leaderboard, POST: Submit score
│   │       └── [id]/
│   │           └── route.ts  # GET: Get score by ID
│   └── settings/      # User settings endpoint
│       └── route.ts   # GET/PUT: Get/update user settings
└── ...
```

## Authentication

Authentication is handled by NextAuth.js, which provides a secure and flexible authentication system.

```typescript
// app/api/auth/[...nextauth]/route.ts
import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import EmailProvider from 'next-auth/providers/email'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    error: '/auth-error',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

## Database Integration

Drizzle ORM is used to interact with the Turso database. It provides a type-safe way to define the schema and perform queries.

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

// Schema definitions (as detailed in data-models.md)
export const flags = sqliteTable(/* ... */)
export const users = sqliteTable(/* ... */)
export const userProgress = sqliteTable(/* ... */)
export const scores = sqliteTable(/* ... */)
export const userSettings = sqliteTable(/* ... */)

// Initialize client for Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
})

// Initialize drizzle with the Turso client
export const db = drizzle(client)
```

## Data Access Layer

To keep the API routes clean, data access is abstracted into service modules.

```typescript
// lib/services/flag-service.ts
import { db } from '@/lib/db'
import { flags } from '@/lib/db/schema'
import { eq, like, or, and, sql, asc, desc } from 'drizzle-orm'
import { FlagFilters } from '@/lib/types'

export async function getAllFlags(filters?: FlagFilters) {
  let query = db.select().from(flags)

  if (filters?.continent) {
    query = query.where(eq(flags.continent, filters.continent))
  }

  if (filters?.search) {
    query = query.where(
      or(like(flags.name, `%${filters.search}%`), like(flags.code, `%${filters.search}%`))
    )
  }

  // Sort handling for SQLite
  if (filters?.sort) {
    if (filters.sort === 'name') {
      query = query.orderBy(filters.order === 'desc' ? desc(flags.name) : asc(flags.name))
    } else if (filters.sort === 'difficulty') {
      query = query.orderBy(
        filters.order === 'desc' ? desc(flags.difficulty) : asc(flags.difficulty)
      )
    }
  } else {
    query = query.orderBy(asc(flags.name))
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.offset(filters.offset)
  }

  return query
}

export async function getFlagById(id: number) {
  return db.select().from(flags).where(eq(flags.id, id)).limit(1)
}

// More methods for fetching random flags, quiz options, etc.
```

## Spaced Repetition Algorithm

The application uses a spaced repetition algorithm based on the SuperMemo-2 algorithm to optimize learning efficiency.

```typescript
// lib/spaced-repetition.ts
export interface ReviewResult {
  easeFactor: number
  interval: number
  nextReviewDate: Date
}

/**
 * Calculate next review date based on SuperMemo-2 algorithm
 * @param performance Rating of how easy the recall was (0-5, where 0 is complete blackout)
 * @param previousEaseFactor Previous ease factor
 * @param previousInterval Previous interval in days
 * @returns New ease factor, interval, and next review date
 */
export function calculateNextReview(
  performance: number,
  previousEaseFactor: number,
  previousInterval: number
): ReviewResult {
  // Implementation of SuperMemo-2 algorithm
  // https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

  // Calculate new ease factor
  let easeFactor = previousEaseFactor
  if (performance >= 3) {
    easeFactor = previousEaseFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02))
  } else {
    easeFactor = Math.max(1.3, previousEaseFactor - 0.8)
  }

  // Calculate new interval
  let interval
  if (performance < 3) {
    interval = 1 // Reset to 1 day if response was difficult
  } else if (previousInterval === 0) {
    interval = 1
  } else if (previousInterval === 1) {
    interval = 6
  } else {
    interval = Math.round(previousInterval * easeFactor)
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    easeFactor,
    interval,
    nextReviewDate,
  }
}
```

## Error Handling

A standardized error handling approach is used across all API endpoints.

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  code: string
  statusCode: number
  details?: Record<string, any>

  constructor(message: string, code: string, statusCode: number, details?: Record<string, any>) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  static notFound(message = 'Resource not found', details?: Record<string, any>) {
    return new ApiError(message, 'NOT_FOUND', 404, details)
  }

  static badRequest(message = 'Bad request', details?: Record<string, any>) {
    return new ApiError(message, 'BAD_REQUEST', 400, details)
  }

  static unauthorized(message = 'Unauthorized', details?: Record<string, any>) {
    return new ApiError(message, 'UNAUTHORIZED', 401, details)
  }

  static forbidden(message = 'Forbidden', details?: Record<string, any>) {
    return new ApiError(message, 'FORBIDDEN', 403, details)
  }

  static internal(message = 'Internal server error', details?: Record<string, any>) {
    return new ApiError(message, 'INTERNAL_SERVER_ERROR', 500, details)
  }
}

// Example usage in an API route
export async function GET(request: Request) {
  try {
    // API logic here
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message, details: error.details } },
        { status: error.statusCode }
      )
    }

    // Log unexpected errors
    console.error(error)

    return Response.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
```

## Rate Limiting

Rate limiting is implemented using a simple in-memory approach for the Vercel edge environment.

```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function rateLimiter(
  req: NextRequest,
  config: RateLimitConfig = { limit: 100, windowMs: 60000 }
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  // Get current user's rate limit data
  const rateLimitData = rateLimit.get(ip)

  // If no data or window has expired, create new rate limit entry
  if (!rateLimitData || rateLimitData.resetTime < now) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return null
  }

  // Check if user has exceeded rate limit
  if (rateLimitData.count >= config.limit) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later.',
        },
      },
      { status: 429 }
    )
  }

  // Increment request count
  rateLimitData.count += 1
  rateLimit.set(ip, rateLimitData)

  return null
}
```

## SQLite/Turso Specific Considerations

### Database Initialization

When the application starts, we ensure the SQLite-specific features are enabled:

```typescript
// lib/db/init.ts
import { db } from './index'

export async function initDatabase() {
  // Enable foreign key constraints in SQLite
  await db.run(sql`PRAGMA foreign_keys = ON;`)

  // Set busy timeout to prevent "database is locked" errors
  await db.run(sql`PRAGMA busy_timeout = 5000;`)

  console.log('Database initialized with SQLite settings')
}
```

### Transaction Support

Turso supports transactions for atomic operations:

```typescript
// Example of using transactions
import { db } from '@/lib/db'

export async function createUserWithSettings(userData: NewUser, settingsData: NewUserSettings) {
  const result = await db.transaction(async (tx) => {
    // Insert user
    const user = await tx.insert(users).values(userData).returning()

    // Insert settings with the user id
    await tx.insert(userSettings).values({
      ...settingsData,
      userId: user[0].id,
    })

    return user[0]
  })

  return result
}
```

### Data Type Handling

SQLite has a more flexible but limited type system compared to PostgreSQL. We handle this in the service layer:

```typescript
// Handling array-like data (stored as JSON strings in SQLite)
export function getFlagDetails(id: number) {
  const flag = await db.select().from(flags).where(eq(flags.id, id)).limit(1)

  if (!flag.length) {
    throw ApiError.notFound('Flag not found')
  }

  // Parse JSON strings back to arrays
  return {
    ...flag[0],
    languages: flag[0].languages ? flag[0].languages.split(',') : [],
    funFacts: flag[0].funFacts ? JSON.parse(flag[0].funFacts) : [],
  }
}
```

## API Documentation

The API is documented using OpenAPI/Swagger, which is automatically generated from TypeScript types and API route implementations.
