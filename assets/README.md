# Sinoman Mobile App Assets

This directory contains the visual assets required for the Sinoman Mobile App.

## Required Assets

### 1. App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Description**: Main app icon featuring Sinoman logo
- **Brand Colors**: Primary green (#059669) with white/cream accents
- **Design Guidelines**:
  - Simple, recognizable logo
  - Works well at small sizes
  - No text (text can be illegible at small sizes)
  - Centered design with padding

**Current Placeholder**: Green square with "S" letter representing Sinoman brand

### 2. Splash Screen (`splash.png`)
- **Size**: 1284x2778 pixels (iPhone 13 Pro Max resolution)
- **Format**: PNG with transparency
- **Background**: Matches backgroundColor in app.json (#059669)
- **Description**: Loading screen shown while app initializes
- **Design Guidelines**:
  - Sinoman logo centered
  - Brand colors (#059669 green background)
  - Optional tagline: "Sehat Bareng, Kaya Bareng"
  - Loading indicator area reserved at bottom

**Current Placeholder**: Green background with white Sinoman branding

### 3. Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Description**: Android adaptive icon (foreground layer)
- **Background**: Set in app.json as #059669
- **Design Guidelines**:
  - Icon content should be within safe zone (center 66%)
  - Foreground layer should work on green background
  - Simple, bold design
  - No background in the PNG (transparent)

**Current Placeholder**: White/transparent Sinoman "S" logo on transparent background

## Creating Production Assets

For production deployment, replace these placeholders with professionally designed assets:

### Design Tools Recommended
- Adobe Illustrator / Photoshop
- Figma
- Sketch
- Canva (for quick prototypes)

### Asset Generation Services
- [MakeAppIcon](https://makeappicon.com/) - Generate all required sizes
- [AppIcon.co](https://appicon.co/) - Icon generator
- [IconKitchen](https://icon.kitchen/) - Android adaptive icons

### Export Requirements

1. **Icon.png** (1024x1024)
   ```
   Format: PNG-24
   Color Space: sRGB
   Transparency: Yes
   Compression: Optimized
   ```

2. **Splash.png** (1284x2778)
   ```
   Format: PNG-24
   Color Space: sRGB
   Resolution: 72 DPI
   Scale: @3x for retina displays
   ```

3. **Adaptive-icon.png** (1024x1024)
   ```
   Format: PNG-24
   Color Space: sRGB
   Transparency: Yes (background removed)
   Safe Zone: Content within center 66% (684x684px)
   ```

## Brand Guidelines

### Colors
- **Primary Green**: #059669 (Sinoman Brand Green)
- **Amber Accent**: #F59E0B (Warning/Highlight color)
- **White**: #FFFFFF (Text/Icons on green)
- **Dark Gray**: #1F2937 (Text on light backgrounds)

### Typography
- **Primary Font**: System fonts (Roboto on Android, SF Pro on iOS)
- **Brand Name**: "Sinoman" or "Sinoman Ponorogo"
- **Tagline**: "Sehat Bareng, Kaya Bareng, Bareng Sinoman"

### Logo Design Elements
- Health symbol (medical cross, heart, or wellness icon)
- Cooperative/community element (people, hands, unity symbol)
- Growth/prosperity element (upward arrow, plant, money)
- Indonesian cultural element (subtle local motif)

## Temporary Placeholders

Until production assets are created, the app includes these placeholder files:
- `icon.png` - Simple green square with white "S"
- `splash.png` - Green background with white "Sinoman" text
- `adaptive-icon.png` - White "S" logo on transparent background

**Note**: These placeholders are sufficient for development and testing but should be replaced before production release.

## File Structure

```
assets/
├── README.md (this file)
├── icon.png (1024x1024 - App icon)
├── splash.png (1284x2778 - Splash screen)
├── adaptive-icon.png (1024x1024 - Android adaptive icon foreground)
└── .gitkeep (ensures directory is tracked)
```

## Updating Assets

To update assets:

1. Replace the PNG files in this directory
2. Ensure file names match exactly (case-sensitive)
3. Verify dimensions match requirements
4. Test on both iOS and Android devices
5. Clear Expo cache: `expo start -c`
6. Rebuild the app for changes to take effect

## Asset Validation

Before committing asset changes:
- [ ] Icon displays correctly at all sizes
- [ ] Splash screen centers properly on different screen sizes
- [ ] Adaptive icon safe zone respected
- [ ] Colors match brand guidelines
- [ ] Files are optimized (compressed)
- [ ] Transparency works correctly
- [ ] No visual artifacts or distortion

## Contact

For questions about brand assets or design guidelines, contact:
- Design Team: design@sinoman.co.id
- Product Team: product@sinoman.co.id
