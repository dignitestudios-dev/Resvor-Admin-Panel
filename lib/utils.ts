import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amountInCents?: number | null,
  currency: string = 'USD'
): string {
  if (amountInCents == null) return '—';
  const amountInDollars = Number(amountInCents) / 100;
  if (isNaN(amountInDollars)) return '—';

  try {
    const curr = currency ? currency.toUpperCase() : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInDollars);
  } catch {
    return `$${amountInDollars.toFixed(2)}`;
  }
}

export function stripHtml(html?: string): string {
  if (!html) return '—';
  return (
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim() || '—'
  );
}
