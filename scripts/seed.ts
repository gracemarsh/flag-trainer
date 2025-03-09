import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { schema } from '../src/lib/db'

// Helper function to get flag URLs
function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`
}

// Log the database URL (without auth token) for debugging
const dbUrl = process.env.DATABASE_URL || 'file:./local.db'
console.log(`🔌 Connecting to database: ${dbUrl}`)

// Initialize database client
const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN || '',
})

// Initialize Drizzle with the schema
const db = drizzle(client, { schema })

const flagData = [
  {
    name: 'United States',
    code: 'US',
    continent: 'North America',
    population: 331002651,
    languages: 'English',
    funFacts: JSON.stringify([
      'The 50 stars represent the 50 states of the union',
      'The 13 stripes represent the original 13 colonies',
      'The current design was adopted in 1960 after Hawaii became a state',
    ]),
    difficulty: 1,
    imageUrl: getFlagUrl('US'),
  },
  {
    name: 'Japan',
    code: 'JP',
    continent: 'Asia',
    population: 126476461,
    languages: 'Japanese',
    funFacts: JSON.stringify([
      "The flag is called 'Nisshōki' (日章旗) in Japanese, meaning 'sun-mark flag'",
      "It is also known as 'Hinomaru' (日の丸), meaning 'circle of the sun'",
      'The design has been used since the 7th century',
    ]),
    difficulty: 1,
    imageUrl: getFlagUrl('JP'),
  },
  {
    name: 'Brazil',
    code: 'BR',
    continent: 'South America',
    population: 212559417,
    languages: 'Portuguese',
    funFacts: JSON.stringify([
      'The green represents the forests of Brazil',
      "The yellow diamond represents the country's wealth in gold",
      'The blue circle depicts the night sky over Rio de Janeiro on November 15, 1889',
    ]),
    difficulty: 2,
    imageUrl: getFlagUrl('BR'),
  },
  {
    name: 'Bhutan',
    code: 'BT',
    continent: 'Asia',
    population: 771608,
    languages: 'Dzongkha',
    funFacts: JSON.stringify([
      'The dragon on the flag is called Druk (Thunder Dragon)',
      "It's one of the few national flags that doesn't use red, white, or blue",
      'The dragon holds jewels in its claws, representing wealth',
    ]),
    difficulty: 4,
    imageUrl: getFlagUrl('BT'),
  },
  {
    name: 'South Africa',
    code: 'ZA',
    continent: 'Africa',
    population: 59308690,
    languages: '11 official languages including Zulu, Xhosa, Afrikaans, English',
    funFacts: JSON.stringify([
      "The flag was designed in 1994 to represent the country's new democracy",
      'The Y-shape represents the convergence of diverse elements in South African society',
      "It's the only national flag with six colors not derived from a coat of arms",
    ]),
    difficulty: 3,
    imageUrl: getFlagUrl('ZA'),
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    continent: 'Europe',
    population: 67886011,
    languages: 'English',
    funFacts: JSON.stringify([
      'Combines the crosses of St. George (England), St. Andrew (Scotland), and St. Patrick (Ireland)',
      'Known as the Union Jack or Union Flag',
      'The current design was adopted in 1801',
    ]),
    difficulty: 1,
    imageUrl: getFlagUrl('GB'),
  },
  {
    name: 'Nepal',
    code: 'NP',
    continent: 'Asia',
    population: 29136808,
    languages: 'Nepali',
    funFacts: JSON.stringify([
      "It's the only national flag that is not rectangular or square",
      'The two triangles represent the Himalaya Mountains and the two main religions (Hinduism and Buddhism)',
      'The sun and moon represent the hope that Nepal will last as long as these celestial bodies',
    ]),
    difficulty: 3,
    imageUrl: getFlagUrl('NP'),
  },
  {
    name: 'Kenya',
    code: 'KE',
    continent: 'Africa',
    population: 53771296,
    languages: 'Swahili, English',
    funFacts: JSON.stringify([
      'The black represents the people of Kenya',
      'The red represents the blood shed during the fight for independence',
      "The green represents the country's natural wealth",
      'The Maasai shield and spears represent the defense of freedom',
    ]),
    difficulty: 3,
    imageUrl: getFlagUrl('KE'),
  },
  {
    name: 'Canada',
    code: 'CA',
    continent: 'North America',
    population: 37742154,
    languages: 'English, French',
    funFacts: JSON.stringify([
      'The maple leaf design was adopted in 1965',
      'The red symbolizes the sacrifice of Canadians during World War I',
      'The maple leaf has been a symbol of Canada since the 1700s',
    ]),
    difficulty: 1,
    imageUrl: getFlagUrl('CA'),
  },
  {
    name: 'Switzerland',
    code: 'CH',
    continent: 'Europe',
    population: 8654622,
    languages: 'German, French, Italian, Romansh',
    funFacts: JSON.stringify([
      'One of only two square national flags (the other being Vatican City)',
      'The white cross has been a symbol of Switzerland since the 13th century',
      'The design was officially adopted in 1889',
    ]),
    difficulty: 1,
    imageUrl: getFlagUrl('CH'),
  },
]

// Verify the database connection
async function verifyConnection() {
  try {
    // Try to execute a simple query to check connection
    await client.execute('SELECT 1')
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

async function main() {
  console.log('🌱 Starting database seed process...')

  // Verify database connection first
  const isConnected = await verifyConnection()
  if (!isConnected) {
    console.error('❌ Cannot proceed with seeding due to connection issues')
    process.exit(1)
  }

  try {
    console.log('📊 Counting existing flags...')
    // Check if we already have flags in the database
    const existingFlagsQuery = await client.execute('SELECT COUNT(*) as count FROM flags')
    const existingCount = existingFlagsQuery.rows[0].count as number

    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing flags in the database.`)
      console.log('🗑️ Clearing existing flags to avoid duplicates...')
      await client.execute('DELETE FROM flags')
      console.log('✅ Existing flags cleared.')
    }

    // Insert flags with detailed logging
    console.log(`🚩 Inserting ${flagData.length} flags...`)

    for (const flag of flagData) {
      try {
        await db.insert(schema.flags).values({
          name: flag.name,
          code: flag.code,
          continent: flag.continent,
          population: flag.population,
          languages: flag.languages,
          funFacts: flag.funFacts,
          difficulty: flag.difficulty,
          imageUrl: flag.imageUrl,
        })
        console.log(`✅ Added flag: ${flag.name} (${flag.code})`)
      } catch (error) {
        console.error(`❌ Error adding flag ${flag.name}:`, error)
      }
    }

    // Verify the flags were actually inserted
    const finalCountQuery = await client.execute('SELECT COUNT(*) as count FROM flags')
    const finalCount = finalCountQuery.rows[0].count as number

    if (finalCount === flagData.length) {
      console.log(`✅ All ${finalCount} flags inserted successfully!`)
    } else {
      console.warn(`⚠️ Only ${finalCount} out of ${flagData.length} flags were inserted.`)
    }

    console.log('✅ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    // Explicitly close the connection
    await client.close()
  }
}

main()
  .then(() => {
    console.log('✅ Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  })
