/**
 * UGC Video Generator - Cree des videos slideshow TikTok/Reels automatiquement
 * Utilise FFmpeg pour generer des videos avec texte anime et transitions
 *
 * Usage: node scripts/ugc/generate-video.mjs [video-id]
 * Exemple: node scripts/ugc/generate-video.mjs 1
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', '..', 'public', 'ugc-videos');
const tempDir = path.join(__dirname, 'temp');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Configuration video TikTok
const CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  fontFamily: 'Arial',
};

// Couleurs pour les slides
const COLORS = {
  dark: { bg: '#0F0F1A', text: '#FFFFFF', accent: '#FF6B35' },
  sunset: { bg: '#1A0A2E', text: '#FFFFFF', accent: '#FF6B35' },
  ocean: { bg: '#0A1628', text: '#FFFFFF', accent: '#3B82F6' },
  nature: { bg: '#0A1A0A', text: '#FFFFFF', accent: '#22C55E' },
  warm: { bg: '#1A140A', text: '#FFFFFF', accent: '#F59E0B' },
};

function generateSlideImage(text, subtext, bgColor, textColor, accentColor, index) {
  const outputFile = path.join(tempDir, `slide_${index}.png`);

  // Escape special characters for FFmpeg
  const escapedText = text.replace(/'/g, "'\\''").replace(/:/g, '\\:').replace(/,/g, '\\,');
  const escapedSubtext = subtext ? subtext.replace(/'/g, "'\\''").replace(/:/g, '\\:').replace(/,/g, '\\,') : '';

  let filterComplex = `color=c=${bgColor}:s=${CONFIG.width}x${CONFIG.height}:d=1,format=yuv420p`;

  // Main text
  filterComplex += `,drawtext=text='${escapedText}':fontsize=72:fontcolor=${textColor}:x=(w-tw)/2:y=(h-th)/2-60:fontfile='C\\:/Windows/Fonts/arialbd.ttf'`;

  // Subtext
  if (escapedSubtext) {
    filterComplex += `,drawtext=text='${escapedSubtext}':fontsize=42:fontcolor=${accentColor}:x=(w-tw)/2:y=(h+th)/2+20:fontfile='C\\:/Windows/Fonts/arial.ttf'`;
  }

  // Watermark
  filterComplex += `,drawtext=text='@issam_deco':fontsize=28:fontcolor=white@0.5:x=(w-tw)/2:y=h-80:fontfile='C\\:/Windows/Fonts/arial.ttf'`;

  const cmd = `ffmpeg -y -f lavfi -i "${filterComplex}" -frames:v 1 "${outputFile}" 2>&1`;

  try {
    execSync(cmd, { timeout: 15000 });
    return outputFile;
  } catch (e) {
    console.error(`Erreur slide ${index}: ${e.message}`);
    return null;
  }
}

function generateVideoFromSlides(slides, outputFilename, duration = 3) {
  console.log(`\n🎬 Generation de la video: ${outputFilename}`);
  console.log(`   ${slides.length} slides, ${duration}s par slide`);

  const slideFiles = [];

  slides.forEach((slide, i) => {
    const colorScheme = Object.values(COLORS)[i % Object.values(COLORS).length];
    console.log(`   📸 Slide ${i + 1}/${slides.length}: ${slide.text.substring(0, 40)}...`);

    const file = generateSlideImage(
      slide.text,
      slide.subtext || '',
      colorScheme.bg,
      colorScheme.text,
      colorScheme.accent,
      i
    );
    if (file) slideFiles.push(file);
  });

  if (slideFiles.length === 0) {
    console.error('❌ Aucune slide generee');
    return null;
  }

  // Create concat file
  const concatFile = path.join(tempDir, 'concat.txt');
  const concatContent = slideFiles.map(f => `file '${f.replace(/\\/g, '/')}'\nduration ${duration}`).join('\n');
  fs.writeFileSync(concatFile, concatContent + `\nfile '${slideFiles[slideFiles.length - 1].replace(/\\/g, '/')}'`);

  const outputPath = path.join(outputDir, outputFilename);

  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -vf "scale=${CONFIG.width}:${CONFIG.height}" -c:v libx264 -pix_fmt yuv420p -r ${CONFIG.fps} "${outputPath}"`,
      { timeout: 60000 }
    );
    console.log(`   ✅ Video generee: ${outputPath}`);
    return outputPath;
  } catch (e) {
    console.error(`❌ Erreur generation video: ${e.message}`);
    return null;
  }
}

// ========== MAIN ==========
const videoId = parseInt(process.argv[2] || '3'); // Default: video #3 (top 5 products)

const scriptsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'video-scripts.json'), 'utf-8'));
const script = scriptsData.scripts.find(s => s.id === videoId);

if (!script) {
  console.log('❌ Video script non trouve. Scripts disponibles:');
  scriptsData.scripts.forEach(s => console.log(`   ${s.id}. ${s.title}`));
  process.exit(1);
}

console.log(`\n🎥 GENERATION VIDEO UGC`);
console.log(`   Titre: ${script.title}`);
console.log(`   Type: ${script.type}`);
console.log(`   Duree: ${script.duration}`);
console.log(`   Plateformes: ${script.platform.join(', ')}`);

const slides = script.scenes.map(scene => ({
  text: scene.text || scene.visual.substring(0, 50),
  subtext: scene.text ? '' : scene.visual.substring(0, 60),
})).filter(s => s.text.length > 0);

const outputFilename = `video-${videoId}-${script.type}.mp4`;
const result = generateVideoFromSlides(slides, outputFilename, 3);

if (result) {
  console.log(`\n🎉 VIDEO PRETE !`);
  console.log(`   📁 Fichier: ${result}`);
  console.log(`   📱 Format: TikTok vertical (1080x1920)`);
  console.log(`\n📋 INSTRUCTIONS POUR POSTER:`);
  console.log(`   1. Ouvre TikTok, appuie sur +`);
  console.log(`   2. Importe cette video`);
  console.log(`   3. Ajoute un son tendance`);
  console.log(`   4. Caption: ${script.caption}`);
  console.log(`   5. CTA: ${script.cta}`);
}

// Cleanup temp files
try {
  fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
} catch (e) {}

console.log('\n✅ Terminé !');
