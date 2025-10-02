#!/usr/bin/env node

/**
 * Asset Verification Script
 *
 * Verifies that all assets referenced in app.json exist in the repository.
 * Run before building to ensure builds won't fail due to missing assets.
 *
 * Usage: node scripts/verify-assets.js
 * Or: npm run verify-assets
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying app.json asset references...\n');

try {
  // Read app.json
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // Assets to verify
  const assetsToCheck = [
    {
      path: appJson.expo.icon,
      name: 'App Icon',
      required: true
    },
    {
      path: appJson.expo.splash?.image,
      name: 'Splash Screen',
      required: true
    },
    {
      path: appJson.expo.android?.adaptiveIcon?.foregroundImage,
      name: 'Adaptive Icon (Foreground)',
      required: true
    },
    {
      path: appJson.expo.android?.adaptiveIcon?.monochromeImage,
      name: 'Adaptive Icon (Monochrome)',
      required: true
    },
    {
      path: appJson.expo.notification?.icon,
      name: 'Notification Icon',
      required: true
    }
  ];

  let allGood = true;
  let missingCount = 0;
  let foundCount = 0;

  console.log('Asset Status:\n' + '='.repeat(60));

  assetsToCheck.forEach((asset, index) => {
    if (!asset.path) {
      if (asset.required) {
        console.log(`⚠️  ${asset.name}: Not configured in app.json`);
        console.log(`   This asset should be configured for production builds\n`);
        allGood = false;
        missingCount++;
      }
      return;
    }

    const assetPath = asset.path.replace('./', '');
    const absolutePath = path.join(__dirname, '..', assetPath);
    const exists = fs.existsSync(absolutePath);

    if (exists) {
      const stats = fs.statSync(absolutePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${asset.name}`);
      console.log(`   Path: ${asset.path}`);
      console.log(`   Size: ${sizeKB} KB`);
      console.log(`   Status: Ready\n`);
      foundCount++;
    } else {
      console.log(`❌ ${asset.name}`);
      console.log(`   Path: ${asset.path}`);
      console.log(`   Expected: ${absolutePath}`);
      console.log(`   Status: MISSING - BUILD WILL FAIL\n`);
      allGood = false;
      missingCount++;
    }
  });

  console.log('='.repeat(60));
  console.log(`\nSummary: ${foundCount} found, ${missingCount} missing\n`);

  if (allGood) {
    console.log('✅ SUCCESS: All required assets are present!');
    console.log('   Builds can proceed without asset errors.\n');

    console.log('Next steps:');
    console.log('  1. Review assets for production quality');
    console.log('  2. Replace placeholders with final designs');
    console.log('  3. Run: eas build --profile production --platform all\n');

    process.exit(0);
  } else {
    console.log('❌ FAILURE: Some assets are missing!');
    console.log('   Builds will fail with asset resolution errors.\n');

    console.log('To fix:');
    console.log('  1. Run: npm run generate-icons');
    console.log('  2. Or manually create the missing assets');
    console.log('  3. Re-run this script to verify\n');

    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error verifying assets:', error.message);
  process.exit(1);
}
