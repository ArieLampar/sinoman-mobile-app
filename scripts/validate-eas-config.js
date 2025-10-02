#!/usr/bin/env node

/**
 * EAS Configuration Validator
 *
 * Validates that all required EAS configuration is present and correct
 * before attempting to build.
 *
 * Usage: node scripts/validate-eas-config.js
 * Or: npm run validate-eas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating EAS Build configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Validate app.json
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  console.log('Checking app.json configuration:\n' + '='.repeat(60));

  // Check EAS project ID
  const projectId = appJson.expo?.extra?.eas?.projectId;

  if (!projectId) {
    console.log('❌ EAS Project ID: MISSING');
    console.log('   Location: expo.extra.eas.projectId');
    console.log('   Action: Run `eas init` and add the project ID to app.json\n');
    hasErrors = true;
  } else if (projectId === 'your-eas-project-id' || projectId === 'your-project-id') {
    console.log('⚠️  EAS Project ID: PLACEHOLDER VALUE');
    console.log('   Current: "' + projectId + '"');
    console.log('   Action: Replace with actual UUID from `eas init`\n');
    hasWarnings = true;
  } else if (!isValidUUID(projectId)) {
    console.log('❌ EAS Project ID: INVALID FORMAT');
    console.log('   Current: "' + projectId + '"');
    console.log('   Expected: UUID format (e.g., 12345678-1234-1234-1234-123456789abc)\n');
    hasErrors = true;
  } else {
    console.log('✅ EAS Project ID: CONFIGURED');
    console.log('   Value: ' + projectId);
    console.log('   Format: Valid UUID\n');
  }

  // Check bundle identifiers
  const androidPackage = appJson.expo?.android?.package;
  const iosBundleId = appJson.expo?.ios?.bundleIdentifier;

  if (androidPackage && iosBundleId) {
    console.log('✅ Bundle Identifiers: CONFIGURED');
    console.log('   Android: ' + androidPackage);
    console.log('   iOS: ' + iosBundleId + '\n');
  } else {
    console.log('❌ Bundle Identifiers: INCOMPLETE');
    if (!androidPackage) console.log('   Missing: android.package');
    if (!iosBundleId) console.log('   Missing: ios.bundleIdentifier\n');
    hasErrors = true;
  }

  // Check version info
  const version = appJson.expo?.version;
  const androidVersionCode = appJson.expo?.android?.versionCode;
  const iosBuildNumber = appJson.expo?.ios?.buildNumber;

  if (version && androidVersionCode && iosBuildNumber) {
    console.log('✅ Version Info: CONFIGURED');
    console.log('   Version: ' + version);
    console.log('   Android versionCode: ' + androidVersionCode);
    console.log('   iOS buildNumber: ' + iosBuildNumber + '\n');
  } else {
    console.log('⚠️  Version Info: INCOMPLETE');
    if (!version) console.log('   Missing: expo.version');
    if (!androidVersionCode) console.log('   Missing: android.versionCode');
    if (!iosBuildNumber) console.log('   Missing: ios.buildNumber\n');
    hasWarnings = true;
  }

} catch (error) {
  console.log('❌ Error reading app.json:', error.message + '\n');
  hasErrors = true;
}

// Validate eas.json
try {
  const easJsonPath = path.join(__dirname, '..', 'eas.json');

  if (!fs.existsSync(easJsonPath)) {
    console.log('⚠️  eas.json: NOT FOUND');
    console.log('   Action: Run `eas build:configure` to create it\n');
    hasWarnings = true;
  } else {
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    console.log('Checking eas.json configuration:\n' + '='.repeat(60));

    if (easJson.build?.production) {
      console.log('✅ Production Build Profile: CONFIGURED');

      if (easJson.build.production.android) {
        console.log('   ✅ Android: ' + (easJson.build.production.android.buildType || 'configured'));
      }

      if (easJson.build.production.ios) {
        console.log('   ✅ iOS: ' + (easJson.build.production.ios.buildConfiguration || 'configured'));
      }

      console.log();
    } else {
      console.log('⚠️  Production Build Profile: NOT FOUND');
      console.log('   Action: Configure production profile in eas.json\n');
      hasWarnings = true;
    }
  }
} catch (error) {
  console.log('⚠️  Error reading eas.json:', error.message + '\n');
  hasWarnings = true;
}

// Check for Firebase config files
console.log('Checking Firebase configuration:\n' + '='.repeat(60));

const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
const googleServiceInfoPath = path.join(__dirname, '..', 'GoogleService-Info.plist');

if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json: FOUND (Android)');
} else {
  console.log('⚠️  google-services.json: NOT FOUND');
  console.log('   Required for: Firebase on Android');
}

if (fs.existsSync(googleServiceInfoPath)) {
  console.log('✅ GoogleService-Info.plist: FOUND (iOS)');
} else {
  console.log('⚠️  GoogleService-Info.plist: NOT FOUND');
  console.log('   Required for: Firebase on iOS');
}

console.log();

// Summary
console.log('='.repeat(60));
console.log('\nSummary:\n');

if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Critical errors found!');
  console.log('\nCritical Issues:');
  console.log('  - Fix all ❌ errors before building');
  console.log('  - EAS build will fail without required configuration\n');

  console.log('To fix:');
  console.log('  1. Run: eas init');
  console.log('  2. Update app.json with the project ID from step 1');
  console.log('  3. Run this script again to verify\n');

  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED - But warnings found');
  console.log('\nWarnings:');
  console.log('  - Review all ⚠️  warnings');
  console.log('  - Some features may not work without optional configs\n');

  console.log('You can proceed with build, but consider addressing warnings.\n');

  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED - All checks successful!');
  console.log('\nYou can now proceed with EAS build:');
  console.log('  - Development: eas build --profile development --platform all');
  console.log('  - Preview: eas build --profile preview --platform all');
  console.log('  - Production: eas build --profile production --platform all\n');

  process.exit(0);
}

/**
 * Validate UUID format (8-4-4-4-12 hex characters)
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
