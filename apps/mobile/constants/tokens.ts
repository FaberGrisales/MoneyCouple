export const MC_TOKENS = {
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVar: '#F5F5F7',
    border: '#EAEAEE',
    borderStrong: '#D8D8DE',
    text: '#0E0E10',
    textSec: '#6B7280',
    textTer: '#9CA3AF',
  },
  dark: {
    bg: '#08090B',
    surface: '#15171A',
    surfaceVar: '#1E2126',
    border: '#23262B',
    borderStrong: '#2E3138',
    text: '#FAFAFA',
    textSec: '#9BA1AB',
    textTer: '#6B7280',
  },
} as const;

export const MC_ACCENTS = {
  mint: { primary: '#00D9A3', dark: '#00B386' },
  violet: { primary: '#6C5CE7', dark: '#5849CC' },
  coral: { primary: '#FF6B6B', dark: '#E55555' },
  blue: { primary: '#0084FF', dark: '#006EE0' },
  amber: { primary: '#F59E0B', dark: '#D97706' },
} as const;

export const MC_DEFAULT_ACCENT = MC_ACCENTS.mint;

export const MC_CATS = {
  COMIDA: { name: 'Comida', color: '#FF6B6B', icon: 'coffee' },
  TRANSPORTE: { name: 'Transporte', color: '#4ECDC4', icon: 'car' },
  ENTRETENIMIENTO: { name: 'Entretenim.', color: '#FFB84D', icon: 'film' },
  SERVICIOS: { name: 'Servicios', color: '#7FD8C4', icon: 'zap' },
  COMPRAS: { name: 'Compras', color: '#C490E4', icon: 'shopping-bag' },
  SALUD: { name: 'Salud', color: '#FF8B94', icon: 'heart' },
  EDUCACION: { name: 'Educación', color: '#6C5CE7', icon: 'book' },
  VIAJES: { name: 'Viajes', color: '#00B8D4', icon: 'navigation' },
  HOGAR: { name: 'Hogar', color: '#45B7D1', icon: 'home' },
  MASCOTAS: { name: 'Mascotas', color: '#F9CA24', icon: 'star' },
  REGALOS: { name: 'Regalos', color: '#F0932B', icon: 'gift' },
  IMPUESTOS: { name: 'Impuestos', color: '#A29BFE', icon: 'percent' },
  OTROS: { name: 'Otros', color: '#B0BEC5', icon: 'more-horizontal' },
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;
