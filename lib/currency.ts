export type Currency = 'USD' | 'EUR';

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'Dollar américain (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
];

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'fr-FR',
};

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] || 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Sums across invoices/payments can span both currencies (a user may bill some
// clients in USD and others in EUR); adding the raw numbers together would be
// meaningless, so each currency present is formatted and shown separately.
export function formatCurrencyTotals(totals: Partial<Record<Currency, number>>): string {
  const parts = (Object.entries(totals) as [Currency, number][])
    .filter(([, amount]) => amount !== 0)
    .map(([currency, amount]) => formatCurrency(amount, currency));

  if (parts.length === 0) return formatCurrency(0, 'USD');
  return parts.join(' + ');
}
