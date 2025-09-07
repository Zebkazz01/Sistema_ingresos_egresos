import {
  formatCurrency,
  formatCompactCurrency,
  calculatePercentageChange,
  calculateBalance,
  validateEmail,
  validatePhone,
  generatePaginationInfo,
  sanitizeMovementData,
  generateCSV,
} from '@/lib/utils';

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('should format Colombian Pesos correctly', () => {
      expect(formatCurrency(1000)).toBe('$ 1.000');
      expect(formatCurrency(1500000)).toBe('$ 1.500.000');
      expect(formatCurrency(0)).toBe('$ 0');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-500)).toBe('-$ 500');
    });
    // Redondear a pesos colombianos
    it('should handle decimal values with Colombian formatting', () => {
      expect(formatCurrency(1000.5)).toBe('$ 1.001');
      expect(formatCurrency(999.99)).toBe('$ 1.000');
      expect(formatCurrency(1000.49)).toBe('$ 1.000');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format values in millions', () => {
      expect(formatCompactCurrency(1000000)).toBe('$1.0M');
      expect(formatCompactCurrency(2500000)).toBe('$2.5M');
    });

    it('should format values in thousands', () => {
      expect(formatCompactCurrency(1000)).toBe('$1K');
      expect(formatCompactCurrency(15000)).toBe('$15K');
    });

    it('should format small values as is', () => {
      expect(formatCompactCurrency(500)).toBe('$500');
      expect(formatCompactCurrency(0)).toBe('$0');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
      expect(calculatePercentageChange(200, 100)).toBe(100);
    });

    it('should calculate negative percentage change', () => {
      expect(calculatePercentageChange(80, 100)).toBe(-20);
      expect(calculatePercentageChange(50, 100)).toBe(-50);
    });

    it('should handle zero previous value', () => {
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });

    // Cambiar el comportamiento para manejar valores negativos
    it('should handle negative previous values', () => {
      expect(calculatePercentageChange(50, -100)).toBe(150);
      expect(calculatePercentageChange(-50, -100)).toBe(50);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate balance correctly with mixed movements', () => {
      const movements = [
        { type: 'INCOME' as const, amount: 1000 },
        { type: 'EXPENSE' as const, amount: 500 },
        { type: 'INCOME' as const, amount: 200 },
      ];
      expect(calculateBalance(movements)).toBe(700);
    });

    it('should handle only income', () => {
      const movements = [
        { type: 'INCOME' as const, amount: 1000 },
        { type: 'INCOME' as const, amount: 500 },
      ];
      expect(calculateBalance(movements)).toBe(1500);
    });

    it('should handle only expenses', () => {
      const movements = [
        { type: 'EXPENSE' as const, amount: 300 },
        { type: 'EXPENSE' as const, amount: 200 },
      ];
      expect(calculateBalance(movements)).toBe(-500);
    });

    it('should handle empty movements array', () => {
      expect(calculateBalance([])).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+123@domain.co')).toBe(true);
      expect(validateEmail('admin@company.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate Colombian phone numbers', () => {
      expect(validatePhone('3101234567')).toBe(true);
      expect(validatePhone('573101234567')).toBe(true);
      expect(validatePhone('+573101234567')).toBe(true);
      expect(validatePhone('310 123 4567')).toBe(true);
      expect(validatePhone('310-123-4567')).toBe(true);
    });

    it('should accept empty phone (optional field)', () => {
      expect(validatePhone('')).toBe(true);
      expect(validatePhone('   ')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('123456')).toBe(false);
      expect(validatePhone('0123456789')).toBe(false);
      expect(validatePhone('abcdefghij')).toBe(false);
    });
  });

  describe('generatePaginationInfo', () => {
    it('should generate correct pagination for first page', () => {
      const pagination = generatePaginationInfo(1, 10, 25);
      expect(pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should generate correct pagination for middle page', () => {
      const pagination = generatePaginationInfo(2, 10, 25);
      expect(pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should generate correct pagination for last page', () => {
      const pagination = generatePaginationInfo(3, 10, 25);
      expect(pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should handle single page', () => {
      const pagination = generatePaginationInfo(1, 10, 5);
      expect(pagination).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('sanitizeMovementData', () => {
    it('should sanitize valid movement data', () => {
      const input = {
        concept: '  Test Movement  ',
        amount: '1000.50',
        type: 'INCOME' as const,
        date: '2024-01-15T10:30:00',
      };

      const result = sanitizeMovementData(input);
      expect(result).toEqual({
        concept: 'Test Movement',
        amount: 1000.5,
        type: 'INCOME',
        date: new Date('2024-01-15T10:30:00'),
      });
    });

    it('should handle numeric amount input', () => {
      const input = {
        concept: 'Test Movement',
        amount: 500,
        type: 'EXPENSE' as const,
        date: '2024-01-15',
      };

      const result = sanitizeMovementData(input);
      expect(result?.amount).toBe(500);
    });

    it('should reject invalid concept', () => {
      const input = {
        concept: '  ',
        amount: 1000,
        type: 'INCOME' as const,
        date: '2024-01-15',
      };

      expect(sanitizeMovementData(input)).toBe(null);
    });

    it('should reject invalid amount', () => {
      const input = {
        concept: 'Test Movement',
        amount: 0,
        type: 'INCOME' as const,
        date: '2024-01-15',
      };

      expect(sanitizeMovementData(input)).toBe(null);
    });

    it('should reject invalid type', () => {
      const input = {
        concept: 'Test Movement',
        amount: 1000,
        type: 'INVALID' as any,
        date: '2024-01-15',
      };

      expect(sanitizeMovementData(input)).toBe(null);
    });

    it('should reject invalid date', () => {
      const input = {
        concept: 'Test Movement',
        amount: 1000,
        type: 'INCOME' as const,
        date: 'invalid-date',
      };

      expect(sanitizeMovementData(input)).toBe(null);
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV from data array', () => {
      const data = [
        { name: 'John Doe', age: 30, email: 'john@example.com' },
        { name: 'Jane Smith', age: 25, email: 'jane@example.com' },
      ];

      const headers = [
        { key: 'name' as keyof (typeof data)[0], label: 'Name' },
        { key: 'age' as keyof (typeof data)[0], label: 'Age' },
        { key: 'email' as keyof (typeof data)[0], label: 'Email' },
      ];

      const csv = generateCSV(data, headers);
      const expected =
        'Name,Age,Email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com';

      expect(csv).toBe(expected);
    });

    it('should escape commas and quotes in values', () => {
      const data = [{ name: 'Doe, John', description: 'Software "Developer"' }];

      const headers = [
        { key: 'name' as keyof (typeof data)[0], label: 'Name' },
        { key: 'description' as keyof (typeof data)[0], label: 'Description' },
      ];

      const csv = generateCSV(data, headers);
      const expected = 'Name,Description\n"Doe, John","Software ""Developer"""';

      expect(csv).toBe(expected);
    });

    it('should handle empty data array', () => {
      const data: any[] = [];
      const headers: any[] = [];

      const csv = generateCSV(data, headers);
      expect(csv).toBe('');
    });
  });
});
