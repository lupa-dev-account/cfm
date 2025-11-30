/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user-generated content to prevent XSS attacks
 */

/**
 * Sanitizes a string by escaping HTML special characters
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string safe for HTML rendering
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitizes text content for display (removes HTML tags)
 * 
 * @param input - The string to sanitize
 * @returns Plain text without HTML tags
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a string for use in HTML attributes
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string safe for HTML attributes
 */
export function sanitizeAttribute(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove quotes and other dangerous characters
  return input
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitizes user input for safe display in React
 * React automatically escapes content, but this provides an extra layer
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeForReact(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // React escapes most things automatically, but we'll do basic sanitization
  return escapeHtml(input);
}

