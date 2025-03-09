# Database Architecture

## Overview

Flag Trainer uses Turso, an edge database built on libSQL (a fork of SQLite), to provide a globally distributed, low-latency database solution. The database schema is designed to support the core learning features, user management, and competition functionality while leveraging Turso's edge capabilities.

## Database Technology

### Turso and SQLite

Turso was chosen for the following reasons:

- **Edge-first architecture**: Data is stored close to users for minimal latency
- **Global distribution**: Automatic replication across locations
- **SQLite compatibility**: Familiar SQL syntax and functionality
- **Serverless friendly**: Designed for edge computing environments
- **Developer experience**: Simple CLI tools and local development workflow
- **Generous free tier**: 1 billion row reads per month, adequate for initial launch
- **Low operational overhead**: No complex database infrastructure to manage

### Drizzle ORM

Drizzle was selected as the ORM solution for the following benefits:

- **Type-safe schema definition and query building**
- **Lightweight with minimal overhead compared to other ORMs**
- **Strong TypeScript integration**
- **Simple migration management**
- **SQLite support with type safety**
- **Integrated with libSQL/Turso**

## Schema Design

The database schema consists of several core tables as detailed in the data models documentation. Here's a visual representation of the relationships:

```
┌─────────┐       ┌───────────────┐       ┌─────────┐
│         │       │               │       │         │
│  users  │───────│ userProgress  │───────│  flags  │
│         │       │               │       │         │
└─────────┘       └───────────────┘       └─────────┘
     │                                          │
     │                                          │
     │                                          │
     │                  ┌─────────┐             │
     └──────────────────│ scores  │─────────────┘
                        └─────────┘
     │
     │
     │
     │                  ┌──────────────┐
     └──────────────────│ userSettings │
                        └──────────────┘
```

## Data Types and Constraints

### Primary and Foreign Keys

- All tables use a unique integer `id` as the primary key, except for `users` which uses a UUID string
- Foreign key constraints ensure referential integrity
- SQLite's ON DELETE CASCADE features are used where appropriate

### Data Validation

- NOT NULL constraints on required fields
- UNIQUE constraints on fields like email and country code
- DEFAULT values for optional fields
- CHECK constraints for specific values (e.g., difficulty levels)

## Indexing Strategy

Turso/SQLite supports various index types to optimize query performance. We use the following indexes:

1. **Lookup by Primary Key**: All tables have primary key indexes (automatically created by SQLite)

2. **User Progress Queries**:

   ```sql
   CREATE INDEX user_progress_user_id_idx ON user_progress(user_id);
   CREATE INDEX user_progress_next_review_date_idx ON user_progress(next_review_date);
   ```

   - For quickly finding all flags a user needs to review
   - For efficiently sorting by next review date

3. **Flag Lookups**:

   ```sql
   CREATE INDEX flags_continent_idx ON flags(continent);
   CREATE INDEX flags_difficulty_idx ON flags(difficulty);
   ```

   - For filtering flags by continent or difficulty level

4. **Leaderboard Queries**:
   ```sql
   CREATE INDEX scores_score_idx ON scores(score);
   CREATE INDEX scores_difficulty_idx ON scores(difficulty);
   ```
   - For sorting and filtering leaderboards

## Migration Strategy

Database migrations are managed using Drizzle's migration tool, adapted for SQLite/Turso:

1. Update schema definition in TypeScript
2. Generate migration SQL:
   ```bash
   npx drizzle-kit generate:sqlite
   ```
3. Review generated SQL
4. Apply migration:
   ```bash
   npx drizzle-kit push:sqlite
   ```

For production, migrations are applied using the Turso CLI or through the application at deploy time.

## Connection Management

### Local Development

For local development, we use a local SQLite database file:

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({
  // Use local file for development
  url:
    process.env.NODE_ENV === 'production'
      ? (process.env.TURSO_DATABASE_URL as string)
      : 'file:./local.db',
  authToken: process.env.NODE_ENV === 'production' ? process.env.TURSO_AUTH_TOKEN : undefined,
})

export const db = drizzle(client)
```

### Production

In production, we connect to Turso's cloud service:

```typescript
// lib/db/index.ts with connection pooling
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

// Create a connection to Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
})

// Initialize drizzle with the client
export const db = drizzle(client)
```

## Database Seeding

The application includes seed scripts to populate the database with initial data:

```typescript
// scripts/seed.ts
import { db } from '@/lib/db'
import { flags, users, userProgress } from '@/lib/db/schema'
import flagData from './flag-data.json'

async function main() {
  // Seed flags
  console.log('Seeding flags...')
  for (const flag of flagData) {
    await db.insert(flags).values(flag).onConflictDoNothing()
  }

  // Seed test users
  console.log('Seeding test users...')
  const testUsers = [
    /* ... */
  ]
  for (const user of testUsers) {
    await db.insert(users).values(user).onConflictDoNothing()
  }

  // Seed progress data
  // ...
}

main()
  .then(() => console.log('Database seeded successfully'))
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
```

## Backup and Disaster Recovery

Turso provides automatic backups and replication across multiple locations. The following backup strategy is implemented:

1. **Automatic backups**: Turso maintains backups of your database
2. **Database replication**: Data is automatically replicated across locations
3. **Regular exports**: Scheduled exports of data for additional backup
4. **Point-in-time recovery**: Available through Turso's management interface
5. **Local snapshots**: Periodic exports to local storage for worst-case scenarios

## Performance Considerations

### Read Performance Optimization

Turso is optimized for read-heavy workloads, making it ideal for our Flag Trainer application. To maximize performance:

1. **Strategic indexing**: Indexes on frequently queried columns
2. **Query optimization**: Well-structured queries that utilize indexes
3. **Pagination**: Limit result sets for large collections
4. **Caching**: Use client-side caching for frequently accessed data
5. **Edge location selection**: Configure deployment locations based on user distribution

### Write Performance Optimization

While Turso has limits on write operations, we optimize by:

1. **Batching writes**: Combine multiple writes where possible
2. **Reducing unnecessary updates**: Only update when data actually changes
3. **Background processing**: Defer non-critical writes to background processes
4. **Optimistic UI updates**: Update UI immediately before write confirmation

## Limitations and Considerations

1. **Database Size**: Free tier is limited to 256MB per database
2. **Write Operations**: Free tier allows 500,000 row writes per month
3. **Locations**: Free tier has limited locations compared to paid tiers
4. **Concurrent Connections**: Has limits on simultaneous connections

## Scaling Strategy

As the application grows, we'll implement the following scaling strategy:

1. **Multiple Databases**: Separate databases for different functional areas
2. **Upgrade to Paid Tier**: Move to paid tier when approaching free tier limits
3. **Read Replicas**: Add read replicas for read-heavy operations
4. **Data Archiving**: Archive historical data to maintain database size limits
