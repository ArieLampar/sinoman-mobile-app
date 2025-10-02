const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function createMonochromeIcon() {
  console.log('Creating adaptive-icon-monochrome.png...');

  // Create a 1024x1024 white circle on transparent background
  const svgCircle = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <circle cx="512" cy="512" r="400" fill="white"/>
      <text x="512" y="600" font-family="Arial" font-size="500" font-weight="bold"
            fill="transparent" stroke="white" stroke-width="20" text-anchor="middle">S</text>
    </svg>
  `;

  await sharp(Buffer.from(svgCircle))
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon-monochrome.png'));

  console.log('✅ adaptive-icon-monochrome.png created');
}

async function createNotificationIcon() {
  console.log('Creating notification-icon.png...');

  // Create a 96x96 white icon on transparent background
  const svgNotification = `
    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="40" fill="white"/>
      <text x="48" y="63" font-family="Arial" font-size="50" font-weight="bold"
            fill="transparent" stroke="white" stroke-width="3" text-anchor="middle">S</text>
    </svg>
  `;

  await sharp(Buffer.from(svgNotification))
    .png()
    .toFile(path.join(ASSETS_DIR, 'notification-icon.png'));

  console.log('✅ notification-icon.png created');
}

async function main() {
  console.log('🎨 Creating placeholder icons for app.json...\n');

  try {
    await createMonochromeIcon();
    await createNotificationIcon();

    console.log('\n✅ All placeholder icons created successfully!');
    console.log('\nNOTE: These are placeholder icons. For production, replace with:');
    console.log('  - adaptive-icon-monochrome.png: White silhouette of your logo (1024x1024)');
    console.log('  - notification-icon.png: Simplified white icon for notifications (96x96)');
  } catch (error) {
    console.error('❌ Error creating icons:', error);
    process.exit(1);
  }
}

main();
