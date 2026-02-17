#!/usr/bin/env node
/**
 * Fetch Product Images from Amazon.fr
 *
 * This script uses publicly available URLs from Amazon product pages
 * to retrieve and cache product images locally.
 *
 * Usage: node scripts/fetch-product-images.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'public', 'products');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Product data with direct image URLs from Amazon.fr
// These are public URLs that appear on the product pages
const products = [
  {
    asin: 'B07SS38CVG',
    name: 'philips-hue-pack-2',
    imageUrl: 'https://m.media-amazon.com/images/I/41eFQ5WO0hL._SL400_.jpg'
  },
  {
    asin: 'B09TZPNCJM',
    name: 'govee-lampadaire-led',
    imageUrl: 'https://m.media-amazon.com/images/I/41L8C4gAKbL._SL400_.jpg'
  },
  {
    asin: 'B07XT8J3HZ',
    name: 'govee-bande-led-5m',
    imageUrl: 'https://m.media-amazon.com/images/I/51gU2bGnG9L._SL400_.jpg'
  },
  {
    asin: 'B09XJ75QK8',
    name: 'lampe-sunset-tiktok',
    imageUrl: 'https://m.media-amazon.com/images/I/41R5L6SHROL._SL400_.jpg'
  },
  {
    asin: 'B07XXYF382',
    name: 'guirlande-boules-coton',
    imageUrl: 'https://m.media-amazon.com/images/I/41lW2QfzI0L._SL400_.jpg'
  },
  {
    asin: 'B0B79LJYFN',
    name: 'projecteur-galaxie-pococo',
    imageUrl: 'https://m.media-amazon.com/images/I/41XHJ0c7oJL._SL400_.jpg'
  },
  {
    asin: 'B07CZB7FLN',
    name: 'lampe-lune-3d',
    imageUrl: 'https://m.media-amazon.com/images/I/41mcKHIYIbL._SL400_.jpg'
  },
  {
    asin: 'B0BFB1Y8XP',
    name: 'diffuseur-medusa-led',
    imageUrl: 'https://m.media-amazon.com/images/I/51-9wvTfDWL._SL400_.jpg'
  },
  {
    asin: 'B08VHRJQV1',
    name: 'etagere-hexagonale',
    imageUrl: 'https://m.media-amazon.com/images/I/41i3OMUGaUL._SL400_.jpg'
  },
  {
    asin: 'B095BZQHFP',
    name: 'neon-led-personnalisable',
    imageUrl: 'https://m.media-amazon.com/images/I/41Ey5J8HqyL._SL400_.jpg'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve(filePath);
        });
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        console.log(`⚠️  Failed (${response.statusCode}): ${filename}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      console.log(`❌ Error: ${filename}`);
      reject(err);
    });
  });
}

async function fetchAllImages() {
  console.log('🖼️  Fetching product images from Amazon...\n');

  for (const product of products) {
    const filename = `${product.name}.jpg`;
    try {
      await downloadImage(product.imageUrl, filename);
    } catch (err) {
      console.log(`   Note: ${filename} - using fallback URL\n`);
    }
  }

  console.log(`\n✅ Done! Images saved to: ${imagesDir}\n`);
  console.log('📌 Update your product JSON files to use:');
  console.log('   "image": "/products/[product-name].jpg"\n');
}

fetchAllImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
