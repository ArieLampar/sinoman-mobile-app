# Store Screenshots Guide

## Required Screenshots

### Android (Google Play)
- **Resolution:** 1080x1920 pixels (portrait)
- **Format:** PNG or JPEG
- **Count:** 5-8 screenshots minimum
- **Location:** `./android/`

### iOS (App Store)
**6.5" Display (iPhone 14 Pro Max)**
- **Resolution:** 1284x2778 pixels (portrait)
- **Format:** PNG or JPEG, no transparency
- **Count:** 5-10 screenshots
- **Location:** `./ios/6.5-inch/`

**5.5" Display (iPhone 8 Plus)**
- **Resolution:** 1242x2208 pixels (portrait)
- **Format:** PNG or JPEG, no transparency
- **Count:** 5-10 screenshots
- **Location:** `./ios/5.5-inch/`

## Recommended Screenshot Content (in order)

1. **01-dashboard.png**
   - Main dashboard view
   - Show balance cards (Pokok, Wajib, Sukarela)
   - Quick actions visible
   - Highlight total balance

2. **02-qr-scanner.png**
   - QR code scanner screen
   - Payment flow
   - Show merchant info or sample QR

3. **03-savings.png**
   - Savings detail screen
   - Chart showing growth
   - Transaction history
   - Top-up button visible

4. **04-marketplace.png**
   - Product grid
   - Categories visible
   - Show prices and discounts
   - Shopping cart icon

5. **05-fit-challenge.png**
   - Fit Challenge dashboard
   - Progress chart/calendar
   - Points/leaderboard
   - Active challenge visible

6. **06-profile.png** (Optional)
   - User profile screen
   - Settings menu
   - Security features highlighted

7. **07-transactions.png** (Optional)
   - Transaction history
   - Filter options
   - Detailed transaction view

8. **08-notifications.png** (Optional)
   - Notification center
   - Various notification types
   - Mark as read functionality

## How to Capture Screenshots

### Android Emulator
```bash
# Using ADB
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./android/01-dashboard.png
```

### iOS Simulator
```bash
# Using xcrun simctl (while simulator is open)
xcrun simctl io booted screenshot ./ios/6.5-inch/01-dashboard.png

# Or use Cmd+S in Simulator to save to Desktop
```

### Alternative: Manual Capture
1. Open the app in emulator/simulator
2. Navigate to desired screen
3. Press:
   - **Android:** Volume Down + Power
   - **iOS Simulator:** Cmd+S
4. Resize to required dimensions if needed

## Screenshot Best Practices

### Content
- Use real or realistic data (not "Lorem ipsum")
- Show meaningful balances (e.g., Rp 1.250.000)
- Include user avatar/name
- Display notifications/badges if relevant
- Ensure text is readable

### Design
- Clean UI without debug overlays
- No personal/sensitive data
- Consistent theme across screenshots
- Good contrast and visibility
- Status bar shows full signal/battery

### Timing
- Capture after animations complete
- Ensure data is loaded (no loading spinners)
- Show success states, not errors
- Include relevant badges/indicators

## Post-Processing (Optional)

### Add Marketing Overlay
Use tools like:
- **Figma/Sketch:** Add device frame + text overlay
- **Screenshot Framer:** https://screenshot.rocks
- **AppLaunchpad:** https://theapplaunchpad.com

### Example Template
```
┌─────────────────────────┐
│  [Device Frame]         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   [Screenshot]    │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Feature Title          │
│  Short description      │
└─────────────────────────┘
```

## Naming Convention
Use descriptive names with numbers:
```
01-dashboard.png
02-qr-scanner.png
03-savings.png
04-marketplace.png
05-fit-challenge.png
06-profile.png
07-transactions.png
08-notifications.png
```

## Quality Checklist
- [ ] Correct resolution for platform
- [ ] No debug info visible
- [ ] Realistic data displayed
- [ ] UI fully loaded
- [ ] Status bar clean
- [ ] Navigation visible
- [ ] Feature clearly demonstrated
- [ ] Text readable
- [ ] Proper file format (PNG/JPEG)
- [ ] File size optimized (<1MB per screenshot)

## Tools

### Screenshot Resize
```bash
# Using ImageMagick
convert input.png -resize 1080x1920 output.png

# Using Sharp (Node.js)
npm install sharp
node scripts/resize-screenshots.js
```

### Batch Processing
```bash
# Resize all screenshots
for f in *.png; do
  convert "$f" -resize 1080x1920 "resized-$f"
done
```

## Upload to Stores

### Google Play Console
1. Go to Store Presence > Main Store Listing
2. Upload 5-8 phone screenshots (1080x1920)
3. Optionally upload tablet screenshots
4. Save changes

### App Store Connect
1. Go to App Store > Screenshots
2. Select device size (6.5" required)
3. Upload 5-10 screenshots per size
4. Drag to reorder
5. Save

## Notes
- Screenshots should showcase key features
- First 2-3 screenshots are most important (appear in search)
- Update screenshots with each major release
- Consider A/B testing different screenshot orders
- Include localized screenshots if supporting multiple languages
