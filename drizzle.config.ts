import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'libsql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config
