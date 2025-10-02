const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// iOS icon sizes
const IOS_SIZES = [
  { size: 20, scales: [2, 3] },
  { size: 29, scales: [2, 3] },
  { size: 40, scales: [2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 1024, scales: [1] }
];

// Android densities
const ANDROID_DENSITIES = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
];

async function createPlaceholderSource() {
  const source = path.join(ASSETS_DIR, 'icon-source.png');

  if (!fs.existsSync(source)) {
    console.log('Creating placeholder icon-source.png...');
    const svgIcon = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="#059669"/>
        <circle cx="512" cy="512" r="350" fill="white"/>
        <text x="512" y="620" font-family="Arial" font-size="400" font-weight="bold"
              fill="#059669" text-anchor="middle">S</text>
      </svg>
    `;
    await sharp(Buffer.from(svgIcon))
      .png()
      .toFile(source);
    console.log('✅ Placeholder icon-source.png created');
  }
}

async function createPlaceholderSplashSource() {
  const source = path.join(ASSETS_DIR, 'splash-source.png');

  if (!fs.existsSync(source)) {
    console.log('Creating placeholder splash-source.png...');
    const svgSplash = `
      <svg width="2048" height="2048" xmlns="http://www.w3.org/2000/svg">
        <rect width="2048" height="2048" fill="#059669"/>
        <text x="1024" y="1100" font-family="Arial" font-size="300" font-weight="bold"
              fill="white" text-anchor="middle">SINOMAN</text>
      </svg>
    `;
    await sharp(Buffer.from(svgSplash))
      .png()
      .toFile(source);
    console.log('✅ Placeholder splash-source.png created');
  }
}

async function generateIcons() {
  const source = path.join(ASSETS_DIR, 'icon-source.png');

  if (!fs.existsSync(source)) {
    console.error('❌ icon-source.png not found! Please create a 1024x1024 icon first.');
    return;
  }

  // iOS directory
  const iosDir = path.join(ASSETS_DIR, 'ios');
  if (!fs.existsSync(iosDir)) {
    fs.mkdirSync(iosDir, { recursive: true });
  }

  // Generate iOS icons
  for (const icon of IOS_SIZES) {
    for (const scale of icon.scales) {
      const size = icon.size * scale;
      await sharp(source)
        .resize(size, size)
        .toFile(path.join(iosDir, `icon-${icon.size}@${scale}x.png`));
    }
  }

  // Android directory
  const androidDir = path.join(ASSETS_DIR, 'android');

  // Generate Android icons
  for (const d of ANDROID_DENSITIES) {
    const mipmapDir = path.join(androidDir, `mipmap-${d.name}`);
    if (!fs.existsSync(mipmapDir)) {
      fs.mkdirSync(mipmapDir, { recursive: true });
    }
    await sharp(source)
      .resize(d.size, d.size)
      .toFile(path.join(mipmapDir, 'ic_launcher.png'));
  }

  // Universal icon (1024x1024)
  await sharp(source)
    .resize(1024, 1024)
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  // Adaptive icon (512x512)
  await sharp(source)
    .resize(512, 512)
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

  console.log('✅ Icons generated');
}

async function generateSplash() {
  const source = path.join(ASSETS_DIR, 'splash-source.png');

  if (!fs.existsSync(source)) {
    console.error('❌ splash-source.png not found! Please create a 2048x2048 splash first.');
    return;
  }

  // Generate splash with green background
  await sharp(source)
    .resize(1284, 2778, {
      fit: 'contain',
      background: { r: 5, g: 150, b: 105, alpha: 1 }
    })
    .toFile(path.join(ASSETS_DIR, 'splash.png'));

  console.log('✅ Splash screen generated');
}

async function generateNotificationIcon() {
  const source = path.join(ASSETS_DIR, 'icon-source.png');

  if (!fs.existsSync(source)) {
    console.warn('⚠️  icon-source.png not found, skipping notification icon generation');
    return;
  }

  // Generate notification icon (96x96, simplified)
  await sharp(source)
    .resize(96, 96)
    .toFile(path.join(ASSETS_DIR, 'notification-icon.png'));

  console.log('✅ Notification icon generated');
}

async function generateMonochromeIcon() {
  const source = path.join(ASSETS_DIR, 'icon-source.png');

  if (!fs.existsSync(source)) {
    console.warn('⚠️  icon-source.png not found, skipping monochrome icon generation');
    console.warn('   Using placeholder adaptive-icon-monochrome.png if it exists');
    return;
  }

  // Create SVG for white silhouette
  const svgMonochrome = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <circle cx="512" cy="512" r="400" fill="white"/>
      <text x="512" y="600" font-family="Arial" font-size="500" font-weight="bold"
            fill="transparent" stroke="white" stroke-width="20" text-anchor="middle">S</text>
    </svg>
  `;

  await sharp(Buffer.from(svgMonochrome))
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon-monochrome.png'));

  console.log('✅ Adaptive icon monochrome generated');
  console.log('   NOTE: Replace with actual white silhouette of your logo for production');
}

async function main() {
  console.log('🎨 Generating production assets...\n');

  await createPlaceholderSource();
  await createPlaceholderSplashSource();
  await generateIcons();
  await generateSplash();
  await generateNotificationIcon();
  await generateMonochromeIcon();

  console.log('\n✅ All assets generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review all generated assets in assets/ directory');
  console.log('2. Replace placeholders with production-quality designs');
  console.log('3. Run: eas build --profile production --platform all');
}

main().catch(console.error);
