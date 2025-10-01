# ✅ First-Time Setup Checklist

Complete this checklist to ensure your Sinoman Mobile App development environment is fully configured.

## Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Expo CLI installed (`expo --version`)
  - If not: `npm install -g expo-cli`
- [ ] Expo Go app installed on phone (for testing)
- [ ] Git installed (`git --version`)

## Repository Setup

- [ ] Repository cloned
  ```bash
  git clone <repository-url>
  cd sinoman-mobile-app
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```

- [ ] TypeScript compiles without errors
  ```bash
  npm run type-check
  ```

## Asset Generation ⚠️ CRITICAL

Choose ONE method and complete:

### Method 1: Browser-Based (Recommended)
- [ ] Opened `scripts/generate-assets.html` in browser
- [ ] Generated icon.png and saved to `assets/` folder
- [ ] Generated splash.png and saved to `assets/` folder
- [ ] Generated adaptive-icon.png and saved to `assets/` folder
- [ ] Verified all 3 files exist: `ls assets/*.png`

### Method 2: Automated Script
- [ ] Installed sharp: `npm install sharp`
- [ ] Ran generation: `npm run generate-assets`
- [ ] Verified all 3 files created in `assets/` directory

### Verification
- [ ] `assets/icon.png` exists (1024x1024)
- [ ] `assets/splash.png` exists (1284x2778)
- [ ] `assets/adaptive-icon.png` exists (1024x1024)
- [ ] All files are valid PNG format
- [ ] Each file is > 10KB in size

## Environment Configuration

- [ ] Created `.env` file
  ```bash
  cp .env.example .env
  ```

- [ ] Updated Supabase URL in `.env`
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  ```

- [ ] Updated Supabase Anon Key in `.env`
  ```
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

- [ ] Verified `.env` file is in `.gitignore` (should not be committed)

## Supabase Setup (Backend)

- [ ] Supabase project created
- [ ] Database tables created:
  - [ ] `user_profiles`
  - [ ] `user_balances`
  - [ ] `transactions`
  - [ ] `merchants`
  - [ ] `user_notification_preferences`
- [ ] Storage bucket created:
  - [ ] `avatars` bucket (public access)
- [ ] Authentication enabled:
  - [ ] Phone authentication enabled
  - [ ] OTP settings configured

## Development Server

- [ ] Started Expo dev server
  ```bash
  expo start
  ```

- [ ] No fatal errors in terminal
- [ ] QR code displayed in terminal
- [ ] Metro bundler running successfully

## Mobile App Testing

- [ ] Opened Expo Go app on phone
- [ ] Scanned QR code from terminal
- [ ] App loaded on phone without errors
- [ ] Splash screen displayed correctly
- [ ] App icon shows up (may need to refresh)
- [ ] Login screen is accessible

## Optional: Platform-Specific Testing

### Android Testing
- [ ] Android Studio installed
- [ ] Android emulator configured
- [ ] App runs on Android emulator
  ```bash
  npm run android
  ```

### iOS Testing (Mac only)
- [ ] Xcode installed
- [ ] iOS Simulator configured
- [ ] App runs on iOS simulator
  ```bash
  npm run ios
  ```

## Code Quality Tools

- [ ] ESLint runs without errors
  ```bash
  npm run lint
  ```

- [ ] Prettier formats code correctly
  ```bash
  npm run format
  ```

- [ ] TypeScript types are correct
  ```bash
  npm run type-check
  ```

## Version Control

- [ ] Git user configured
  ```bash
  git config user.name "Your Name"
  git config user.email "your.email@example.com"
  ```

- [ ] Created feature branch (don't work on main)
  ```bash
  git checkout -b feature/your-feature-name
  ```

## Documentation Review

- [ ] Read [README.md](README.md)
- [ ] Read [ASSETS_SETUP.md](ASSETS_SETUP.md)
- [ ] Reviewed [QUICK_START.md](QUICK_START.md)
- [ ] Checked phase documentation in `docs/` folder:
  - [ ] [PHASE_3_COMPLETE.md](docs/PHASE_3_COMPLETE.md)
  - [ ] [PHASE_4_COMPLETE.md](docs/PHASE_4_COMPLETE.md)

## Troubleshooting Checklist

If you encounter issues, verify:

- [ ] All assets exist in `assets/` directory
- [ ] `.env` file has correct Supabase credentials
- [ ] Node modules are installed (`node_modules/` exists)
- [ ] Expo CLI is latest version: `npm install -g expo-cli@latest`
- [ ] Cache cleared: `expo start -c`
- [ ] Phone and computer on same WiFi network
- [ ] Expo Go app is updated to latest version
- [ ] No firewall blocking Metro bundler (port 8081)

## Common Issues & Solutions

### Issue: "Unable to resolve module"
**Solution**: Clear cache and restart
```bash
expo start -c
```

### Issue: Assets not found
**Solution**: Verify assets exist and restart
```bash
ls assets/*.png
expo start -c
```

### Issue: Supabase connection fails
**Solution**: Check .env credentials
```bash
cat .env
# Verify URLs and keys are correct
```

### Issue: Metro bundler fails
**Solution**: Clear watchman and reinstall
```bash
watchman watch-del-all
rm -rf node_modules
npm install
expo start -c
```

## Ready to Develop! 🎉

Once all items are checked, you're ready to start developing!

### Next Steps:

1. **Start coding**: Make changes to screens/components
2. **Test changes**: Hot reload will update app automatically
3. **Commit often**: Use conventional commit messages
4. **Create PR**: When feature is complete

### Useful Commands:

```bash
# Start development
expo start

# Run linting
npm run lint:fix

# Check types
npm run type-check

# Format code
npm run format
```

## Getting Help

If you're stuck after completing this checklist:

1. Check [ASSETS_SETUP.md](ASSETS_SETUP.md) troubleshooting section
2. Review phase documentation for specific features
3. Contact tech lead: tech@sinomanapp.id
4. WhatsApp support: +62 82331052577

---

**Setup Completed**: ____________ (Date)

**Completed By**: ____________ (Your Name)

**Notes/Issues**:
_______________________________________________________
_______________________________________________________
