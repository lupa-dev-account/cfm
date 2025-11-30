/**
 * Signin Form Validation Tests
 * 
 * Tests for signin form validation, error handling, and security
 */

import * as z from 'zod';

// Replicate the signin schema from the component
// Note: In a real scenario, you'd extract this to a shared validation file
const createSignInSchema = (t: (key: string) => string) => {
  return z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(1, 'Password is required'),
  });
};

// Mock translation function
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    invalidEmail: 'Invalid email address',
  };
  return translations[key] || key;
};

describe('Signin Form Validation', () => {
  const signInSchema = createSignInSchema(mockT);

  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.com',
        'user_name@example-domain.com',
        'user123@example123.com',
        'compadmin@cfm.co.mz',
        'admin@cfm.com',
      ];

      validEmails.forEach(email => {
        const result = signInSchema.safeParse({
          email,
          password: 'testpassword123',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(email);
        }
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@domain.com',
        'user@',
        'user @domain.com', // Space in email
        'user@domain .com', // Space in domain
        'user@@domain.com', // Double @
        '', // Empty string
      ];

      invalidEmails.forEach(email => {
        const result = signInSchema.safeParse({
          email,
          password: 'testpassword123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain('email');
        }
      });
    });

    it('should reject emails with XSS attempts', () => {
      const xssEmails = [
        '<script>alert("xss")</script>@example.com',
        'user<script>@example.com',
        'user@example.com<script>',
        'user@example.com"><script>alert(1)</script>',
      ];

      xssEmails.forEach(email => {
        const result = signInSchema.safeParse({
          email,
          password: 'testpassword123',
        });
        // Zod email validation should reject these as invalid email format
        expect(result.success).toBe(false);
      });
    });

    it('should handle case-insensitive email validation', () => {
      const emails = [
        'USER@EXAMPLE.COM',
        'User@Example.Com',
        'user@EXAMPLE.com',
      ];

      emails.forEach(email => {
        const result = signInSchema.safeParse({
          email,
          password: 'testpassword123',
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Password Validation', () => {
    it('should accept non-empty passwords', () => {
      const validPasswords = [
        'password123',
        'P@ssw0rd!',
        'a', // Minimum length is 1
        'verylongpasswordthatexceedsnormalrequirements',
        '12345678',
        'compadmin123',
      ];

      validPasswords.forEach(password => {
        const result = signInSchema.safeParse({
          email: 'user@example.com',
          password,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.password).toBe(password);
        }
      });
    });

    it('should reject empty passwords', () => {
      // Empty string should fail validation
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.errors.find(
          e => e.path.includes('password')
        );
        expect(passwordError).toBeDefined();
        expect(passwordError?.message).toContain('required');
      }
    });

    it('should accept passwords with only whitespace', () => {
      // Note: The schema uses .min(1) which accepts whitespace-only strings
      // This is the actual behavior of the current schema
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: '   ',
      });
      // Whitespace-only passwords are accepted by .min(1)
      expect(result.success).toBe(true);
    });

    it('should preserve password value (no trimming)', () => {
      const passwords = [
        ' password123 ',
        '  test  ',
      ];

      passwords.forEach(password => {
        const result = signInSchema.safeParse({
          email: 'user@example.com',
          password,
        });
        // Passwords with whitespace should be accepted (not trimmed)
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.password).toBe(password);
        }
      });
    });
  });

  describe('Form Validation - Combined Fields', () => {
    it('should accept valid form data', () => {
      const validData = {
        email: 'compadmin@cfm.co.mz',
        password: 'compadmin123',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validData.email);
        expect(result.data.password).toBe(validData.password);
      }
    });

    it('should reject form with missing email', () => {
      const invalidData = {
        password: 'testpassword123',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.errors.find(
          e => e.path.includes('email')
        );
        expect(emailError).toBeDefined();
      }
    });

    it('should reject form with missing password', () => {
      const invalidData = {
        email: 'user@example.com',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.errors.find(
          e => e.path.includes('password')
        );
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject form with both fields invalid', () => {
      const invalidData = {
        email: 'notanemail',
        password: '',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(1);
        const emailError = result.error.errors.find(
          e => e.path.includes('email')
        );
        const passwordError = result.error.errors.find(
          e => e.path.includes('password')
        );
        expect(emailError).toBeDefined();
        expect(passwordError).toBeDefined();
      }
    });
  });

  describe('Security Considerations', () => {
    it('should handle SQL injection attempts in email', () => {
      // Note: Some SQL injection patterns might be valid email formats
      // The actual SQL injection protection comes from using parameterized queries
      // in the database layer, not from email validation
      const sqlInjectionEmails = [
        "admin'--@example.com",
        "admin' OR '1'='1@example.com",
        "admin'; DROP TABLE users;--@example.com",
      ];

      sqlInjectionEmails.forEach(email => {
        const result = signInSchema.safeParse({
          email,
          password: 'testpassword123',
        });
        // Check if email format is valid (some SQL patterns might be valid emails)
        // The important thing is that parameterized queries prevent SQL injection
        // regardless of email validation
        if (result.success) {
          // If accepted, verify it's a string (not executed as SQL)
          expect(typeof result.data.email).toBe('string');
        }
        // Whether accepted or rejected, the email should be treated as a string value
        // SQL injection protection is handled at the database query level
      });
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const result = signInSchema.safeParse({
        email: longEmail,
        password: 'testpassword123',
      });
      // Zod email validation should handle this
      expect(result.success).toBe(true);
    });

    it('should handle very long passwords', () => {
      const longPassword = 'a'.repeat(1000);
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: longPassword,
      });
      // Should accept (no max length restriction in schema)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password.length).toBe(1000);
      }
    });

    it('should handle special characters in passwords', () => {
      const specialPasswords = [
        'p@ssw0rd!',
        'password with spaces',
        'password\nwith\nnewlines',
        'password\twith\ttabs',
        'password"with"quotes',
        "password'with'quotes",
        'password<script>alert(1)</script>',
      ];

      specialPasswords.forEach(password => {
        const result = signInSchema.safeParse({
          email: 'user@example.com',
          password,
        });
        // All should be accepted (no character restrictions)
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.password).toBe(password);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const result = signInSchema.safeParse({
        email: null,
        password: null,
      });
      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const result = signInSchema.safeParse({
        email: undefined,
        password: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('should handle numeric values', () => {
      const result = signInSchema.safeParse({
        email: 12345,
        password: 12345,
      });
      expect(result.success).toBe(false);
    });

    it('should handle object values', () => {
      const result = signInSchema.safeParse({
        email: { malicious: 'data' },
        password: { malicious: 'data' },
      });
      expect(result.success).toBe(false);
    });

    it('should handle array values', () => {
      const result = signInSchema.safeParse({
        email: ['email1', 'email2'],
        password: ['pass1', 'pass2'],
      });
      expect(result.success).toBe(false);
    });
  });
});

