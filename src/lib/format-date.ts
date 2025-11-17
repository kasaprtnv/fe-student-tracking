import { format } from 'date-fns';

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
