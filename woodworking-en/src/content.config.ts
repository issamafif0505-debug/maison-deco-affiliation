import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
    category: z.string(),
    clickbankNickname: z.string(),
    clickbankId: z.string(),
    price: z.object({
      current: z.number(),
      currency: z.string(),
      lastChecked: z.string(),
    }),
    commission: z.object({
      percentage: z.number(),
      avgPerSale: z.number(),
      epc: z.number(),
      conversionRate: z.string().optional(),
    }),
    gravity: z.number(),
    rating: z.object({
      score: z.number(),
      count: z.number(),
    }),
    image: z.string(),
    heroIcon: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    specifications: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    featured: z.boolean(),
    bestseller: z.boolean(),
    badge: z.string().optional(),
    badgeColor: z.string().optional(),
    targetAudience: z.array(z.string()),
    keywords: z.array(z.string()),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    category: z.string(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { products, blog };
