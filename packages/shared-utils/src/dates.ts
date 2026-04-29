export const formatDate = (date: Date | string, opts: Intl.DateTimeFormatOptions = {}): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
};

export const formatRelative = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHrs < 1) return 'Hace unos minutos';
  if (diffHrs < 24) return `Hace ${Math.floor(diffHrs)}h`;
  if (diffDays < 2) return 'Ayer';
  if (diffDays < 7) return `Hace ${Math.floor(diffDays)} días`;

  return formatDate(d);
};

export const getMesActual = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMesLabel = (mes: string): string => {
  const [year, month] = mes.split('-');
  const d = new Date(parseInt(year ?? '2024'), parseInt(month ?? '1') - 1, 1);
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};
