# CLAUDE.md — Maison & Déco Affiliation

This file describes the codebase structure, conventions, and development workflows for AI assistants working on this project.

## Project Overview

**maison-deco-affiliation** is a French-language Amazon affiliate site for home decor, built with Astro (SSG). The author, Issam, reviews and recommends home & decor products from Amazon.fr.

- **Live URL**: https://maison-deco-issam.netlify.app
- **Affiliate tag**: `issamdeco-21`
- **Deployment**: Netlify (static site)
- **Language**: All content is in **French**

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Astro](https://astro.build) | v5 | SSG framework (`.astro` components + content collections) |
| Tailwind CSS | v3 | Utility-first styling |
| @tailwindcss/typography | latest | Prose styles for blog content |
| TypeScript | strict | Type safety (Astro strict config) |
| @astrojs/sitemap | latest | Auto-generated sitemap (French locale) |
| @astrojs/rss | latest | RSS feed at `/rss.xml` |
| pdfkit | latest | Ebook PDF generation (`scripts/generate-ebook.mjs`) |
| Remotion | v4 | UGC video generation (`scripts/ugc/`) |
| Netlify | — | Hosting + affiliate short-link redirects |

---

## Development Commands

```bash
npm run dev      # Dev server at http://localhost:4321
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

No test runner is configured. Build must succeed without TypeScript errors.

---

## Directory Structure

```
/
├── astro.config.mjs          # Astro config: site URL, integrations, image domains
├── netlify.toml              # Netlify build config + affiliate redirect rules
├── tailwind.config.mjs       # Custom color palette + font families
├── tsconfig.json             # TypeScript strict config + path aliases
├── package.json
│
├── public/                   # Static assets (served as-is)
│   ├── favicon.svg
│   ├── robots.txt
│   ├── downloads/            # Downloadable PDFs (ebook)
│   └── ugc-videos/           # UGC video files (.mp4)
│
├── scripts/                  # Standalone utility scripts (not part of Astro build)
│   ├── fetch-product-images.mjs   # Fetch/cache Amazon product images
│   ├── generate-ebook.mjs         # Generate PDF ebook with pdfkit
│   └── ugc/                       # TikTok/YouTube content tools
│       ├── generate-video.mjs     # Remotion video generation
│       ├── content-calendar.json
│       ├── video-scripts.json
│       ├── video-storyboards.json
│       └── GUIDE-FILMING.md
│
└── src/
    ├── content.config.ts     # Astro content collection schemas (products + blog)
    │
    ├── content/
    │   ├── blog/             # Blog posts as Markdown (.md)
    │   └── products/         # Product data as JSON (.json)
    │
    ├── data/
    │   ├── categories.json   # 11 product/blog categories with slugs + emojis
    │   ├── navigation.json   # Main nav links
    │   └── site-config.json  # Global config: site name, URL, author, social links
    │
    ├── layouts/
    │   ├── BaseLayout.astro       # Root HTML shell (Header + Footer + SEO)
    │   ├── BlogPostLayout.astro   # Blog article layout
    │   ├── LinkInBioLayout.astro  # Link-in-bio page layout
    │   └── ProductLayout.astro   # Product detail page layout
    │
    ├── components/
    │   ├── blog/
    │   │   ├── BlogCard.astro      # Blog post preview card
    │   │   └── RelatedPosts.astro  # Related posts widget
    │   ├── common/
    │   │   ├── Breadcrumbs.astro   # Breadcrumb trail
    │   │   ├── Footer.astro
    │   │   ├── Header.astro
    │   │   ├── SEOHead.astro       # Meta tags (OG, Twitter, canonical)
    │   │   └── SchemaMarkup.astro  # JSON-LD injection
    │   ├── linkinbio/
    │   │   ├── LinkCard.astro
    │   │   └── SocialIcons.astro
    │   └── product/
    │       ├── AmazonButton.astro      # CTA button linking to Amazon
    │       ├── ComparisonTable.astro   # Product comparison table
    │       ├── ProductCard.astro       # Product preview card
    │       ├── ProductGrid.astro       # Grid wrapper
    │       ├── ProsCons.astro          # Pros/cons list
    │       └── RatingStars.astro       # Star rating display
    │
    ├── pages/
    │   ├── index.astro                          # Homepage
    │   ├── 404.astro
    │   ├── a-propos.astro                       # About page
    │   ├── ebooks.astro                         # Ebook sales page
    │   ├── filming-guide.astro                  # UGC filming guide
    │   ├── liens.astro                          # Link-in-bio (excluded from sitemap)
    │   ├── ugc-hub.astro                        # UGC content hub
    │   ├── rss.xml.ts                           # RSS feed
    │   ├── google89e368df2e2224f0.html.ts        # Google Search Console verification
    │   ├── blog/
    │   │   ├── index.astro                      # Blog listing
    │   │   ├── [...slug].astro                  # Dynamic blog post pages
    │   │   └── categorie/[categorie].astro       # Blog by category
    │   └── produits/
    │       ├── index.astro                      # Product catalog (with ?cat= filter)
    │       └── [...slug].astro                  # Dynamic product detail pages
    │
    ├── styles/
    │   └── global.css          # Tailwind directives + custom component classes
    │
    └── utils/
        ├── affiliate.ts        # Amazon affiliate URL builders
        ├── formatting.ts       # Price/date/slug formatting helpers
        └── seo.ts              # JSON-LD schema generators + SEO utilities
```

---

## Content Collections

Defined in `src/content.config.ts`.

### Products (`src/content/products/*.json`)

Each product is a `.json` file. Required fields:

```typescript
{
  name: string,                          // Display name
  slug: string,                          // URL slug (kebab-case)
  shortDescription: string,              // Max 200 chars — used in cards + SEO
  fullDescription: string,               // Full review text for product page
  category: string,                      // Must match a slug from categories.json
  amazonAsin: string,                    // Amazon product ASIN (e.g. "B08KH2JV3N")
  affiliateTag: string,                  // Default: "issamdeco-21"
  price: {
    current: number,
    currency: string,                    // Default: "EUR"
    lastChecked: string,                 // Date string e.g. "2026-02-22"
  },
  rating: {
    score: number,                       // 0–5
    count: number,                       // Number of reviews
  },
  image: string,                         // Amazon CDN URL (m.media-amazon.com)
  pros: string[],
  cons: string[],
  specifications: { label: string, value: string }[],
  featured: boolean,                     // Show in "Coups de cœur" section
  bestseller: boolean,                   // Show bestseller badge
  inStock: boolean,
  youtubeVideoId?: string,               // Optional YouTube video embed
}
```

Example filename: `src/content/products/organisateur-tiroir-bambou.json`

### Blog Posts (`src/content/blog/*.md`)

Markdown files with YAML frontmatter. Required fields:

```yaml
---
title: "Post title"
description: "Max 160 chars for SEO"
pubDate: "2026-02-22"
author: "Issam"                   # Optional, defaults to "Issam"
cover: "https://..."              # Cover image URL
coverAlt: "Alt text"
category: salon                   # One of: salon | chambre | cuisine | salle-de-bain | jardin | decoration | rangement | eclairage
tags: ["tag1", "tag2"]
type: guide                       # One of: top-10 | comparatif | review | guide | astuce
affiliateProducts: ["slug-1"]     # Optional: product slugs referenced in post
draft: false                      # true = not published
---
```

Posts with `draft: true` are filtered out at build time.

---

## Routes

| Path | Source | Notes |
|------|--------|-------|
| `/` | `pages/index.astro` | Homepage |
| `/produits/` | `pages/produits/index.astro` | Catalog; `?cat=<slug>` filters by category |
| `/produits/[slug]/` | `pages/produits/[...slug].astro` | Product detail |
| `/blog/` | `pages/blog/index.astro` | Blog listing |
| `/blog/[slug]/` | `pages/blog/[...slug].astro` | Blog post |
| `/blog/categorie/[cat]/` | `pages/blog/categorie/[categorie].astro` | Blog by category |
| `/liens/` | `pages/liens.astro` | Link-in-bio (excluded from sitemap) |
| `/a-propos/` | `pages/a-propos.astro` | About page |
| `/ebooks/` | `pages/ebooks.astro` | Ebook sales page |
| `/ugc-hub/` | `pages/ugc-hub.astro` | UGC content hub |
| `/filming-guide/` | `pages/filming-guide.astro` | Filming guide |
| `/rss.xml` | `pages/rss.xml.ts` | RSS feed |
| `/amazon/:asin` | `netlify.toml` redirect | Short affiliate link → Amazon.fr |

---

## Utility Functions

### `src/utils/affiliate.ts`

```typescript
buildAmazonLink(asin, tag?)          // Full Amazon.fr URL with affiliate tag
buildAmazonSearchLink(keywords, tag?) // Amazon search with affiliate tag
affiliateLinkAttributes()            // Returns 'rel="nofollow sponsored noopener" target="_blank"'
buildShortAffiliateUrl(asin)         // Returns '/amazon/${asin}' (Netlify redirect)
```

**Always** use `affiliateLinkAttributes()` on all Amazon outbound links.

### `src/utils/seo.ts`

```typescript
fullTitle(title)         // "Title | Maison & Déco by Issam"
articleSchema(props)     // JSON-LD Article schema
productSchema(props)     // JSON-LD Product schema
breadcrumbSchema(items)  // JSON-LD BreadcrumbList schema
websiteSchema()          // JSON-LD WebSite schema
```

### `src/utils/formatting.ts`

```typescript
formatPrice(price, currency?)    // "24,99 €" (fr-FR locale)
formatDate(date)                 // "22 février 2026"
formatDateShort(date)            // Short French date
slugify(text)                    // URL-safe slug (removes French accents)
truncate(text, maxLength?)       // Truncate with "..."
ratingToStars(rating)            // ★★★★☆ style string
```

---

## Design System

### Custom Color Palette (Tailwind)

```
primary (warm orange/brown): primary-50 to primary-950
accent  (muted green):       accent-50 to accent-950
warm    (beige/taupe):       warm-50 to warm-950
```

### Typography

- **font-sans**: Inter (body text)
- **font-serif**: Playfair Display (h1–h4, section headings)

### Reusable CSS Classes (defined in `src/styles/global.css`)

```css
.container-custom  /* max-w-7xl centered with responsive horizontal padding */
.btn-primary       /* Orange primary CTA button */
.btn-amazon        /* Amber Amazon buy button */
.card              /* White rounded card with subtle shadow */
.badge             /* Rounded pill tag */
.badge-category    /* Primary-colored category badge */
.badge-type        /* Accent-colored content type badge */
.prose-custom      /* Tailwind prose styles for article bodies */
```

### TypeScript Path Aliases

```
@/*            → src/*
@components/*  → src/components/*
@layouts/*     → src/layouts/*
@utils/*       → src/utils/*
@data/*        → src/data/*
```

---

## Affiliate Conventions

1. **Affiliate tag**: Always `issamdeco-21` (defined in `src/data/site-config.json` and as the default in `buildAmazonLink`)
2. **Link attributes**: All Amazon links must include `rel="nofollow sponsored noopener" target="_blank"` — use `affiliateLinkAttributes()` from `affiliate.ts`
3. **Short links**: Use `/amazon/ASIN` format for social media/emails (resolved by Netlify redirect)
4. **Price disclaimer**: Always add a note that prices may vary — the standard text is: "Prix constaté le [date] - peut varier sur Amazon"
5. **Amazon image domains**: Whitelisted in `astro.config.mjs`: `images-na.ssl-images-amazon.com` and `m.media-amazon.com`

---

## SEO Conventions

1. Blog post `description` must be **max 160 characters**
2. Product `shortDescription` must be **max 200 characters**
3. Every page gets JSON-LD schema via `SchemaMarkup.astro` — products get `productSchema`, articles get `articleSchema`
4. Breadcrumbs are rendered on product and blog pages using `breadcrumbSchema`
5. The `/liens/` (link-in-bio) page is excluded from the sitemap via filter in `astro.config.mjs`
6. Sitemap is auto-generated at build time by `@astrojs/sitemap` with `fr-FR` locale

---

## Adding New Content

### Adding a Product

1. Create `src/content/products/<slug>.json` following the product schema above
2. Set `amazonAsin` to the product's ASIN
3. Use an Amazon CDN image URL for `image` (from `m.media-amazon.com`)
4. Set `affiliateTag` to `"issamdeco-21"`
5. The product page is automatically available at `/produits/<slug>/`

### Adding a Blog Post

1. Create `src/content/blog/<slug>.md` with required frontmatter
2. Set `draft: false` to publish, `draft: true` to keep unpublished
3. Use `category` values matching those in `src/data/categories.json`
4. Affiliate links in content should use `https://www.amazon.fr/dp/ASIN/?tag=issamdeco-21`
5. The blog post is automatically available at `/blog/<slug>/`

---

## Deployment

- **Platform**: Netlify
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: Default Netlify Node (see `netlify.toml`)

The `netlify.toml` configures two redirect rules:
1. `/amazon/:asin` → `https://www.amazon.fr/dp/:asin?tag=issamdeco-21&linkCode=ll1&language=fr_FR` (301, force)
2. `/*` → `/:splat` (200) — trailing slash handling

---

## Site Configuration

Central config lives in `src/data/site-config.json`:

```json
{
  "siteName": "Maison & Déco by Issam",
  "siteUrl": "https://maison-deco-issam.netlify.app",
  "affiliateTag": "issamdeco-21",
  "author": { "name": "Issam", "location": "Marrakech, Maroc" },
  "social": {
    "tiktok": "https://tiktok.com/@issam_deco",
    "youtube": "https://youtube.com/@issam_deco",
    "instagram": "https://instagram.com/issam_deco"
  },
  "locale": "fr_FR",
  "currency": "EUR"
}
```

---

## Categories

Defined in `src/data/categories.json`. The 11 valid category slugs are:

`salon` · `chambre` · `cuisine` · `salle-de-bain` · `eclairage` · `miroirs` · `textiles` · `plantes-pots` · `rangement` · `decoration` · `jardin`

Blog posts use a subset: `salon` · `chambre` · `cuisine` · `salle-de-bain` · `jardin` · `decoration` · `rangement` · `eclairage`

---

## Scripts (Not Part of Build)

These are standalone Node.js scripts run manually:

| Script | Purpose |
|--------|---------|
| `scripts/fetch-product-images.mjs` | Fetch and cache Amazon product images locally |
| `scripts/generate-ebook.mjs` | Generate the PDF ebook using pdfkit |
| `scripts/ugc/generate-video.mjs` | Generate UGC videos using Remotion |

Run them with: `node scripts/<script>.mjs`

---

## Content Voice & Tone

- First-person, conversational French ("je teste", "mon avis", etc.)
- Honest and direct — no marketing fluff
- Target audience: French-speaking home decor enthusiasts on a budget
- Always include a personal perspective ("je recommande", "j'ai gardé ce produit")
