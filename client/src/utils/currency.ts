/**
 * Formats a number into Indian Rupee format (e.g. ₹5,00,000)
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Compact Indian currency representation (e.g. ₹5.00 Lakhs or ₹1.2 Cr)
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Days remaining between now and event date
 */
export function calculateDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const eventDate = new Date(dateStr);
  const now = new Date();
  // reset hours to midnight for date-only comparison
  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Safely calculates percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Number(((part / total) * 100).toFixed(1))));
}
