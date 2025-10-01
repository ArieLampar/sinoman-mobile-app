/**
 * Generate Placeholder Assets Script
 *
 * This script generates simple placeholder PNG files for Expo assets.
 * Run this script to create temporary assets for development.
 *
 * Requirements:
 * - Node.js installed
 * - sharp package (npm install sharp)
 *
 * Usage:
 * node scripts/generate-placeholder-assets.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Error: sharp package is not installed.');
  console.error('Please install it with: npm install sharp');
  console.error('Or create the asset files manually.');
  process.exit(1);
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const BRAND_GREEN = '#059669';
const WHITE = '#FFFFFF';

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

/**
 * Generate app icon (1024x1024)
 * Simple green square with white "S" letter
 */
async function generateIcon() {
  console.log('Generating icon.png...');

  const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="${BRAND_GREEN}" rx="180"/>
      <text
        x="512"
        y="650"
        font-family="Arial, sans-serif"
        font-size="600"
        font-weight="bold"
        fill="${WHITE}"
        text-anchor="middle">S</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  console.log('✓ icon.png created');
}

/**
 * Generate splash screen (1284x2778)
 * Green background with centered Sinoman branding
 */
async function generateSplash() {
  console.log('Generating splash.png...');

  const svg = `
    <svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
      <rect width="1284" height="2778" fill="${BRAND_GREEN}"/>
      <g transform="translate(642, 1389)">
        <circle r="120" fill="${WHITE}" opacity="0.2"/>
        <text
          x="0"
          y="20"
          font-family="Arial, sans-serif"
          font-size="100"
          font-weight="bold"
          fill="${WHITE}"
          text-anchor="middle">SINOMAN</text>
        <text
          x="0"
          y="100"
          font-family="Arial, sans-serif"
          font-size="32"
          fill="${WHITE}"
          opacity="0.9"
          text-anchor="middle">Sehat Bareng, Kaya Bareng</text>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash.png'));

  console.log('✓ splash.png created');
}

/**
 * Generate adaptive icon (1024x1024)
 * White "S" on transparent background (foreground layer only)
 */
async function generateAdaptiveIcon() {
  console.log('Generating adaptive-icon.png...');

  const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="none"/>
      <circle cx="512" cy="512" r="380" fill="${WHITE}"/>
      <text
        x="512"
        y="650"
        font-family="Arial, sans-serif"
        font-size="500"
        font-weight="bold"
        fill="${BRAND_GREEN}"
        text-anchor="middle">S</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

  console.log('✓ adaptive-icon.png created');
}

/**
 * Main execution
 */
async function generateAllAssets() {
  console.log('🎨 Generating placeholder assets for Sinoman Mobile App...\n');

  try {
    await generateIcon();
    await generateSplash();
    await generateAdaptiveIcon();

    console.log('\n✅ All placeholder assets generated successfully!');
    console.log('\nAssets created in:', ASSETS_DIR);
    console.log('\nFiles generated:');
    console.log('  - icon.png (1024x1024)');
    console.log('  - splash.png (1284x2778)');
    console.log('  - adaptive-icon.png (1024x1024)');
    console.log('\n⚠️  Note: These are placeholder assets for development.');
    console.log('   Replace with production-ready assets before release.');
  } catch (error) {
    console.error('\n❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateAllAssets();
