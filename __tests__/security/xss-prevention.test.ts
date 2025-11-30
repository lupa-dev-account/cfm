/**
 * XSS Prevention Tests
 * 
 * Tests for URL sanitization and XSS prevention
 */

import { sanitizeUrl, isUrlSafe } from '@/lib/utils/url-sanitizer';
import { escapeHtml, sanitizeText } from '@/lib/utils/sanitize';

describe('XSS Prevention', () => {
  describe('URL Sanitization', () => {
    it('should block javascript: URLs', () => {
      const maliciousUrl = 'javascript:alert("XSS")';
      expect(sanitizeUrl(maliciousUrl)).toBe('');
      expect(isUrlSafe(maliciousUrl)).toBe(false);
    });

    it('should block data: URLs', () => {
      const maliciousUrl = 'data:text/html,<script>alert("XSS")</script>';
      expect(sanitizeUrl(maliciousUrl)).toBe('');
      expect(isUrlSafe(maliciousUrl)).toBe(false);
    });

    it('should block vbscript: URLs', () => {
      const maliciousUrl = 'vbscript:msgbox("XSS")';
      expect(sanitizeUrl(maliciousUrl)).toBe('');
      expect(isUrlSafe(maliciousUrl)).toBe(false);
    });

    it('should allow valid HTTPS URLs', () => {
      const validUrl = 'https://example.com';
      expect(sanitizeUrl(validUrl)).toBe(validUrl);
      expect(isUrlSafe(validUrl)).toBe(true);
    });

    it('should allow valid HTTP URLs', () => {
      const validUrl = 'http://example.com';
      expect(sanitizeUrl(validUrl)).toBe(validUrl);
      expect(isUrlSafe(validUrl)).toBe(true);
    });

    it('should allow mailto: URLs', () => {
      const validUrl = 'mailto:test@example.com';
      expect(sanitizeUrl(validUrl)).toBe(validUrl);
      expect(isUrlSafe(validUrl)).toBe(true);
    });

    it('should allow tel: URLs', () => {
      const validUrl = 'tel:+1234567890';
      expect(sanitizeUrl(validUrl)).toBe(validUrl);
      expect(isUrlSafe(validUrl)).toBe(true);
    });

    it('should add https:// to URLs without protocol', () => {
      const url = 'example.com';
      expect(sanitizeUrl(url)).toBe('https://example.com');
    });

    it('should handle empty strings', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });
  });

  describe('HTML Escaping', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(input);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should escape ampersands', () => {
      const input = 'A & B';
      expect(escapeHtml(input)).toBe('A &amp; B');
    });

    it('should escape quotes', () => {
      const input = 'He said "Hello"';
      expect(escapeHtml(input)).toContain('&quot;');
    });

    it('should remove HTML tags from text', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      expect(sanitizeText(input)).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });
});
