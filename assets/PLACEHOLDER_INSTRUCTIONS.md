# Creating Placeholder Assets

Since binary PNG files cannot be directly created in this environment, follow one of these methods to generate the required placeholder assets:

## Method 1: Using the Generation Script (Recommended)

1. Install the sharp package:
   ```bash
   npm install sharp
   ```

2. Run the generation script:
   ```bash
   node scripts/generate-placeholder-assets.js
   ```

3. The script will create all three required PNG files in the `assets/` directory.

## Method 2: Using Online Tools

### For icon.png (1024x1024):
1. Go to [Placeholder.com](https://placeholder.com/) or [DummyImage.com](https://dummyimage.com/)
2. Create a 1024x1024 image with background color #059669
3. Add white "S" text in the center
4. Download as PNG and save as `assets/icon.png`

### For splash.png (1284x2778):
1. Go to [Canva](https://www.canva.com/) (free account)
2. Create custom size: 1284x2778 pixels
3. Set background to #059669
4. Add "SINOMAN" text in white, centered
5. Download as PNG and save as `assets/splash.png`

### For adaptive-icon.png (1024x1024):
1. Same as icon.png but with transparent background
2. White circle with green "S" in center
3. Save as `assets/adaptive-icon.png`

## Method 3: Using Expo's Default Assets

If you have Expo CLI installed:

```bash
# Initialize a temporary Expo project to copy default assets
expo init temp-project
cd temp-project
cp assets/* ../assets/
cd ..
rm -rf temp-project
```

## Method 4: Simple Colored Placeholders

Create simple solid color PNG files (any image editor):

**icon.png**: 1024x1024px, solid green (#059669)
**splash.png**: 1284x2778px, solid green (#059669)
**adaptive-icon.png**: 1024x1024px, white circle on transparent background

## Verification

After creating the files, verify they exist:

```bash
ls -la assets/
```

You should see:
- icon.png
- splash.png
- adaptive-icon.png
- README.md
- PLACEHOLDER_INSTRUCTIONS.md

## Quick Fix for Development

If you need to start development immediately without proper assets, you can:

1. Create any PNG file (even a screenshot)
2. Copy it three times with the required names
3. Expo will use them (they won't look good but will prevent build errors)

```bash
# Example using any PNG file
cp any-image.png assets/icon.png
cp any-image.png assets/splash.png
cp any-image.png assets/adaptive-icon.png
```

## Testing

After adding assets, test them:

```bash
expo start -c
```

The `-c` flag clears the cache to ensure new assets are loaded.
