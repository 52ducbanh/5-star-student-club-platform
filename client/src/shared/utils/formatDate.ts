/**
 * Format an ISO date/time string to Vietnamese display format: DD.MM.YYYY
 */
export function formatDisplayDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format an ISO date/time string to time display format: HH:MM
 */
export function formatDisplayTime(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hour}:${min}`;
}

/**
 * Format start and end times into a range: HH:MM – HH:MM (or single time if end is missing)
 */
export function formatTimeRange(startIso: string, endIso?: string | null): string {
  const start = formatDisplayTime(startIso);
  if (!endIso) return start;
  const end = formatDisplayTime(endIso);
  return end ? `${start} – ${end}` : start;
}
