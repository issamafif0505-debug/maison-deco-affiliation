const DEFAULT_AFFILIATE_ID = 'issamaffil';

/**
 * Génère un HopLink ClickBank
 * Format : https://{affiliateId}.{vendor}.hop.clickbank.net/
 */
export function buildClickBankHopLink(
  vendor: string,
  affiliateId: string = DEFAULT_AFFILIATE_ID
): string {
  return `https://${affiliateId}.${vendor}.hop.clickbank.net/`;
}

/**
 * Génère l'URL courte pour les redirections Netlify
 * Format : /cb/{vendor}
 */
export function buildClickBankShortUrl(vendor: string): string {
  return `/cb/${vendor}`;
}

/**
 * Retourne les attributs HTML pour les liens affiliés ClickBank
 */
export function clickbankLinkAttributes(): string {
  return 'rel="nofollow sponsored noopener" target="_blank"';
}

export interface ClickBankProduct {
  title: string;
  vendor: string;
  description: string;
  emoji: string;
  commission: string;
  priceRange: string;
  badge?: string;
  color: 'primary' | 'accent' | 'warm' | 'emerald';
  highlights: string[];
}
