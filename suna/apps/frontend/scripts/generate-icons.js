#!/usr/bin/env node

/**
 * Generate favicon and icon assets for CarbonScope branding
 * Uses canvas to create PNG files from SVG-like definitions
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas if available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('Canvas not available, will create SVG files only');
}

const publicDir = path.join(__dirname, '..', 'public');

// Brand colors
const EMERALD = '#34D399';
const DARK_BG = '#0B1120';

/**
 * Create a simple "B" favicon using canvas
 */
function createFavicon() {
  if (!Canvas) {
    console.log('Skipping favicon.ico generation - canvas not available');
    return;
  }

  const { createCanvas } = Canvas;
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, size, size);

  // Emerald "B" letter
  ctx.fillStyle = EMERALD;
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2);

  // Save as PNG (ICO conversion would need additional library)
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), buffer);
  console.log('Created favicon.png (32x32)');
}

/**
 * Create icon.png (192x192) for PWA
 */
function createIcon192() {
  if (!Canvas) {
    console.log('Skipping icon.png generation - canvas not available');
    return;
  }

  const { createCanvas } = Canvas;
  const size = 192;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark background with slight rounded corners effect
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, size, size);

  // Emerald "B" letter
  ctx.fillStyle = EMERALD;
  ctx.font = 'bold 140px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'icon.png'), buffer);
  console.log('Created icon.png (192x192)');
}

/**
 * Create apple-icon.png (180x180)
 */
function createAppleIcon() {
  if (!Canvas) {
    console.log('Skipping apple-icon.png generation - canvas not available');
    return;
  }

  const { createCanvas } = Canvas;
  const size = 180;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, size, size);

  // Emerald "B" letter
  ctx.fillStyle = EMERALD;
  ctx.font = 'bold 130px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), buffer);
  console.log('Created apple-icon.png (180x180)');
}

/**
 * Create og-image.png (1200x630) for social sharing
 */
function createOGImage() {
  if (!Canvas) {
    console.log('Skipping og-image.png generation - canvas not available');
    return;
  }

  const { createCanvas } = Canvas;
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, width, height);

  // Main title
  ctx.fillStyle = EMERALD;
  ctx.font = 'bold 80px serif';
  ctx.textAlign = 'center';
  ctx.fillText('BKS cBIM AI', width / 2, height / 2 - 40);

  // Subtitle
  ctx.font = '36px serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('Carbon Assessment Platform', width / 2, height / 2 + 40);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), buffer);
  console.log('Created og-image.png (1200x630)');
}

/**
 * Create SVG fallbacks if canvas is not available
 */
function createSVGFallbacks() {
  // Favicon SVG
  const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0B1120"/>
  <text x="16" y="24" font-family="serif" font-size="24" font-weight="bold" fill="#34D399" text-anchor="middle">B</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
  console.log('Created favicon.svg');

  // Icon SVG
  const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#0B1120"/>
  <text x="96" y="130" font-family="serif" font-size="140" font-weight="bold" fill="#34D399" text-anchor="middle">B</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSVG);
  console.log('Created icon.svg');
}

// Main execution
console.log('Generating CarbonScope branded assets...\n');

createSVGFallbacks();
createFavicon();
createIcon192();
createAppleIcon();
createOGImage();

console.log('\nDone! Assets created in public/');
