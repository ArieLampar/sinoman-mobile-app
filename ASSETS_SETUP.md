# Asset Setup Guide

The Sinoman Mobile App requires three image assets referenced in `app.json`. These assets are currently **not included** in the repository and must be generated or created before building the app.

## Required Assets

| File | Size | Description |
|------|------|-------------|
| `assets/icon.png` | 1024x1024 | App icon (displayed on home screen) |
| `assets/splash.png` | 1284x2778 | Splash screen (shown while app loads) |
| `assets/adaptive-icon.png` | 1024x1024 | Android adaptive icon foreground layer |

## Quick Setup Options

### Option 1: Browser-Based Generator (Easiest)

1. Open `scripts/generate-assets.html` in your web browser
2. Click each "Generate" button
3. Right-click generated images and save them to `assets/` folder with correct filenames
4. Done! ✅

### Option 2: Node.js Script (Automated)

```bash
# Install image processing library
npm install sharp

# Run generation script
npm run generate-assets
```

This will automatically create all three PNG files in the `assets/` directory.

### Option 3: Manual Creation

If you have design tools (Photoshop, Figma, etc.):

1. Create three PNG files with dimensions listed above
2. Use brand color #059669 (Sinoman green) as primary color
3. Add "S" logo or "SINOMAN" text in white
4. Save files to `assets/` folder with exact filenames

### Option 4: Use Any Placeholder

For immediate development, any PNG files will work:

```bash
# Copy any PNG file three times (they won't look good but will prevent errors)
cp some-image.png assets/icon.png
cp some-image.png assets/splash.png
cp some-image.png assets/adaptive-icon.png
```

## Verification

After creating assets, verify they exist:

```bash
ls assets/
```

Expected output:
```
.gitkeep
icon.png
splash.png
adaptive-icon.png
README.md
PLACEHOLDER_INSTRUCTIONS.md
```

## Testing

Start the Expo development server with cache cleared:

```bash
expo start -c
```

The `-c` flag ensures new assets are loaded.

## Important Notes

⚠️ **For Development Only**: The generated placeholder assets are suitable for development and testing but should be replaced with professionally designed assets before production release.

✅ **Git Tracking**: The placeholder PNG files are intentionally **not** committed to the repository. Each developer must generate them locally. Production assets will be added before release.

📱 **Build Requirement**: These assets are required for:
- Expo Go testing
- Development builds
- Production builds
- App store submissions

## Troubleshooting

### "Unable to resolve module" error
- Ensure all three PNG files exist in `assets/` directory
- Check filenames are exactly: `icon.png`, `splash.png`, `adaptive-icon.png`
- Clear Expo cache: `expo start -c`

### Images not displaying
- Verify PNG format (not JPG or other formats)
- Check file sizes are not corrupted (should be > 10KB each)
- Restart Metro bundler

### Generation script fails
- Ensure Node.js is installed: `node --version`
- Install sharp manually: `npm install sharp`
- Try browser-based generator instead

## Production Assets

Before releasing to production:

1. Replace placeholder assets with professional designs
2. Follow brand guidelines in `assets/README.md`
3. Ensure proper dimensions and formats
4. Test on multiple devices
5. Update this document if process changes

## References

- [Expo Icon Guidelines](https://docs.expo.dev/guides/app-icons/)
- [Expo Splash Screen](https://docs.expo.dev/guides/splash-screens/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Apple App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## Support

For questions about assets:
- See detailed instructions: `assets/README.md`
- See placeholder guide: `assets/PLACEHOLDER_INSTRUCTIONS.md`
- Contact: development team or design team
