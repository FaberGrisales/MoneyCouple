export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidCOP = (amount: number): boolean =>
  Number.isFinite(amount) && amount >= 0 && amount <= 999_999_999_999;

export const isValidPercentage = (pct: number): boolean =>
  Number.isFinite(pct) && pct >= 0 && pct <= 100;

export const sanitizeText = (str: string): string => str.trim().replace(/[<>]/g, '');
