import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://maison-deco-issam.netlify.app',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/liens'),
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-FR' },
      },
    }),
    tailwind(),
  ],
  build: {
    format: 'directory',
  },
  image: {
    domains: ['images-na.ssl-images-amazon.com', 'm.media-amazon.com'],
  },
});
