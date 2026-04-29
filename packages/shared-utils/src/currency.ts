export const formatCOP = (amount: number, opts: { full?: boolean } = {}): string => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (opts.full) {
    return sign + '$' + abs.toLocaleString('es-CO');
  }

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return sign + '$' + val.toFixed(abs >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
  }

  if (abs >= 1_000) {
    return sign + '$' + Math.round(abs / 1_000) + 'K';
  }

  return sign + '$' + abs;
};

export const formatCOPFull = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  return sign + '$' + Math.abs(amount).toLocaleString('es-CO');
};

export const parseCOP = (str: string): number => {
  return parseInt(str.replace(/[^0-9-]/g, ''), 10) || 0;
};

export const CATEGORY_COLORS: Record<string, string> = {
  COMIDA: '#FF6B6B',
  TRANSPORTE: '#4ECDC4',
  ENTRETENIMIENTO: '#FFB84D',
  SERVICIOS: '#7FD8C4',
  COMPRAS: '#C490E4',
  SALUD: '#FF8B94',
  EDUCACION: '#6C5CE7',
  VIAJES: '#00B8D4',
  HOGAR: '#45B7D1',
  MASCOTAS: '#F9CA24',
  REGALOS: '#F0932B',
  IMPUESTOS: '#A29BFE',
  OTROS: '#B0BEC5',
};
