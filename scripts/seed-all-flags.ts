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

// Complete list of countries and territories with ISO 3166-1 alpha-2 codes
// Format: [code, name, continent, population, languages, difficulty]
// Note: Population numbers are approximate (as of 2023)
// Languages are primary official languages
// Difficulty is subjective (1-5 scale, 1 being easiest to recognize)
const countriesData: [string, string, string, number, string, number][] = [
  // North America
  ['US', 'United States', 'North America', 331900000, 'English', 1],
  ['CA', 'Canada', 'North America', 38250000, 'English, French', 1],
  ['MX', 'Mexico', 'North America', 126200000, 'Spanish', 2],
  ['CU', 'Cuba', 'North America', 11330000, 'Spanish', 2],
  ['JM', 'Jamaica', 'North America', 2960000, 'English', 2],
  ['HT', 'Haiti', 'North America', 11400000, 'French, Haitian Creole', 3],
  ['DO', 'Dominican Republic', 'North America', 10850000, 'Spanish', 3],
  ['PR', 'Puerto Rico', 'North America', 2860000, 'Spanish, English', 3],
  ['PA', 'Panama', 'North America', 4310000, 'Spanish', 3],
  ['CR', 'Costa Rica', 'North America', 5090000, 'Spanish', 3],
  ['NI', 'Nicaragua', 'North America', 6620000, 'Spanish', 3],
  ['HN', 'Honduras', 'North America', 9900000, 'Spanish', 3],
  ['SV', 'El Salvador', 'North America', 6490000, 'Spanish', 3],
  ['GT', 'Guatemala', 'North America', 16860000, 'Spanish', 3],
  ['BZ', 'Belize', 'North America', 390000, 'English', 3],
  ['BS', 'Bahamas', 'North America', 389000, 'English', 3],
  ['BB', 'Barbados', 'North America', 287000, 'English', 3],
  ['TT', 'Trinidad and Tobago', 'North America', 1399000, 'English', 3],
  ['GD', 'Grenada', 'North America', 112000, 'English', 3],
  ['LC', 'Saint Lucia', 'North America', 183000, 'English', 3],
  ['VC', 'Saint Vincent and the Grenadines', 'North America', 110000, 'English', 4],
  ['AG', 'Antigua and Barbuda', 'North America', 97000, 'English', 4],
  ['KN', 'Saint Kitts and Nevis', 'North America', 53000, 'English', 4],
  ['DM', 'Dominica', 'North America', 72000, 'English', 4],

  // South America
  ['BR', 'Brazil', 'South America', 213993000, 'Portuguese', 2],
  ['AR', 'Argentina', 'South America', 45376000, 'Spanish', 2],
  ['CL', 'Chile', 'South America', 19116000, 'Spanish', 2],
  ['CO', 'Colombia', 'South America', 50883000, 'Spanish', 2],
  ['PE', 'Peru', 'South America', 32972000, 'Spanish, Quechua, Aymara', 2],
  ['VE', 'Venezuela', 'South America', 28435000, 'Spanish', 2],
  ['EC', 'Ecuador', 'South America', 17643000, 'Spanish, Quechua', 2],
  ['BO', 'Bolivia', 'South America', 11673000, 'Spanish, Quechua, Aymara', 2],
  ['PY', 'Paraguay', 'South America', 7133000, 'Spanish, Guaraní', 3],
  ['UY', 'Uruguay', 'South America', 3474000, 'Spanish', 3],
  ['GY', 'Guyana', 'South America', 787000, 'English', 3],
  ['SR', 'Suriname', 'South America', 587000, 'Dutch', 3],
  ['GF', 'French Guiana', 'South America', 298000, 'French', 4],

  // Europe
  ['GB', 'United Kingdom', 'Europe', 67886000, 'English', 1],
  ['FR', 'France', 'Europe', 65274000, 'French', 1],
  ['DE', 'Germany', 'Europe', 83784000, 'German', 1],
  ['IT', 'Italy', 'Europe', 60461000, 'Italian', 1],
  ['ES', 'Spain', 'Europe', 46754000, 'Spanish', 1],
  ['NL', 'Netherlands', 'Europe', 17135000, 'Dutch', 2],
  ['BE', 'Belgium', 'Europe', 11590000, 'Dutch, French, German', 2],
  ['PT', 'Portugal', 'Europe', 10196000, 'Portuguese', 2],
  ['SE', 'Sweden', 'Europe', 10379000, 'Swedish', 2],
  ['GR', 'Greece', 'Europe', 10423000, 'Greek', 2],
  ['CZ', 'Czech Republic', 'Europe', 10709000, 'Czech', 2],
  ['RO', 'Romania', 'Europe', 19237000, 'Romanian', 2],
  ['PL', 'Poland', 'Europe', 37846000, 'Polish', 2],
  ['UA', 'Ukraine', 'Europe', 44134000, 'Ukrainian', 2],
  ['HU', 'Hungary', 'Europe', 9660000, 'Hungarian', 2],
  ['AT', 'Austria', 'Europe', 9006000, 'German', 2],
  ['CH', 'Switzerland', 'Europe', 8655000, 'German, French, Italian, Romansh', 1],
  ['DK', 'Denmark', 'Europe', 5831000, 'Danish', 2],
  ['FI', 'Finland', 'Europe', 5531000, 'Finnish, Swedish', 2],
  ['NO', 'Norway', 'Europe', 5379000, 'Norwegian', 2],
  ['IE', 'Ireland', 'Europe', 4937000, 'English, Irish', 2],
  ['SK', 'Slovakia', 'Europe', 5459000, 'Slovak', 3],
  ['HR', 'Croatia', 'Europe', 4047000, 'Croatian', 3],
  ['SI', 'Slovenia', 'Europe', 2078000, 'Slovene', 3],
  ['LT', 'Lithuania', 'Europe', 2722000, 'Lithuanian', 3],
  ['LV', 'Latvia', 'Europe', 1886000, 'Latvian', 3],
  ['EE', 'Estonia', 'Europe', 1326000, 'Estonian', 3],
  ['BG', 'Bulgaria', 'Europe', 6948000, 'Bulgarian', 3],
  ['RS', 'Serbia', 'Europe', 8737000, 'Serbian', 3],
  ['ME', 'Montenegro', 'Europe', 628000, 'Montenegrin', 3],
  ['MK', 'North Macedonia', 'Europe', 2083000, 'Macedonian', 3],
  ['AL', 'Albania', 'Europe', 2877000, 'Albanian', 3],
  ['IS', 'Iceland', 'Europe', 341000, 'Icelandic', 2],
  ['LU', 'Luxembourg', 'Europe', 625000, 'Luxembourgish, French, German', 3],
  ['CY', 'Cyprus', 'Europe', 1207000, 'Greek, Turkish', 3],
  ['MT', 'Malta', 'Europe', 441000, 'Maltese, English', 3],
  ['BA', 'Bosnia and Herzegovina', 'Europe', 3280000, 'Bosnian, Croatian, Serbian', 3],
  ['MC', 'Monaco', 'Europe', 39000, 'French', 3],
  ['LI', 'Liechtenstein', 'Europe', 38000, 'German', 3],
  ['AD', 'Andorra', 'Europe', 77000, 'Catalan', 3],
  ['SM', 'San Marino', 'Europe', 34000, 'Italian', 3],
  ['VA', 'Vatican City', 'Europe', 800, 'Italian, Latin', 2],
  ['BY', 'Belarus', 'Europe', 9465000, 'Belarusian, Russian', 2],
  ['MD', 'Moldova', 'Europe', 4033000, 'Romanian', 3],

  // Asia
  ['JP', 'Japan', 'Asia', 126476000, 'Japanese', 1],
  ['CN', 'China', 'Asia', 1402000000, 'Chinese', 1],
  ['IN', 'India', 'Asia', 1380000000, 'Hindi, English', 1],
  ['KR', 'South Korea', 'Asia', 51269000, 'Korean', 2],
  ['KP', 'North Korea', 'Asia', 25778000, 'Korean', 2],
  ['ID', 'Indonesia', 'Asia', 273524000, 'Indonesian', 2],
  ['PH', 'Philippines', 'Asia', 109581000, 'Filipino, English', 2],
  ['VN', 'Vietnam', 'Asia', 97339000, 'Vietnamese', 2],
  ['TH', 'Thailand', 'Asia', 69800000, 'Thai', 2],
  ['MY', 'Malaysia', 'Asia', 32366000, 'Malay', 2],
  ['SG', 'Singapore', 'Asia', 5686000, 'English, Malay, Mandarin, Tamil', 2],
  ['MM', 'Myanmar', 'Asia', 54410000, 'Burmese', 3],
  ['KH', 'Cambodia', 'Asia', 16719000, 'Khmer', 3],
  ['LA', 'Laos', 'Asia', 7276000, 'Lao', 3],
  ['BD', 'Bangladesh', 'Asia', 164689000, 'Bengali', 2],
  ['PK', 'Pakistan', 'Asia', 220892000, 'Urdu, English', 2],
  ['NP', 'Nepal', 'Asia', 29137000, 'Nepali', 3],
  ['BT', 'Bhutan', 'Asia', 772000, 'Dzongkha', 4],
  ['LK', 'Sri Lanka', 'Asia', 21413000, 'Sinhala, Tamil', 3],
  ['MV', 'Maldives', 'Asia', 541000, 'Dhivehi', 3],
  ['MN', 'Mongolia', 'Asia', 3278000, 'Mongolian', 3],
  ['BN', 'Brunei', 'Asia', 437000, 'Malay', 3],
  ['TL', 'East Timor', 'Asia', 1318000, 'Tetum, Portuguese', 4],
  ['TW', 'Taiwan', 'Asia', 23816000, 'Mandarin Chinese', 2],
  ['HK', 'Hong Kong', 'Asia', 7482000, 'Chinese, English', 4],
  ['MO', 'Macau', 'Asia', 649000, 'Chinese, Portuguese', 4],

  // Middle East
  ['TR', 'Turkey', 'Asia', 84339000, 'Turkish', 2],
  ['IL', 'Israel', 'Asia', 9217000, 'Hebrew, Arabic', 2],
  ['SA', 'Saudi Arabia', 'Asia', 34814000, 'Arabic', 2],
  ['AE', 'United Arab Emirates', 'Asia', 9890000, 'Arabic', 2],
  ['IR', 'Iran', 'Asia', 83993000, 'Persian', 2],
  ['IQ', 'Iraq', 'Asia', 40223000, 'Arabic, Kurdish', 2],
  ['SY', 'Syria', 'Asia', 17500000, 'Arabic', 2],
  ['JO', 'Jordan', 'Asia', 10203000, 'Arabic', 3],
  ['LB', 'Lebanon', 'Asia', 6825000, 'Arabic', 2],
  ['KW', 'Kuwait', 'Asia', 4271000, 'Arabic', 3],
  ['QA', 'Qatar', 'Asia', 2881000, 'Arabic', 3],
  ['BH', 'Bahrain', 'Asia', 1702000, 'Arabic', 3],
  ['OM', 'Oman', 'Asia', 5107000, 'Arabic', 3],
  ['YE', 'Yemen', 'Asia', 29826000, 'Arabic', 3],
  ['PS', 'Palestine', 'Asia', 5101000, 'Arabic', 3],
  ['GE', 'Georgia', 'Asia', 3989000, 'Georgian', 3],
  ['AM', 'Armenia', 'Asia', 2963000, 'Armenian', 3],
  ['AZ', 'Azerbaijan', 'Asia', 10139000, 'Azerbaijani', 3],

  // Africa
  [
    'ZA',
    'South Africa',
    'Africa',
    59309000,
    '11 official languages including Zulu, Xhosa, Afrikaans, English',
    3,
  ],
  ['EG', 'Egypt', 'Africa', 102334000, 'Arabic', 2],
  ['NG', 'Nigeria', 'Africa', 206140000, 'English', 2],
  ['KE', 'Kenya', 'Africa', 53771000, 'Swahili, English', 3],
  ['ET', 'Ethiopia', 'Africa', 114964000, 'Amharic', 3],
  ['TZ', 'Tanzania', 'Africa', 59734000, 'Swahili, English', 3],
  ['DZ', 'Algeria', 'Africa', 43851000, 'Arabic, Berber', 2],
  ['MA', 'Morocco', 'Africa', 36911000, 'Arabic', 2],
  ['TN', 'Tunisia', 'Africa', 11819000, 'Arabic', 3],
  ['LY', 'Libya', 'Africa', 6871000, 'Arabic', 3],
  ['GH', 'Ghana', 'Africa', 31073000, 'English', 3],
  ['CD', 'Democratic Republic of the Congo', 'Africa', 89561000, 'French', 3],
  ['CG', 'Republic of the Congo', 'Africa', 5518000, 'French', 3],
  ['CM', 'Cameroon', 'Africa', 26546000, 'French, English', 3],
  ['CI', 'Ivory Coast', 'Africa', 26378000, 'French', 3],
  ['SN', 'Senegal', 'Africa', 16744000, 'French', 3],
  ['UG', 'Uganda', 'Africa', 45741000, 'English, Swahili', 3],
  ['RW', 'Rwanda', 'Africa', 12952000, 'Kinyarwanda, French, English', 3],
  ['ZM', 'Zambia', 'Africa', 18384000, 'English', 3],
  ['ZW', 'Zimbabwe', 'Africa', 14863000, 'English', 3],
  ['AO', 'Angola', 'Africa', 32866000, 'Portuguese', 3],
  ['BW', 'Botswana', 'Africa', 2352000, 'English, Tswana', 3],
  ['NA', 'Namibia', 'Africa', 2541000, 'English', 3],
  ['MZ', 'Mozambique', 'Africa', 31255000, 'Portuguese', 3],
  ['MG', 'Madagascar', 'Africa', 27691000, 'Malagasy, French', 3],
  ['ML', 'Mali', 'Africa', 20251000, 'French', 3],
  ['BF', 'Burkina Faso', 'Africa', 20903000, 'French', 3],
  ['NE', 'Niger', 'Africa', 24207000, 'French', 3],
  ['TD', 'Chad', 'Africa', 16426000, 'French, Arabic', 3],
  ['SD', 'Sudan', 'Africa', 43849000, 'Arabic, English', 3],
  ['SS', 'South Sudan', 'Africa', 11194000, 'English', 3],
  ['ER', 'Eritrea', 'Africa', 3546000, 'Tigrinya, Arabic, English', 3],
  ['DJ', 'Djibouti', 'Africa', 988000, 'French, Arabic', 4],
  ['SO', 'Somalia', 'Africa', 15893000, 'Somali, Arabic', 2],
  ['GM', 'Gambia', 'Africa', 2417000, 'English', 3],
  ['GN', 'Guinea', 'Africa', 13133000, 'French', 3],
  ['GW', 'Guinea-Bissau', 'Africa', 1968000, 'Portuguese', 4],
  ['LR', 'Liberia', 'Africa', 5058000, 'English', 3],
  ['SL', 'Sierra Leone', 'Africa', 7977000, 'English', 3],
  ['TG', 'Togo', 'Africa', 8279000, 'French', 3],
  ['BJ', 'Benin', 'Africa', 12123000, 'French', 3],
  ['GA', 'Gabon', 'Africa', 2226000, 'French', 4],
  ['GQ', 'Equatorial Guinea', 'Africa', 1403000, 'Spanish, French, Portuguese', 4],
  ['BI', 'Burundi', 'Africa', 11891000, 'Kirundi, French', 4],
  ['CV', 'Cape Verde', 'Africa', 556000, 'Portuguese', 4],
  ['KM', 'Comoros', 'Africa', 870000, 'Comorian, Arabic, French', 4],
  ['MU', 'Mauritius', 'Africa', 1272000, 'English, French', 4],
  ['ST', 'São Tomé and Príncipe', 'Africa', 219000, 'Portuguese', 4],
  ['SC', 'Seychelles', 'Africa', 98000, 'Seychellois Creole, English, French', 4],
  ['SZ', 'Eswatini', 'Africa', 1160000, 'English, Swazi', 4],
  ['LS', 'Lesotho', 'Africa', 2142000, 'Sesotho, English', 4],
  ['MW', 'Malawi', 'Africa', 19130000, 'English, Chichewa', 4],
  ['CF', 'Central African Republic', 'Africa', 4830000, 'French, Sango', 4],
  ['MR', 'Mauritania', 'Africa', 4650000, 'Arabic', 3],

  // Oceania
  ['AU', 'Australia', 'Oceania', 25687000, 'English', 1],
  ['NZ', 'New Zealand', 'Oceania', 4917000, 'English, Māori', 2],
  ['PG', 'Papua New Guinea', 'Oceania', 8947000, 'English, Tok Pisin, Hiri Motu', 3],
  ['FJ', 'Fiji', 'Oceania', 896000, 'English, Fijian, Hindi', 3],
  ['SB', 'Solomon Islands', 'Oceania', 687000, 'English', 4],
  ['VU', 'Vanuatu', 'Oceania', 307000, 'Bislama, English, French', 4],
  ['WS', 'Samoa', 'Oceania', 198000, 'Samoan, English', 4],
  ['TO', 'Tonga', 'Oceania', 105000, 'Tongan, English', 4],
  ['KI', 'Kiribati', 'Oceania', 119000, 'English, Gilbertese', 4],
  ['FM', 'Micronesia', 'Oceania', 115000, 'English', 4],
  ['MH', 'Marshall Islands', 'Oceania', 59000, 'Marshallese, English', 4],
  ['PW', 'Palau', 'Oceania', 18000, 'Palauan, English', 4],
  ['NR', 'Nauru', 'Oceania', 10000, 'Nauruan, English', 4],
  ['TV', 'Tuvalu', 'Oceania', 12000, 'Tuvaluan, English', 4],

  // Others (territories, dependencies, etc.)
  ['GI', 'Gibraltar', 'Europe', 33700, 'English', 4],
  ['GL', 'Greenland', 'North America', 56000, 'Greenlandic, Danish', 3],
  ['FO', 'Faroe Islands', 'Europe', 49000, 'Faroese, Danish', 4],
  ['AW', 'Aruba', 'North America', 107000, 'Dutch, Papiamento', 4],
  ['AI', 'Anguilla', 'North America', 15000, 'English', 4],
  ['BM', 'Bermuda', 'North America', 62000, 'English', 4],
  ['TC', 'Turks and Caicos Islands', 'North America', 38000, 'English', 4],
  ['VG', 'British Virgin Islands', 'North America', 30000, 'English', 4],
  ['KY', 'Cayman Islands', 'North America', 65000, 'English', 4],
  ['MS', 'Montserrat', 'North America', 5000, 'English', 4],
  ['SH', 'Saint Helena', 'Africa', 6000, 'English', 4],
  ['FK', 'Falkland Islands', 'South America', 3400, 'English', 4],
  ['PM', 'Saint Pierre and Miquelon', 'North America', 6000, 'French', 4],
  ['BL', 'Saint Barthélemy', 'North America', 10000, 'French', 4],
  ['MF', 'Saint Martin', 'North America', 38000, 'French', 4],
  ['GP', 'Guadeloupe', 'North America', 400000, 'French', 4],
  ['MQ', 'Martinique', 'North America', 376000, 'French', 4],
  ['PF', 'French Polynesia', 'Oceania', 280000, 'French', 4],
  ['NC', 'New Caledonia', 'Oceania', 271000, 'French', 4],
  ['WF', 'Wallis and Futuna', 'Oceania', 11000, 'French', 4],
  ['CK', 'Cook Islands', 'Oceania', 17500, 'English, Cook Islands Māori', 4],
  ['NU', 'Niue', 'Oceania', 1600, 'English, Niuean', 4],
  ['AS', 'American Samoa', 'Oceania', 55000, 'English, Samoan', 4],
  ['GU', 'Guam', 'Oceania', 169000, 'English, Chamorro', 4],
  ['MP', 'Northern Mariana Islands', 'Oceania', 57000, 'English, Chamorro', 4],
  ['VI', 'U.S. Virgin Islands', 'North America', 106000, 'English', 4],
  ['CW', 'Curaçao', 'North America', 164000, 'Dutch, Papiamento, English', 4],
  ['SX', 'Sint Maarten', 'North America', 42000, 'Dutch, English', 4],
  ['BQ', 'Bonaire, Sint Eustatius and Saba', 'North America', 26000, 'Dutch', 4],
  ['IO', 'British Indian Ocean Territory', 'Asia', 3000, 'English', 5],
]

