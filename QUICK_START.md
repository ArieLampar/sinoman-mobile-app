# 🚀 Quick Start Guide

Get the Sinoman Mobile App running in 5 minutes!

## Step 1: Clone & Install
```bash
git clone <repository-url>
cd sinoman-mobile-app
npm install
```

## Step 2: Generate Assets ⚠️ REQUIRED
Choose ONE method:

### Option A: Browser (Fastest - No Setup)
```bash
# Open in browser and download images
open scripts/generate-assets.html
```
Then save the 3 generated images to `assets/` folder.

### Option B: Automated Script
```bash
npm install sharp
npm run generate-assets
```

### Option C: Quick Placeholder (Testing Only)
```bash
# Use any PNG file as placeholder
cp some-image.png assets/icon.png
cp some-image.png assets/splash.png
cp some-image.png assets/adaptive-icon.png
```

## Step 3: Environment Setup
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

## Step 4: Start App
```bash
expo start
```

Then scan QR code with Expo Go app!

---

## Having Issues?

### "Unable to resolve module" error
→ Run: `expo start -c` (clears cache)

### Assets missing
→ Verify files exist: `ls assets/*.png`
→ Should show: icon.png, splash.png, adaptive-icon.png

### Supabase errors
→ Check .env file has correct credentials
→ Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set

---

## Full Documentation
- **Complete Setup**: [ASSETS_SETUP.md](ASSETS_SETUP.md)
- **Main README**: [README.md](README.md)
- **Phase Docs**: [docs/](docs/)

## Need Help?
- 📧 tech@sinomanapp.id
- 💬 WhatsApp: +62 82331052577
