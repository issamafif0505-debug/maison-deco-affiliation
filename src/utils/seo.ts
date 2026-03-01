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

export function fullTitle(title: string): string {
  return `${title} | ${siteConfig.siteName}`;
}

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
      url: `${siteConfig.siteUrl}/a-propos/`,
      sameAs: [
        siteConfig.social.tiktok,
        siteConfig.social.youtube,
        siteConfig.social.instagram,
      ],
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: `${siteConfig.siteUrl}/a-propos/`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
    inLanguage: 'fr-FR',
  };
}

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
    url: props.url,
    offers: {
      '@type': 'Offer',
      price: props.price,
      priceCurrency: props.currency,
      availability: props.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Amazon.fr',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: props.rating,
      reviewCount: props.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: props.rating,
        bestRating: 5,
      },
      author: {
        '@type': 'Person',
        name: siteConfig.author.name,
      },
    },
  };
}

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

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    description: siteConfig.siteDescription,
    inLanguage: 'fr-FR',
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: `${siteConfig.siteUrl}/a-propos/`,
      sameAs: [
        siteConfig.social.tiktok,
        siteConfig.social.youtube,
        siteConfig.social.instagram,
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.siteUrl}/produits/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: `${siteConfig.siteUrl}/a-propos/`,
    description: siteConfig.author.bio,
    jobTitle: 'Testeur & Créateur de contenu déco',
    knowsAbout: ['Décoration intérieure', 'Produits Amazon', 'Home staging', 'Design d\'intérieur'],
    sameAs: [
      siteConfig.social.tiktok,
      siteConfig.social.youtube,
      siteConfig.social.instagram,
    ],
  };
}
