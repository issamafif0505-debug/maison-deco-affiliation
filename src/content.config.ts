import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Issam'),
    cover: z.string(),
    coverAlt: z.string(),
    category: z.enum([
      'salon',
      'chambre',
      'cuisine',
      'salle-de-bain',
      'jardin',
      'decoration',
      'rangement',
      'eclairage',
    ]),
    tags: z.array(z.string()),
    type: z.enum(['top-10', 'comparatif', 'review', 'guide', 'astuce']),
    affiliateProducts: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    shortDescription: z.string().max(200),
    fullDescription: z.string(),
    category: z.string(),
    amazonAsin: z.string(),
    affiliateTag: z.string().default('issamdeco-21'),
    price: z.object({
      current: z.number(),
      currency: z.string().default('EUR'),
      lastChecked: z.string(),
    }),
    rating: z.object({
      score: z.number().min(0).max(5),
      count: z.number(),
    }),
    image: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    specifications: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
    featured: z.boolean().default(false),
    bestseller: z.boolean().default(false),
    inStock: z.boolean().default(true),
    youtubeVideoId: z.string().optional(),
  }),
});

export const collections = { blog, products };
