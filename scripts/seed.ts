import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { db, schema } from '../src/lib/db'

// Helper function to get flag URLs
function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`
}

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

async function createTables() {
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || '',
  })

  const db = drizzle(client)

  // Create flags table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      continent TEXT NOT NULL,
      population INTEGER,
      languages TEXT,
      fun_facts TEXT,
      difficulty INTEGER DEFAULT 1,
      image_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `)

  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      email_verified INTEGER,
      image TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `)

  // Create user_progress table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      flag_id INTEGER NOT NULL,
      familiarity INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      last_reviewed INTEGER,
      next_review_date INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE
    );
  `)

  // Create learning_sessions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS learning_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      started_at INTEGER DEFAULT (unixepoch()),
      ended_at INTEGER,
      flags_reviewed INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      incorrect_answers INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // Create session_flags table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS session_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      flag_id INTEGER NOT NULL,
      was_correct INTEGER,
      reviewed_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (flag_id) REFERENCES flags(id) ON DELETE CASCADE
    );
  `)

  console.log('✅ Tables created successfully!')
}

async function main() {
  console.log('🌱 Seeding database with initial data...')

  try {
    // Create tables
    await createTables()

    // Insert flags
    for (const flag of flagData) {
      await db.insert(schema.flags).values(flag).onConflictDoNothing()
      console.log(`✅ Added flag: ${flag.name}`)
    }

    console.log('✅ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
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
