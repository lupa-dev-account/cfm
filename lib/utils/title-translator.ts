/**
 * Mapping of predefined English titles to their translation keys
 * These titles are stored in the translation files and should be translated using the translation function
 * Note: Keys are normalized (trimmed, case-insensitive) for matching
 */
const PREDEFINED_TITLE_MAP: Record<string, string> = {
  "nothing": "titleNothing",
  "head of the technical unit": "titleHeadTechnicalUnit",
  "head of technical unit": "titleHeadTechnicalUnit", // Variant without "the"
  "director of communication and image": "titleDirectorCommunicationImage",
  "director of comunication and image": "titleDirectorCommunicationImage", // Handle typo variant
  "director of communication & image": "titleDirectorCommunicationImage", // Variant with &
  "director of comunication & image": "titleDirectorCommunicationImage", // Typo variant with &
  "executive board director": "titleExecutiveBoardDirector",
  "executive director": "titleExecutiveBoardDirector", // Short variant
  "chairman of the board of directors": "titleChairmanBoardDirectors",
  "chairman of board of directors": "titleChairmanBoardDirectors", // Variant without "the"
};

/**
 * Normalize title for matching (trim, lowercase, and normalize whitespace)
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*&\s*/g, ' and ') // Normalize & to "and"
    .replace(/\s*\+\s*/g, ' and '); // Normalize + to "and"
}

/**
 * Translates an employee title based on the current locale and available translations
 * @param title - The default title string
 * @param titleTranslations - Optional object with locale keys and translated titles (for custom titles)
 * @param locale - The current locale string
 * @param t - Optional translation function for predefined titles
 * @returns The translated title or the original title if no translation exists
 */
export function translateTitle(
  title: string | undefined | null,
  titleTranslations?: Record<string, string> | null,
  locale?: string,
  t?: (key: string) => string
): string | undefined {
  if (!title) return undefined;

  // Use provided locale or default to "en"
  const currentLocale = locale || "en";

  // Normalize the title for case-insensitive matching
  const normalizedTitle = normalizeTitle(title);
  
  // First, check if this is a predefined title that should be translated using translation keys
  const translationKey = PREDEFINED_TITLE_MAP[normalizedTitle];
  if (translationKey && t) {
    // Use the translation function to get the translated predefined title
    const translated = t(translationKey);
    // Debug log in development
    if (process.env.NODE_ENV === 'development' && !translated) {
      console.warn(`Translation key "${translationKey}" not found for locale "${currentLocale}"`);
    }
    if (translated && translated !== translationKey) {
      return translated;
    }
  }
  
  // Debug log in development if title doesn't match
  if (process.env.NODE_ENV === 'development' && !translationKey && title) {
    console.debug(`Title "${title}" (normalized: "${normalizedTitle}") not found in PREDEFINED_TITLE_MAP`);
  }

  // If custom title_translations are provided, use those
  if (titleTranslations && Object.keys(titleTranslations).length > 0) {
    // Try to get translation for current locale
    if (currentLocale && titleTranslations[currentLocale]) {
      return titleTranslations[currentLocale];
    }

    // Fallback to English if available
    if (titleTranslations.en) {
      return titleTranslations.en;
    }
  }

  // If it's a predefined title but no translation function provided, try to use titleTranslations
  if (translationKey && titleTranslations && Object.keys(titleTranslations).length > 0) {
    if (currentLocale && titleTranslations[currentLocale]) {
      return titleTranslations[currentLocale];
    }
    if (titleTranslations.en) {
      return titleTranslations.en;
    }
  }

  // Fallback to original title
  return title;
}

