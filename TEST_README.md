# Testing Guide - Sinoman SuperApp

Comprehensive testing suite for the Sinoman mobile application.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)

## 🎯 Overview

Our testing strategy follows the testing pyramid:

```
         ┌─────────────┐
         │   E2E Tests │  (4 critical flows)
         ├─────────────┤
         │ Integration │  (API & Services - 80%+)
         ├─────────────┤
         │ Unit Tests  │  (Utils & Logic - 95%+)
         └─────────────┘
```

**Current Coverage Target:** 80% overall

## 📁 Test Structure

```
sinoman-mobile-app/
├── src/
│   ├── components/
│   │   └── common/
│   │       └── __tests__/
│   │           └── Button.test.tsx          # Component tests
│   ├── hooks/
│   │   └── __tests__/
│   │       ├── useNetworkStatus.test.ts    # Hook tests
│   │       └── useAnalytics.test.ts
│   ├── services/
│   │   ├── auth/
│   │   │   └── __tests__/
│   │   │       └── supabaseAuth.test.ts    # Service unit tests
│   │   └── __tests__/
│   │       └── integration/
│   │           └── authFlow.integration.test.ts  # Integration tests
│   └── utils/
│       └── __tests__/
│           ├── formatters.test.ts           # Utility tests
│           ├── validators.test.ts
│           └── logger.test.ts
├── e2e/
│   ├── auth.e2e.ts                          # E2E auth flow
│   ├── payment.e2e.ts                       # E2E payment flow
│   └── setup.ts                             # E2E helpers
├── jest.config.js                           # Jest configuration
├── jest.setup.js                            # Test setup & mocks
└── .detoxrc.js                              # Detox E2E config
```

## 🚀 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- formatters.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="formatPhoneNumber"
```

### E2E Tests

#### Android

```bash
# Build the app
npm run test:e2e:build:android

# Run E2E tests
npm run test:e2e:android

# Prerequisites:
# - Android emulator running (Pixel_5_API_31)
# - Android SDK installed
```

#### iOS

```bash
# Build the app
npm run test:e2e:build:ios

# Run E2E tests
npm run test:e2e:ios

# Prerequisites:
# - Xcode installed
# - iOS simulator available
# - CocoaPods dependencies installed
```

## ✍️ Writing Tests

### Unit Tests

**Utilities & Pure Functions:**

```typescript
// src/utils/__tests__/formatters.test.ts
import { formatCurrency } from '../formatters';

describe('formatCurrency', () => {
  it('should format with thousands separator', () => {
    expect(formatCurrency(1000000)).toBe('Rp 1.000.000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });
});
```

### Hook Tests

```typescript
// src/hooks/__tests__/useNetworkStatus.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  it('should return network status', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isChecking).toBe(false);
    });

    expect(result.current.isConnected).toBe(true);
  });
});
```

### Component Tests

```typescript
// src/components/common/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onPress when clicked', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button onPress={mockOnPress}>Click</Button>
    );

    fireEvent.press(getByText('Click'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<Button onPress={jest.fn()}>Test</Button>);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

### Integration Tests

```typescript
// src/services/__tests__/integration/authFlow.integration.test.ts
import { sendOtp, verifyOtp } from '@services/auth/supabaseAuth';

describe('Authentication Flow', () => {
  it('should complete registration flow', async () => {
    // Send OTP
    const sendResult = await sendOtp('081234567890');
    expect(sendResult.success).toBe(true);

    // Verify OTP
    const verifyResult = await verifyOtp('081234567890', '123456');
    expect(verifyResult.session).toBeTruthy();
  });
});
```

### E2E Tests

```typescript
// e2e/auth.e2e.ts
import { device, element, by, waitFor } from 'detox';

describe('Authentication', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete login flow', async () => {
    await element(by.id('phone-input')).typeText('081234567890');
    await element(by.id('send-otp-button')).tap();

    await waitFor(element(by.id('otp-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-otp-button')).tap();

    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

## 📊 Coverage Requirements

### Coverage Targets by Layer

| Layer        | Target | Priority |
|--------------|--------|----------|
| Utilities    | 95%+   | Critical |
| Services     | 85%+   | High     |
| Stores       | 80%+   | High     |
| Hooks        | 85%+   | High     |
| Components   | 75%+   | Medium   |
| E2E Flows    | 4 paths| High     |

### Critical E2E Flows

1. ✅ **Registration Flow**
   - Phone entry → OTP verification → Profile completion → Dashboard

2. ✅ **Login Flow**
   - Phone entry → OTP verification → Dashboard

3. ✅ **Payment Flow**
   - QR scan → Payment confirmation → PIN → Success receipt

4. 🚧 **Order Flow** (To be implemented)
   - Browse products → Add to cart → Checkout → Order confirmation

### Viewing Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Workflow Steps:**

1. **Lint & Type Check**
   - ESLint validation
   - TypeScript type checking

2. **Unit & Integration Tests**
   - Run all Jest tests
   - Generate coverage report
   - Upload to Codecov
   - Comment coverage on PRs

3. **E2E Tests** (Optional/Manual)
   - Android emulator tests
   - iOS simulator tests
   - Upload failure artifacts

### Coverage Reporting

Coverage reports are:
- ✅ Uploaded to Codecov
- ✅ Commented on pull requests
- ✅ Available as artifacts (7 days retention)

## 🛠️ Mocking Strategy

### Global Mocks (jest.setup.js)

- Expo modules (haptics, secure-store, notifications)
- React Native modules (AsyncStorage, NetInfo)
- Supabase client
- Sentry & Firebase
- Logger utilities

### Service Mocks

```typescript
// Mock Supabase in tests
jest.mock('@services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
```

## 📝 Best Practices

### DO ✅

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Test error cases and edge cases
- ✅ Mock external dependencies
- ✅ Clean up after tests (beforeEach/afterEach)
- ✅ Use snapshot tests for UI components
- ✅ Test accessibility features

### DON'T ❌

- ❌ Test third-party library internals
- ❌ Write flaky tests
- ❌ Mock everything (test real logic when possible)
- ❌ Skip tests without documenting why
- ❌ Commit failing tests
- ❌ Test implementation details

## 🐛 Debugging Tests

### Debug Single Test

```bash
# Run with verbose output
npm test -- --verbose formatters.test.ts

# Debug in VS Code
# Add breakpoint and run "Jest: Debug Test" from command palette
```

### Common Issues

**Issue:** Tests timeout
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Issue:** Mocks not working
```bash
# Clear Jest cache
npm test -- --clearCache
```

**Issue:** Snapshot mismatch
```bash
# Update snapshots
npm test -- -u
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox E2E Testing](https://wix.github.io/Detox/)
- [Testing Best Practices](https://testingjavascript.com/)

## 🎯 Test Coverage Summary

```bash
# Current test files created:
# ✅ 3 utility test files (formatters, validators, logger)
# ✅ 2 hook test files (useNetworkStatus, useAnalytics)
# ✅ 1 service test file (supabaseAuth)
# ✅ 1 integration test file (authFlow)
# ✅ 1 component test file (Button)
# ✅ 2 E2E test files (auth, payment)

Total: 10 test files
Expected coverage: 80%+ overall
```

---

**Last Updated:** 2025-10-02
**Maintained by:** Sinoman Development Team
