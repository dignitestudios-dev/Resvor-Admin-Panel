import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount?: number | null,
  currency: string = 'USD'
): string {
  if (amount == null) return '—';
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return '—';

  try {
    const curr = currency ? currency.toUpperCase() : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch {
    return `$${numAmount.toFixed(2)}`;
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

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}

export async function extractBlobErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Export failed'
): Promise<string> {
  const err = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  if (err?.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      const parsed = JSON.parse(text);
      if (parsed?.message && typeof parsed.message === 'string') {
        return parsed.message;
      }
    } catch {
      // not a json string
    }
  } else if (
    typeof err?.response?.data === 'object' &&
    err?.response?.data !== null &&
    'message' in err.response.data &&
    typeof (err.response.data as { message: unknown }).message === 'string'
  ) {
    return (err.response.data as { message: string }).message;
  } else if (err?.message) {
    return err.message;
  }
  return fallbackMessage;
}