// Generate fun facts for countries
function generateFunFacts(code: string, name: string): string[] {
  const funFactsMap: Record<string, string[]> = {
    // North America
    US: [
      'The 50 stars represent the 50 states of the union',
      'The 13 stripes represent the original 13 colonies',
      'The current design was adopted in 1960 after Hawaii became a state',
    ],
    CA: [
      'The maple leaf design was adopted in 1965',
      'The red symbolizes the sacrifice of Canadians during World War I',
      'The maple leaf has been a symbol of Canada since the 1700s',
    ],
    MX: [
      'The eagle with a serpent is based on an Aztec legend',
      'The green represents independence',
      'The white represents purity and religion',
      'The red represents the blood of national heroes',
    ],

    // Europe
    GB: [
      'Combines the crosses of St. George (England), St. Andrew (Scotland), and St. Patrick (Ireland)',
      'Known as the Union Jack or Union Flag',
      'The current design was adopted in 1801',
    ],
    CH: [
      'One of only two square national flags (the other being Vatican City)',
      'The white cross has been a symbol of Switzerland since the 13th century',
      'The design was officially adopted in 1889',
    ],
    FR: [
      'The tricolor flag was adopted after the French Revolution',
      'The blue and red represent Paris, and white represents the monarchy',
      'Napoleon made it the official flag in 1804',
    ],

    // Asia
    JP: [
      "The flag is called 'Nisshōki' (日章旗) in Japanese, meaning 'sun-mark flag'",
      "It is also known as 'Hinomaru' (日の丸), meaning 'circle of the sun'",
      'The design has been used since the 7th century',
    ],
    CN: [
      'The large star represents the Communist Party',
      'The four smaller stars represent the social classes of China',
      'The red color symbolizes the communist revolution',
    ],
    NP: [
      "It's the only national flag that is not rectangular or square",
      'The two triangles represent the Himalaya Mountains and the two main religions (Hinduism and Buddhism)',
      'The sun and moon represent the hope that Nepal will last as long as these celestial bodies',
    ],
    BT: [
      'The dragon on the flag is called Druk (Thunder Dragon)',
      "It's one of the few national flags that doesn't use red, white, or blue",
      'The dragon holds jewels in its claws, representing wealth',
    ],

    // Africa
    ZA: [
      "The flag was designed in 1994 to represent the country's new democracy",
      'The Y-shape represents the convergence of diverse elements in South African society',
      "It's the only national flag with six colors not derived from a coat of arms",
    ],
    KE: [
      'The black represents the people of Kenya',
      'The red represents the blood shed during the fight for independence',
      "The green represents the country's natural wealth",
      'The Maasai shield and spears represent the defense of freedom',
    ],

    // South America
    BR: [
      'The green represents the forests of Brazil',
      "The yellow diamond represents the country's wealth in gold",
      'The blue circle depicts the night sky over Rio de Janeiro on November 15, 1889',
      "The motto 'Ordem e Progresso' means 'Order and Progress'",
    ],
    AR: [
      'The Sun of May in the center represents the May Revolution',
      'The light blue stripes represent the sky and the Rio de la Plata',
      'The design was inspired by the cockade worn during the revolution',
    ],

    // Oceania
    AU: [
      'The Union Jack represents historical ties to Britain',
      'The Commonwealth Star has seven points representing the states and territories',
      'The Southern Cross constellation is visible from all of Australia',
    ],
    NZ: [
      'The stars represent the Southern Cross constellation',
      'The Union Jack represents historical ties to Britain',
      'There was a referendum in 2016 to change the flag, but the original design was kept',
    ],
  }

  // Return specific fun facts if available, otherwise generate generic ones
  if (funFactsMap[code]) {
    return funFactsMap[code]
  }

  // Generate generic fun facts
  return [
    `The flag of ${name} is recognized by the United Nations`,
    `The current design was adopted after gaining independence or following major political changes`,
    `The colors and symbols often represent important national values or historical events`,
  ]
}

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
  console.log('🌱 Starting ALL countries database seed process...')
  console.log(`🌎 Preparing to seed ${countriesData.length} countries/territories...`)

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
    console.log(`🚩 Inserting ${countriesData.length} flags...`)

    let successCount = 0
    let errorCount = 0

    for (const [code, name, continent, population, languages, difficulty] of countriesData) {
      try {
        // Generate fun facts for this country
        const funFacts = generateFunFacts(code, name)

        await db.insert(schema.flags).values({
          name,
          code,
          continent,
          population,
          languages,
          funFacts: JSON.stringify(funFacts),
          difficulty,
          imageUrl: getFlagUrl(code),
        })
        successCount++

        // Only log every 10 countries to avoid console spam
        if (
          successCount % 10 === 0 ||
          successCount === 1 ||
          successCount === countriesData.length
        ) {
          console.log(`✅ Added ${successCount}/${countriesData.length} flags... (Last: ${name})`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Error adding flag ${name} (${code}):`, error)
      }
    }

    // Verify the flags were actually inserted
    const finalCountQuery = await client.execute('SELECT COUNT(*) as count FROM flags')
    const finalCount = finalCountQuery.rows[0].count as number

    if (finalCount === countriesData.length) {
      console.log(`✅ All ${finalCount} flags inserted successfully!`)
    } else {
      console.warn(`⚠️ ${finalCount} out of ${countriesData.length} flags were inserted.`)
      console.warn(`❌ ${errorCount} flags failed to insert.`)
    }

    console.log('✅ All countries seed completed successfully!')
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
    console.log('✅ Seeding ALL countries completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  })
