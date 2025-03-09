'use client'

import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'
import { schema } from './index'

// Create a client for the browser
export function createBrowserClient() {
  if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
    throw new Error('NEXT_PUBLIC_DATABASE_URL environment variable is not set')
  }

  const client = createClient({
    url: process.env.NEXT_PUBLIC_DATABASE_URL,
    authToken: process.env.NEXT_PUBLIC_DATABASE_AUTH_TOKEN,
  })

  return drizzle(client, { schema })
}

// Create a singleton instance of the database for the browser
export const browserDb = createBrowserClient()
