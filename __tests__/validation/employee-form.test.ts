import { describe, it, expect } from '@jest/globals';
import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Employee Form Validation Tests
 *
 * Tests the validation logic for the employee creation form
 * including phone numbers, emails, and text-only fields.
 */

describe('Employee Form Validation', () => {
  describe('Phone Number Validation', () => {
    it('should accept valid Mozambique phone number', () => {
      const phone = '+258841234567';
      expect(isValidPhoneNumber(phone)).toBe(true);
    });

    it('should accept valid Portugal phone number', () => {
      const phone = '+351912345678';
      expect(isValidPhoneNumber(phone)).toBe(true);
    });

    it('should accept valid USA phone number', () => {
      const phone = '+14155552671';
      expect(isValidPhoneNumber(phone)).toBe(true);
    });

    it('should reject incomplete phone number', () => {
      const phone = '+258123';
      expect(isValidPhoneNumber(phone)).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const phone = 'notaphone';
      expect(isValidPhoneNumber(phone)).toBe(false);
    });

    it('should reject empty phone number', () => {
      const phone = '';
      expect(isValidPhoneNumber(phone)).toBe(false);
    });
  });

  describe('Email Domain Validation', () => {
    const validateCFMEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return false;

      const domain = email.split('@')[1]?.toLowerCase();
      return domain === 'cfm.com' || domain === 'cfm.co.mz';
    };

    it('should accept @cfm.com domain', () => {
      expect(validateCFMEmail('employee@cfm.com')).toBe(true);
    });

    it('should accept @cfm.co.mz domain', () => {
      expect(validateCFMEmail('employee@cfm.co.mz')).toBe(true);
    });

    it('should reject @gmail.com domain', () => {
      expect(validateCFMEmail('employee@gmail.com')).toBe(false);
    });

    it('should reject invalid email format', () => {
      expect(validateCFMEmail('notanemail')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(validateCFMEmail('EMPLOYEE@CFM.COM')).toBe(true);
      expect(validateCFMEmail('employee@CFM.CO.MZ')).toBe(true);
    });
  });

  describe('Text-Only Field Validation', () => {
    const validateTextOnly = (value: string): boolean => {
      return /^[a-zA-Z\s]+$/.test(value);
    };

    it('should accept letters only', () => {
      expect(validateTextOnly('John')).toBe(true);
      expect(validateTextOnly('Mary Jane')).toBe(true);
    });

    it('should reject numbers', () => {
      expect(validateTextOnly('John123')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(validateTextOnly('John@Doe')).toBe(false);
      expect(validateTextOnly('John.Doe')).toBe(false);
    });

    it('should accept spaces', () => {
      expect(validateTextOnly('John Doe Smith')).toBe(true);
    });
  });
});
