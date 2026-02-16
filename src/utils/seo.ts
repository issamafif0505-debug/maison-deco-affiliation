import siteConfig from '../data/site-config.json';

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  publishDate?: Date;
  canonicalUrl?: string;
  noindex?: boolean;
}

/**
 * Génère le titre complet avec le nom du site
 */
export function fullTitle(title: string): string {
  return `${title} | ${siteConfig.siteName}`;
}

/**
 * Génère le schema JSON-LD pour un article
 */
export function articleSchema(props: {
  title: string;
  description: string;
  image: string;
  publishDate: Date;
  updatedDate?: Date;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    image: props.image,
    datePublished: props.publishDate.toISOString(),
    dateModified: (props.updatedDate || props.publishDate).toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
  };
}

/**
 * Génère le schema JSON-LD pour un produit
 */
export function productSchema(props: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: props.name,
    description: props.description,
    image: props.image,
    offers: {
      '@type': 'Offer',
      price: props.price,
      priceCurrency: props.currency,
      availability: props.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: props.rating,
      reviewCount: props.ratingCount,
    },
  };
}

/**
 * Génère le schema JSON-LD pour le fil d'Ariane
 */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Génère le schema JSON-LD pour le site web
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    description: siteConfig.siteDescription,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
  };
}
