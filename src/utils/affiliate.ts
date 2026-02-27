const DEFAULT_TAG = 'issamdeco-21';
const AMAZON_BASE_URL = 'https://www.amazon.fr/dp/';

/**
 * Génère un lien affilié Amazon à partir d'un ASIN
 */
export function buildAmazonLink(asin: string, tag: string = DEFAULT_TAG): string {
  return `${AMAZON_BASE_URL}${asin}?tag=${tag}&linkCode=ll1&language=fr_FR`;
}

/**
 * Génère un lien de recherche affilié Amazon
 */
export function buildAmazonSearchLink(keywords: string, tag: string = DEFAULT_TAG): string {
  const encoded = encodeURIComponent(keywords);
  return `https://www.amazon.fr/s?k=${encoded}&tag=${tag}&linkCode=ll2`;
}

/**
 * Retourne les attributs HTML pour les liens affiliés
 */
export function affiliateLinkAttributes(): string {
  return 'rel="nofollow sponsored noopener" target="_blank"';
}

/**
 * Génère l'URL courte pour les redirections Netlify
 */
export function buildShortAffiliateUrl(asin: string): string {
  return `/amazon/${asin}`;
}

// ===== CLICKBANK =====
const CB_VENDOR_ID = 'rockfit'; // Vendor ID du produit escalade

// Génère un hoplink Clickbank
export function buildClickbankLink(affiliateId: string = 'VOTRE_ID_CB', vendorId: string = CB_VENDOR_ID): string {
  return `https://${affiliateId}.${vendorId}.hop.clickbank.net/`;
}

// Attributs HTML pour liens Clickbank
export function clickbankLinkAttributes(): string {
  return 'rel="nofollow sponsored noopener" target="_blank"';
}
