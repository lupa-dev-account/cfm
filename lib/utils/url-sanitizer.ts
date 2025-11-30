/**
 * URL Sanitization Utility
 * 
 * Prevents XSS attacks by sanitizing URLs before rendering.
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 */

/**
 * Sanitizes a URL to prevent XSS attacks
 * 
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if URL is dangerous
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  
  // Empty string is safe
  if (trimmed === '') {
    return '';
  }

  // Convert to lowercase for protocol checking
  const lowercased = trimmed.toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'chrome:',
    'chrome-extension:',
    'moz-extension:',
  ];

  for (const protocol of dangerousProtocols) {
    if (lowercased.startsWith(protocol)) {
      return '';
    }
  }

  // Allow safe protocols
  const safeProtocols = [
    'http:',
    'https:',
    'mailto:',
    'tel:',
    'sms:',
    'ftp:',
  ];

  // Check if URL starts with a safe protocol
  const hasSafeProtocol = safeProtocols.some(protocol => 
    lowercased.startsWith(protocol)
  );

  // If URL doesn't start with a protocol, assume it's relative or needs https://
  if (!hasSafeProtocol) {
    // If it starts with //, it's a protocol-relative URL - make it https
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    // If it starts with /, it's a relative URL - return as is
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
    // Otherwise, assume it's a domain and add https://
    return `https://${trimmed}`;
  }

  // URL has a safe protocol, return as is
  return trimmed;
}

/**
 * Validates if a URL is safe to use
 * 
 * @param url - The URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isUrlSafe(url: string | null | undefined): boolean {
  const sanitized = sanitizeUrl(url);
  return sanitized !== '';
}

/**
 * Sanitizes multiple URLs in an object
 * 
 * @param urls - Object containing URL properties
 * @returns Object with sanitized URLs
 */
export function sanitizeUrls<T extends Record<string, string | null | undefined>>(
  urls: T
): { [K in keyof T]: string } {
  const sanitized: any = {};
  
  for (const key in urls) {
    if (Object.prototype.hasOwnProperty.call(urls, key)) {
      sanitized[key] = sanitizeUrl(urls[key]);
    }
  }
  
  return sanitized;
}

