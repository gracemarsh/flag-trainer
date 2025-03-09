import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Initialize database
export function initDatabase() {
  const dbUrl = process.env.DATABASE_URL || 'file:./local.db'
  const authToken = process.env.DATABASE_AUTH_TOKEN || ''

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  })

  return drizzle(client, { schema })
}

// Create a singleton instance of the database
export const db = initDatabase()

// Export schema
export { schema }
