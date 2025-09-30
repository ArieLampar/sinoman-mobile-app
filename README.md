# Sinoman Mobile App

Mobile application untuk anggota Koperasi Sinoman Ponorogo yang menyediakan akses mudah ke seluruh layanan koperasi melalui smartphone.

## Tech Stack

- **Framework**: Expo SDK 49 + React Native 0.72
- **Language**: TypeScript 5.0
- **Navigation**: React Navigation 6
- **State Management**: Zustand 4.4
- **UI Library**: React Native Paper 5.0
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Cloudinary

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (untuk testing di device)
- Android Studio atau Xcode (untuk native builds)

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd sinoman-mobile-app
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan actual Supabase credentials
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### 4. Scan QR Code

- Install Expo Go dari Play Store (Android) atau App Store (iOS)
- Scan QR code dari terminal
- App akan load di device Anda

## Project Structure

```
sinoman-mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components (Button, Card, Input)
│   │   ├── layout/       # Layout components (Container, Header)
│   │   └── forms/        # Form-specific components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Dashboard screens
│   │   ├── savings/      # Savings management
│   │   ├── qr/           # QR Scanner
│   │   ├── marketplace/  # Marketplace screens
│   │   └── profile/      # Profile & settings
│   ├── navigation/       # React Navigation setup
│   ├── services/         # Business logic & API
│   │   ├── api/          # API client
│   │   ├── auth/         # Auth service
│   │   └── supabase/     # Supabase client
│   ├── store/            # Zustand state management
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── theme/            # Design system
├── assets/               # Images, fonts, icons
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Path aliases configured (@components, @screens, etc.)
- 100 character line length limit

### Commit Convention

Follow conventional commits:

```
feat: add QR scanner functionality
fix: resolve navigation issue on Android
docs: update README with setup instructions
style: format code with prettier
refactor: restructure auth service
test: add unit tests for validators
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Supabase Configuration (shared dengan PWA)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (optional)
EXPO_PUBLIC_API_URL=https://api.sinoman.co.id

# Environment
EXPO_PUBLIC_ENV=development
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Building for Production

### Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## Deployment

### Prerequisites

- EAS CLI installed (`npm install -g eas-cli`)
- EAS account configured
- App Store Connect account (iOS)
- Google Play Console account (Android)

### Steps

1. Configure EAS: `eas build:configure`
2. Build: `eas build --platform all`
3. Submit: `eas submit --platform all`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - Koperasi Sinoman Ponorogo

## Contact

- **Product Owner**: Bestar Anwar - product@sinomanapp.id
- **Tech Lead**: Bestar Anwar - tech@sinomanapp.id
- **Support**: support@sinomanapp.id
- **WhatsApp**: +62 82331052577
- **Help Center**: https://help.sinomanapp.id

---

**Status**: Phase 1 - Foundation Setup Complete ✅

**Next Phase**: Authentication System (Phone + OTP + Biometric)