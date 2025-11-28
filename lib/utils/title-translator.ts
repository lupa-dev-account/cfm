/**
 * Translates an employee title based on the current locale and available translations
 * @param title - The default title string
 * @param titleTranslations - Optional object with locale keys and translated titles
 * @param locale - The current locale string
 * @returns The translated title or the original title if no translation exists
 */
export function translateTitle(
  title: string | undefined | null,
  titleTranslations?: Record<string, string> | null,
  locale?: string
): string | undefined {
  if (!title) return undefined;

  // If no translations provided, return original title
  if (!titleTranslations || Object.keys(titleTranslations).length === 0) {
    return title;
  }

  // Use provided locale or default to "en"
  const currentLocale = locale || "en";

  // Try to get translation for current locale
  if (currentLocale && titleTranslations[currentLocale]) {
    return titleTranslations[currentLocale];
  }

  // Fallback to English if available
  if (titleTranslations.en) {
    return titleTranslations.en;
  }

  // Fallback to original title
  return title;
}

