import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
// Formato de moneda colombiana
export function formatCurrency(amount: number): string {
  const roundedAmount = Math.round(amount);

  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedAmount);

  // Reemplazar espacios en blanco con un caracter de espacio
  return formatted.replace(/\u00A0/g, ' ');
}

// Formato de moneda colombiana compacto
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

// Calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Calcular balance
export function calculateBalance(
  movements: Array<{ type: 'INCOME' | 'EXPENSE'; amount: number }>
): number {
  return movements.reduce((balance, movement) => {
    return movement.type === 'INCOME'
      ? balance + movement.amount
      : balance - movement.amount;
  }, 0);
}

// Validación de correo electrónico
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validación de teléfono colombiano (OPCIONAL  )
export function validatePhone(phone: string): boolean {
  if (!phone.trim()) return true;
  const phoneRegex = /^(\+57|57)?\s*[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
}

// Paginación
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function generatePaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Validación de movimiento
export interface MovementInput {
  concept: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface SanitizedMovement {
  concept: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
}

export function sanitizeMovementData(
  input: MovementInput
): SanitizedMovement | null {
  try {
    // Validación de concepto
    if (!input.concept || input.concept.trim().length < 3) {
      return null;
    }

    // Validación de cantidad
    const amount =
      typeof input.amount === 'string'
        ? parseFloat(input.amount)
        : input.amount;
    if (isNaN(amount) || amount <= 0) {
      return null;
    }

    // Validación de tipo
    if (input.type !== 'INCOME' && input.type !== 'EXPENSE') {
      return null;
    }

    const date = new Date(input.date);
    if (isNaN(date.getTime())) {
      return null;
    }

    return {
      concept: input.concept.trim(),
      amount,
      type: input.type,
      date,
    };
  } catch (error) {
    return null;
  }
}

// Generación de CSV
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  headers: Array<{ key: keyof T; label: string }>
): string {
  const headerRow = headers.map((header) => header.label).join(',');
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header.key];
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() || '';
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}
