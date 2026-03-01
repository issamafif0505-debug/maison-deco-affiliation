/**
 * Build a ClickBank affiliate link
 */
export function buildClickBankLink(clickbankNickname: string, affiliateId: string): string {
  return `https://${affiliateId}.${clickbankNickname}.hop.clickbank.net`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format large numbers
 */
export function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
