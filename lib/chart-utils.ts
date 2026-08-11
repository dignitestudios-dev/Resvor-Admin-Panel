import type { TimeSeriesInterval } from '@/types/dashboard';

const WEEKDAY_NAMES: Record<string, string> = {
  mon: 'Mon',
  monday: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  wed: 'Wed',
  wednesday: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  sun: 'Sun',
  sunday: 'Sun',
};

/**
 * Formats a period string into an appropriate axis tick label based on the interval.
 * For daily interval, formats dates (e.g. "2026-08-11", "01", etc.) into weekdays (Mon, Tue, etc.).
 */
export function formatChartPeriod(
  period: string | number | undefined | null,
  interval: TimeSeriesInterval = 'daily'
): string {
  if (period === undefined || period === null) return '';
  const trimmed = String(period).trim();
  if (!trimmed) return '';

  if (interval === 'daily') {
    // 1. Direct weekday name or prefix match
    const lower = trimmed.toLowerCase();
    if (WEEKDAY_NAMES[lower]) {
      return WEEKDAY_NAMES[lower];
    }
    const weekdayPrefixMatch = trimmed.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i);
    if (weekdayPrefixMatch) {
      const match = weekdayPrefixMatch[1];
      return match.charAt(0).toUpperCase() + match.slice(1, 3).toLowerCase();
    }

    // 2. Format YYYY-MM-DD or YYYY/MM/DD
    const isoDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoDateMatch) {
      const year = parseInt(isoDateMatch[1], 10);
      const month = parseInt(isoDateMatch[2], 10) - 1;
      const day = parseInt(isoDateMatch[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
    }

    // 3. Format DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
    }

    // 4. ISO Date string with time or standard date string
    if (trimmed.includes('T') || trimmed.includes('Z') || trimmed.includes(':')) {
      const parsedDate = new Date(trimmed);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
      }
    }

    // 5. Day number of month (e.g. "01", "02", ... "31", "1", "2")
    if (/^\d{1,2}$/.test(trimmed)) {
      const dayNum = parseInt(trimmed, 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), dayNum);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
      }
    }

    return trimmed;
  }

  if (interval === 'weekly') {
    // If format is like "2026-W32" -> "W32"
    if (/W\d+/i.test(trimmed)) {
      const match = trimmed.match(/W\d+/i);
      if (match) return match[0].toUpperCase();
    }
    // If it's a date string (e.g., start of week)
    const isoDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoDateMatch) {
      const year = parseInt(isoDateMatch[1], 10);
      const month = parseInt(isoDateMatch[2], 10) - 1;
      const day = parseInt(isoDateMatch[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    if (/^\d+$/.test(trimmed)) {
      return `W${trimmed}`;
    }
    return trimmed;
  }

  if (interval === 'monthly') {
    // Format YYYY-MM or YYYY-MM-DD
    const monthMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})/);
    if (monthMatch) {
      const month = parseInt(monthMatch[2], 10) - 1;
      const date = new Date(2000, month, 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
    // Month number "01" - "12" or "1" - "12"
    if (/^\d{1,2}$/.test(trimmed)) {
      const monthNum = parseInt(trimmed, 10);
      if (monthNum >= 1 && monthNum <= 12) {
        const date = new Date(2000, monthNum - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    }
    return trimmed;
  }

  return trimmed;
}

/**
 * Formats a period string into an informative tooltip label.
 */
export function formatChartTooltipLabel(
  period: string | number | undefined | null,
  interval: TimeSeriesInterval = 'daily'
): string {
  if (period === undefined || period === null) return '';
  const trimmed = String(period).trim();
  if (!trimmed) return '';

  if (interval === 'daily') {
    const isoDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoDateMatch) {
      const year = parseInt(isoDateMatch[1], 10);
      const month = parseInt(isoDateMatch[2], 10) - 1;
      const day = parseInt(isoDateMatch[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    const weekday = formatChartPeriod(trimmed, 'daily');
    if (weekday && weekday !== trimmed) {
      return `${weekday} (${trimmed})`;
    }
    return weekday || trimmed;
  }

  if (interval === 'weekly') {
    return `Week: ${formatChartPeriod(trimmed, 'weekly')}`;
  }

  if (interval === 'monthly') {
    const monthMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})/);
    if (monthMatch) {
      const year = parseInt(monthMatch[1], 10);
      const month = parseInt(monthMatch[2], 10) - 1;
      const date = new Date(year, month, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `Month: ${formatChartPeriod(trimmed, 'monthly')}`;
  }

  return `Period: ${trimmed}`;
}
