import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

export function formatShortDate(
  date: Date | string | number | null | undefined,
  localeStr: string = 'th',
): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (localeStr === 'th') {
    const year = d.getFullYear() + 543;
    const formattedWithoutYear = format(d, 'dd MMM', { locale: th });
    return `${formattedWithoutYear} ${year}`;
  } else {
    return format(d, 'dd MMM yyyy', { locale: enUS });
  }
}
export function formatDate(
  date: number | string | Date,
  time?: boolean,
): string {
  try {
    return format(new Date(date), time ? 'dd-MMM-yyyy HH:mm' : 'dd-MMM-yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function formatDateByLocale(
  date: number | string | Date | null | undefined,
  locale: string = 'en',
): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const localeCode = locale === 'th' ? 'th-TH' : 'en-US';
    return d.toLocaleDateString(localeCode, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function formatThaiDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear() + 543;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

export function parseThaiDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parts = value.split('/');
  if (parts.length !== 3) return undefined;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

  // Adjust Buddhist Year if detected (assuming > 2400 is BE)
  if (year > 2300) year -= 543;

  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/**
 * Convert a Date to a local date-only string "YYYY-MM-DD"
 * to avoid timezone shift when sending to the backend.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
