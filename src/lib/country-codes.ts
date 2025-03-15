/**
 * Popular and visually distinct ISO 3166-1 alpha-2 country codes
 * Organized into rows for the flags banner animation
 */

// All codes are lowercase for consistency
export const countryCodes = [
  // Row 1: Large countries with diverse flags
  "us",
  "ca",
  "br",
  "mx",
  "ar",
  "jp",
  "au",
  "in",
  "cn",
  "ru",
  "fr",
  "de",
  "gb",
  "it",
  "es",
  "za",
  "ng",
  "eg",
  "sa",
  "tr",

  // Row 2: Smaller countries with distinctive flags
  "se",
  "ch",
  "no",
  "dk",
  "fi",
  "nz",
  "sg",
  "kr",
  "ph",
  "th",
  "my",
  "id",
  "vn",
  "pt",
  "gr",
  "be",
  "nl",
  "ie",
  "at",
  "pl",

  // Row 3: Diverse selection of other countries
  "dz",
  "ma",
  "ke",
  "gh",
  "et",
  "ro",
  "bg",
  "ua",
  "il",
  "jo",
  "lb",
  "qa",
  "kw",
  "pk",
  "bd",
  "np",
  "lk",
  "pe",
  "co",
  "cl",

  // Row 4: Additional countries with colorful and distinctive flags
  "is",
  "cz",
  "sk",
  "hu",
  "hr",
  "rs",
  "ba",
  "me",
  "al",
  "mk",
  "cy",
  "mt",
  "lu",
  "ee",
  "lv",
  "lt",
  "md",
  "ge",
  "am",
  "az",
];

/**
 * Get a random selection of country codes
 * @param count - Number of country codes to return
 * @returns Array of random country codes
 */
export function getRandomCountryCodes(count = 20): string[] {
  const shuffled = [...countryCodes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get rows of country codes for the flag banner using ALL available flags
 * @returns Object with arrays of country codes for each row
 */
export function getFlagRows() {
  // Create a shuffled copy of the full country codes array
  const shuffled = [...countryCodes].sort(() => Math.random() - 0.5);

  // Calculate how many flags per row (roughly equal distribution)
  const totalFlags = shuffled.length;
  const flagsPerRow = Math.ceil(totalFlags / 4);

  // Split the shuffled array into four segments for the rows
  return {
    row1: shuffled.slice(0, flagsPerRow),
    row2: shuffled.slice(flagsPerRow, flagsPerRow * 2),
    row3: shuffled.slice(flagsPerRow * 2, flagsPerRow * 3),
    row4: shuffled.slice(flagsPerRow * 3),
  };
}
