import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@libsql/client'

// Log the database URL (without auth token) for debugging
const dbUrl = process.env.DATABASE_URL || 'file:./local.db'
console.log(`🔌 Checking database: ${dbUrl}`)

// Initialize database client
const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
})

async function main() {
  try {
    console.log('🧪 Testing database connection...')
    await client.execute('SELECT 1')
    console.log('✅ Database connection successful!')

    // Check tables
    console.log('📋 Checking database tables...')
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `)

    console.log('Tables found:')
    tablesResult.rows.forEach((row) => {
      console.log(`- ${row.name}`)
    })

    // Check flags table structure
    if (tablesResult.rows.some((row) => row.name === 'flags')) {
      console.log('\n📊 Checking flags table structure:')
      const tableInfoResult = await client.execute(`PRAGMA table_info(flags);`)

      tableInfoResult.rows.forEach((column) => {
        console.log(`- ${column.name} (${column.type})`)
      })

      // Count flags
      const countResult = await client.execute('SELECT COUNT(*) as count FROM flags')
      console.log(`\n🚩 Number of flags in database: ${countResult.rows[0].count}`)

      if (Number(countResult.rows[0].count) > 0) {
        // Show some examples
        console.log('\n🌍 Sample flags from database:')
        const sampleResult = await client.execute(
          'SELECT id, name, code, continent FROM flags LIMIT 5'
        )

        sampleResult.rows.forEach((flag) => {
          console.log(`- ${flag.id}: ${flag.name} (${flag.code}) - ${flag.continent}`)
        })
      }
    }
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await client.close()
  }
}

main()
  .then(() => {
    console.log('\n✅ Database check completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during database check:', error)
    process.exit(1)
  })
