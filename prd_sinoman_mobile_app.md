# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

# **Sinoman Mobile App**

## **Koperasi Sinoman Ponorogo - Digital Transformation Initiative**

## **DOCUMENT INFORMATION**

  -----------------------------------------------------------------------
  **Field**         **Details**
  ----------------- -----------------------------------------------------
  **Document        Sinoman Mobile App - Product Requirements Document
  Title**           

  **Version**       1.0

  **Date Created**  January 2025

  **Author**        Tim Pengembangan Koperasi Sinoman

  **Status**        APPROVED FOR DEVELOPMENT

  **Platform**      iOS & Android (React Native)

  **Timeline**      21 Days (3 Weeks)
  -----------------------------------------------------------------------

## **EXECUTIVE SUMMARY**

### **Project Overview**

Sinoman Mobile App adalah aplikasi mobile native untuk anggota Koperasi
Sinoman Ponorogo yang menyediakan akses mudah ke seluruh layanan
koperasi melalui smartphone. Aplikasi ini merupakan ekstensi dari
platform web yang sudah ada, dirancang khusus untuk pengalaman
mobile-first dengan fitur offline support dan native capabilities.

### **Business Objectives**

1.  **Meningkatkan Engagement**: Target 30% member adoption dalam 1
    bulan pertama (18,000 users)

2.  **Mempermudah Transaksi**: Reduce transaction time dari 5 menit
    menjadi 30 detik

3.  **Mendorong Partisipasi**: Increase daily active users sebesar 300%

4.  **Efisiensi Operasional**: Reduce customer service load sebesar 60%

### **Target Users**

- **Primary**: Anggota aktif Koperasi Sinoman (60,000 orang)

- **Demographics**: Usia 25-55 tahun, penduduk Ponorogo

- **Tech Savvy**: Medium (familiar dengan WhatsApp, mobile banking)

- **Device**: Android 85%, iOS 15%

### **Success Metrics**

  -------------------------------------------------------------------------
  **Metric**          **Target Month    **Target Month    **Target Month
                      1**               3**               6**
  ------------------- ----------------- ----------------- -----------------
  App Downloads       18,000            30,000            45,000

  Daily Active Users  6,000             12,000            20,000

  Transaction Volume  Rp 1 Miliar       Rp 3 Miliar       Rp 6 Miliar

  User Rating         4.0+ ⭐           4.3+ ⭐           4.5+ ⭐

  Crash Rate          \<1%              \<0.5%            \<0.3%
  -------------------------------------------------------------------------

## **PRODUCT STRATEGY**

### **Strategic Goals**

#### **Phase 1: MVP Launch (Week 1-3)**

- Deliver core functionality dengan quality tinggi

- Ensure stability dan performance

- Achieve product-market fit

#### **Phase 2: Growth (Month 2-3)**

- Scale to 30,000+ users

- Add advanced features

- Optimize berdasarkan user feedback

#### **Phase 3: Expansion (Month 4-6)**

- Regional expansion beyond Ponorogo

- B2B features untuk merchants

- AI-powered features

### **Value Proposition**

**\"Sehat Bareng, Kaya Bareng, Bareng Sinoman - Di Ujung Jari Anda\"**

1.  **Convenience**: Akses 24/7 ke semua layanan koperasi

2.  **Speed**: Transaksi instan dengan QR code

3.  **Transparency**: Real-time balance dan transaction history

4.  **Community**: Connect dengan 60,000 anggota lainnya

5.  **Rewards**: Points dan benefits untuk member aktif

### **Competitive Analysis**

## **USER PERSONAS**

### **Persona 1: Ibu Siti (35, Ibu Rumah Tangga)**

**Background:**

- Mengurus 2 anak, suami bekerja sebagai PNS

- Income keluarga: Rp 4 juta/bulan

- Aktif di arisan RT dan PKK

**Goals:**

- Kelola keuangan keluarga dengan efisien

- Beli kebutuhan dengan harga terjangkau

- Ikut program kesehatan untuk keluarga

**Pain Points:**

- Sulit tracking pengeluaran

- Harga kebutuhan pokok mahal

- Tidak ada waktu ke kantor koperasi

**Tech Profile:**

- Device: Samsung A52

- Apps used: WhatsApp, Instagram, BCA Mobile

- Comfort level: Medium

### **Persona 2: Pak Budi (42, Pedagang Warung)**

**Background:**

- Punya warung kelontong di kampung

- Income: Rp 6 juta/bulan

- Butuh modal untuk stock barang

**Goals:**

- Akses pinjaman modal cepat

- Beli stock dengan harga grosir

- Terima pembayaran digital

**Pain Points:**

- Proses pinjaman manual lama

- Margin tipis karena harga kulakan mahal

- Customers minta bayar non-tunai

**Tech Profile:**

- Device: Xiaomi Redmi Note 10

- Apps used: WhatsApp, Tokopedia, BRImo

- Comfort level: Medium-High

### **Persona 3: Mas Andi (28, Karyawan Pabrik)**

**Background:**

- Kerja shift di pabrik

- Income: Rp 3.5 juta/bulan

- Ingin hidup lebih sehat

**Goals:**

- Join Fit Challenge program

- Nabung untuk masa depan

- Beli protein dengan harga member

**Pain Points:**

- Jadwal shift bentrok dengan jam operasional koperasi

- Sulit konsisten olahraga

- Budget terbatas untuk makanan sehat

**Tech Profile:**

- Device: iPhone 11

- Apps used: Instagram, TikTok, Mobile Legends

- Comfort level: High

## **FUNCTIONAL REQUIREMENTS**

### **Feature List by Priority**

#### **P0 - Critical Features (Must Have for Launch)**

#### **P1 - Important Features (Week 2)**

#### **P2 - Nice to Have Features (Week 3)**

### **User Stories**

#### **Authentication Flow**

**As a** member\
**I want to** login quickly with my phone number\
**So that** I can access my account without remembering passwords

**Acceptance Criteria:**

- User can enter phone number with +62 prefix

- OTP is sent within 5 seconds

- OTP auto-reads from SMS (Android)

- Session persists for 30 days

- Biometric can be enabled after first login

#### **Savings Management**

**As a** member\
**I want to** see my savings balance and add money\
**So that** I can grow my savings conveniently

**Acceptance Criteria:**

- Balance shows breakdown: Pokok, Wajib, Sukarela

- Support multiple payment methods (Transfer, VA, E-wallet)

- Minimum top-up Rp 10,000

- Maximum top-up Rp 10,000,000

- Transaction receipt generated

- Balance updated real-time

#### **QR Payment**

**As a** member\
**I want to** pay merchants by scanning QR\
**So that** I can transact cashlessly

**Acceptance Criteria:**

- Camera permission handled gracefully

- QR recognized in \< 2 seconds

- Show merchant info before confirm

- Support offline queue if no connection

- Generate payment proof

- Deduct from savings balance

## **NON-FUNCTIONAL REQUIREMENTS**

### **Performance Requirements**

  -----------------------------------------------------------------------
  **Metric**         **Target**               **Measurement Method**
  ------------------ ------------------------ ---------------------------
  App Size           \< 30MB                  APK/IPA size

  Cold Start         \< 3 seconds             Time to interactive

  Screen Load        \< 1 second              Time to render

  API Response       \< 2 seconds             95th percentile

  Frame Rate         60 FPS                   Performance monitor

  Memory Usage       \< 200MB                 Runtime monitoring

  Battery Drain      \< 5%/hour active use    Device profiling
  -----------------------------------------------------------------------

### **Security Requirements**

1.  **Authentication & Authorization\**

    - JWT tokens with 1 hour expiry

    - Refresh token rotation

    - Biometric authentication (TouchID/FaceID/Fingerprint)

    - Auto-logout after 15 minutes inactivity

2.  **Data Protection\**

    - AES-256 encryption for sensitive data

    - Certificate pinning for API calls

    - Secure storage using Keychain/Keystore

    - No sensitive data in logs

3.  **Network Security\**

    - HTTPS only with TLS 1.3

    - API rate limiting (100 requests/minute)

    - Request signing with HMAC

    - Man-in-the-middle protection

4.  **Compliance\**

    - Indonesian Personal Data Protection Law

    - OJK regulations for financial services

    - PCI DSS for payment processing

    - ISO 27001 standards

### **Compatibility Requirements**

  --------------------------------------------------------------------------
  **Platform**   **Minimum Version**   **Target Devices**  **Market Share**
  -------------- --------------------- ------------------- -----------------
  Android        6.0 (API 23)          Phones & Tablets    94% coverage

  iOS            13.0                  iPhone & iPad       95% coverage
  --------------------------------------------------------------------------

### **Accessibility Requirements**

- WCAG 2.1 Level AA compliance

- Screen reader support (TalkBack/VoiceOver)

- Minimum touch target 44x44 points

- Color contrast ratio 4.5:1 minimum

- Font scaling support up to 200%

- RTL language support ready

### **Localization Requirements**

- Primary language: Bahasa Indonesia

- Number format: Indonesian (1.000.000)

- Currency: IDR (Rp)

- Date format: DD/MM/YYYY

- Time zone: WIB (UTC+7)

## **TECHNICAL ARCHITECTURE**

### **Technology Stack**

Frontend:

Framework: React Native 0.72

Language: TypeScript 5.0

Navigation: React Navigation 6

State Management: Zustand 4.4

Forms: React Hook Form 7.4

UI Components: React Native Paper 5.0

Backend Integration:

API: RESTful + GraphQL

Real-time: WebSocket

Database: Supabase (PostgreSQL)

Auth: Supabase Auth

Storage: Cloudinary

Development Tools:

Build Tool: Expo SDK 49

Testing: Jest + React Native Testing Library

Debugging: Flipper

CI/CD: GitHub Actions + EAS Build

Monitoring: Sentry + Firebase Analytics

### **System Architecture**

┌─────────────────────────────────┐

│ Mobile Devices │

│ (iOS / Android) │

└────────────┬────────────────────┘

│

▼

┌─────────────────────────────────┐

│ React Native App │

│ - UI Components │

│ - Business Logic │

│ - Local Storage │

└────────────┬────────────────────┘

│

▼

┌─────────────────────────────────┐

│ API Gateway │

│ - Authentication │

│ - Rate Limiting │

│ - Request Routing │

└────────────┬────────────────────┘

│

▼

┌─────────────────────────────────┐

│ Backend Services │

│ - Supabase │

│ - Payment Gateway │

│ - Notification Service │

└─────────────────────────────────┘

### **Data Flow**

1.  **Online Mode\**

    - Direct API calls to backend

    - Real-time updates via WebSocket

    - Immediate data synchronization

2.  **Offline Mode\**

    - Local database (SQLite/MMKV)

    - Queue operations in storage

    - Sync when connection restored

    - Conflict resolution strategy

### **API Specifications**

#### **Authentication Endpoints**

POST /api/auth/send-otp

Request: { phone: string }

Response: { success: boolean, message: string }

POST /api/auth/verify-otp

Request: { phone: string, otp: string }

Response: { token: string, refreshToken: string, user: User }

POST /api/auth/refresh

Request: { refreshToken: string }

Response: { token: string, refreshToken: string }

POST /api/auth/logout

Request: { token: string }

Response: { success: boolean }

#### **Savings Endpoints**

GET /api/savings/balance

Headers: Authorization: Bearer {token}

Response: {

pokok: number,

wajib: number,

sukarela: number,

total: number

}

POST /api/savings/topup

Headers: Authorization: Bearer {token}

Request: {

type: \'pokok\' \| \'wajib\' \| \'sukarela\',

amount: number,

paymentMethod: string

}

Response: {

transactionId: string,

status: \'pending\' \| \'success\' \| \'failed\',

balance: Balance

}

GET /api/savings/transactions

Headers: Authorization: Bearer {token}

Query: { page: number, limit: number, type?: string }

Response: {

data: Transaction\[\],

pagination: {

page: number,

totalPages: number,

total: number

}

}

## **USER INTERFACE DESIGN**

### **Design Principles**

1.  **Simple & Intuitive**: Minimize cognitive load

2.  **Consistent**: Follow material design / iOS HIG

3.  **Accessible**: Support all users including disabilities

4.  **Fast**: Instant feedback for all actions

5.  **Delightful**: Micro-animations and transitions

### **Information Architecture**

App

├── Auth Flow

│ ├── Splash Screen

│ ├── Login Screen

│ ├── OTP Verification

│ └── Registration

├── Main Flow

│ ├── Dashboard (Home)

│ ├── Savings

│ │ ├── Balance Overview

│ │ ├── Top Up

│ │ ├── Withdraw

│ │ └── History

│ ├── QR Scanner

│ │ ├── Scan Mode

│ │ └── My QR Code

│ ├── Marketplace

│ │ ├── Product List

│ │ ├── Product Detail

│ │ ├── Cart

│ │ └── Checkout

│ └── Profile

│ ├── Personal Info

│ ├── Settings

│ └── Logout

└── Secondary Flows

├── Fit Challenge

├── Referral

└── Notifications

### **Screen Specifications**

#### **Dashboard Screen**

- **Purpose**: Central hub for all features

- **Key Elements**:

  - Greeting with user name

  - Balance card (glassmorphism effect)

  - Quick action buttons (4 grid)

  - Recent transactions (last 5)

  - Promotional banner carousel

#### **Savings Screen**

- **Purpose**: Manage all savings accounts

- **Key Elements**:

  - Tab selector (Pokok/Wajib/Sukarela)

  - Current balance display

  - Monthly chart visualization

  - Top-up and withdraw buttons

  - Transaction history list

#### **QR Scanner Screen**

- **Purpose**: Universal QR code scanner

- **Key Elements**:

  - Camera viewfinder

  - Scan area indicator

  - Flash toggle

  - Gallery picker option

  - Switch to \"My QR\" tab

### **Design System**

#### **Color Palette**

Primary Colors:

\- Primary Green: #059669

\- Primary Dark: #047857

\- Primary Light: #10B981

Secondary Colors:

\- Amber: #F59E0B

\- Amber Dark: #D97706

\- Amber Light: #FCD34D

Semantic Colors:

\- Success: #22C55E

\- Warning: #F59E0B

\- Error: #EF4444

\- Info: #3B82F6

Neutral Colors:

\- Black: #000000

\- Gray 900: #111827

\- Gray 700: #374151

\- Gray 500: #6B7280

\- Gray 300: #D1D5DB

\- Gray 100: #F3F4F6

\- White: #FFFFFF

#### **Typography**

Font Family: Inter

Heading 1: 32px, Bold

Heading 2: 24px, Semibold

Heading 3: 20px, Semibold

Body Large: 18px, Regular

Body Base: 16px, Regular

Body Small: 14px, Regular

Caption: 12px, Regular

#### **Spacing System**

Base unit: 4px

Spacing scale:

\- xs: 4px

\- sm: 8px

\- md: 16px

\- lg: 24px

\- xl: 32px

\- 2xl: 48px

\- 3xl: 64px

#### **Component Library**

1.  **Buttons\**

    - Primary: Green background, white text

    - Secondary: White background, green border

    - Ghost: Transparent background, green text

    - Sizes: Small (32px), Medium (44px), Large (56px)

2.  **Cards\**

    - Standard: White background, 8px radius, subtle shadow

    - Elevated: 16px radius, medium shadow

    - Glassmorphism: Blur effect, transparency

3.  **Input Fields\**

    - Text input with floating label

    - 44px minimum height

    - Clear error states

    - Helper text support

4.  **Bottom Navigation\**

    - 5 items with center emphasis

    - Active state with color change

    - Badge support for notifications

## **DEVELOPMENT ROADMAP**

### **Timeline Overview**

Week 1: Foundation & Core Features

├── Day 1-2: Project Setup & Architecture

├── Day 3-4: Authentication System

└── Day 5-7: Dashboard & Savings

Week 2: Feature Completion

├── Day 8-10: QR Scanner & Payments

├── Day 11-12: Marketplace

└── Day 13-14: Fit Challenge & Profile

Week 3: Polish & Deployment

├── Day 15-16: UI/UX Polish

├── Day 17-18: Testing & Bug Fixes

└── Day 19-21: Build & Deploy

### **Detailed Sprint Plan**

#### **Sprint 1 (Day 1-7): Core Foundation**

**Goals**: Setup complete, authentication working, basic features

**Deliverables**:

- Development environment configured

- Project structure established

- Authentication flow complete

- Dashboard screen functional

- Savings management working

- Basic navigation implemented

**Success Criteria**:

- User can register and login

- OTP verification working

- Dashboard displays real data

- Savings balance accurate

- No critical bugs

#### **Sprint 2 (Day 8-14): Feature Development**

**Goals**: All P0 and P1 features implemented

**Deliverables**:

- QR scanner operational

- Payment flow complete

- Marketplace browsable

- Cart and checkout working

- Fit Challenge check-in ready

- Push notifications configured

**Success Criteria**:

- QR scan in \< 2 seconds

- Payment processing works

- Products load correctly

- Orders can be placed

- Notifications received

#### **Sprint 3 (Day 15-21): Polish & Launch**

**Goals**: Production-ready application

**Deliverables**:

- UI/UX improvements

- Performance optimization

- Comprehensive testing

- Bug fixes completed

- Store listings prepared

- Production builds uploaded

**Success Criteria**:

- 0 critical bugs

- Performance targets met

- Store approval received

- Monitoring active

- Launch successful

## **TESTING STRATEGY**

### **Testing Types**

1.  **Unit Testing\**

    - Coverage target: 80%

    - Tools: Jest, React Native Testing Library

    - Focus: Business logic, utilities, calculations

2.  **Integration Testing\**

    - API integration tests

    - Database operations

    - Third-party services

3.  **E2E Testing\**

    - Critical user flows

    - Tools: Detox

    - Scenarios: Registration, Login, Payment, Order

4.  **Performance Testing\**

    - Load testing with 1000+ concurrent users

    - Memory leak detection

    - Battery usage profiling

5.  **Security Testing\**

    - Penetration testing

    - OWASP mobile top 10

    - Data encryption verification

### **Test Cases (Priority)**

  --------------------------------------------------------------------------
  **Test ID** **Feature**    **Test Case**                    **Priority**
  ----------- -------------- -------------------------------- --------------
  TC001       Login          Valid phone number login         P0

  TC002       Login          Invalid phone number             P0

  TC003       OTP            Correct OTP verification         P0

  TC004       OTP            Incorrect OTP handling           P0

  TC005       Dashboard      Balance display accuracy         P0

  TC006       Savings        Top-up transaction               P0

  TC007       QR             Scan valid QR code               P0

  TC008       QR             Handle invalid QR                P1

  TC009       Offline        Queue transaction offline        P1

  TC010       Sync           Sync when online                 P1
  --------------------------------------------------------------------------

### **Device Testing Matrix**

  --------------------------------------------------------------------------
  **Device Type**             **OS Version**  **Screen Size** **Priority**
  --------------------------- --------------- --------------- --------------
  Samsung A52                 Android 12      6.5\"           P0

  Xiaomi Redmi Note 10        Android 11      6.43\"          P0

  iPhone 11                   iOS 15          6.1\"           P0

  iPhone 13 Pro               iOS 16          6.1\"           P1

  iPad (9th gen)              iPadOS 15       10.2\"          P2
  --------------------------------------------------------------------------

## **DEPLOYMENT STRATEGY**

### **Build Configuration**

#### **Android**

{

\"android\": {

\"package\": \"id.co.sinoman.mobile\",

\"versionCode\": 1,

\"targetSdkVersion\": 33,

\"minSdkVersion\": 23,

\"permissions\": \[

\"CAMERA\",

\"USE_FINGERPRINT\",

\"USE_BIOMETRIC\",

\"RECEIVE_BOOT_COMPLETED\"

\]

}

}

#### **iOS**

{

\"ios\": {

\"bundleIdentifier\": \"id.co.sinoman.mobile\",

\"buildNumber\": \"1.0.0\",

\"supportsTablet\": true,

\"infoPlist\": {

\"NSCameraUsageDescription\": \"Camera access for QR scanning\",

\"NSFaceIDUsageDescription\": \"Face ID for secure login\"

}

}

}

### **Release Process**

1.  **Development Build\**

    - Branch: develop

    - Environment: Staging

    - Distribution: Internal testing

2.  **Beta Release\**

    - Branch: release/v1.0

    - Environment: Production

    - Distribution: TestFlight / Play Console Beta

3.  **Production Release\**

    - Branch: main

    - Environment: Production

    - Distribution: App Store / Play Store

### **Monitoring & Analytics**

1.  **Crash Reporting**: Sentry

2.  **Analytics**: Firebase Analytics

3.  **Performance**: Firebase Performance

4.  **User Behavior**: Mixpanel

5.  **Backend Monitoring**: Supabase Dashboard

## **RISK ANALYSIS**

### **Technical Risks**

### **Business Risks**

### **Operational Risks**

## **SUCCESS CRITERIA**

### **Launch Success Metrics**

**Week 1 Post-Launch**

- \[ \] 3,000+ app downloads

- \[ \] 1,500+ registered users

- \[ \] \<1% crash rate

- \[ \] 4.0+ app store rating

- \[ \] 500+ daily active users

**Month 1 Post-Launch**

- \[ \] 18,000+ total downloads

- \[ \] 10,000+ registered users

- \[ \] 30% daily active rate

- \[ \] Rp 1 Billion transaction volume

- \[ \] 4.3+ app store rating

**Month 3 Post-Launch**

- \[ \] 30,000+ total downloads

- \[ \] 20,000+ registered users

- \[ \] 40% daily active rate

- \[ \] Rp 3 Billion transaction volume

- \[ \] 4.5+ app store rating

### **Business Impact Metrics**

1.  **Member Satisfaction\**

    - NPS Score \> 50

    - Support ticket reduction 60%

    - Feature adoption rate \> 70%

2.  **Financial Impact\**

    - Transaction processing cost -40%

    - Revenue per user +25%

    - Operational efficiency +50%

3.  **Growth Metrics\**

    - Member acquisition cost \< Rp 10,000

    - Referral rate \> 20%

    - Retention rate \> 80%

## **BUDGET ESTIMATION**

### **Development Costs**

  ------------------------------------------------------------------------
  **Category**                    **Cost (IDR)**  **Notes**
  ------------------------------- --------------- ------------------------
  Developer Account - Google      400,000         One-time payment

  Developer Account - Apple       1,500,000       Annual subscription

  Cloud Services (3 months)       3,000,000       Supabase, Cloudinary

  Testing Devices                 0               Use team devices

  Marketing & Launch              5,000,000       Social media, events

  **Total Initial Investment**    **9,900,000**   \~\$650 USD
  ------------------------------------------------------------------------

### **Operational Costs (Monthly)**

  -----------------------------------------------------------------------
  **Category**              **Cost (IDR)**  **Scale**
  ------------------------- --------------- -----------------------------
  Cloud Infrastructure      1,000,000       Up to 10k users

  Third-party Services      500,000         Payment gateway, SMS

  Monitoring Tools          300,000         Sentry, Analytics

  **Total Monthly**         **1,800,000**   \~\$120 USD
  -----------------------------------------------------------------------

### **ROI Projection**

  ------------------------------------------------------------------------
  **Metric**               **Month 1**     **Month 3**     **Month 6**
  ------------------------ --------------- --------------- ---------------
  Investment               9,900,000       15,300,000      24,600,000

  Revenue from App         5,000,000       20,000,000      50,000,000

  Cost Savings             3,000,000       10,000,000      25,000,000

  **Net Benefit**          -1,900,000      14,700,000      50,400,000

  **ROI**                  -19%            96%             205%
  ------------------------------------------------------------------------

## **MAINTENANCE & SUPPORT**

### **Post-Launch Support Plan**

#### **Week 1-2 (Hypercare)**

- 24/7 monitoring

- Daily standup meetings

- Immediate hotfix deployment

- Direct user support channel

#### **Month 1-3 (Stabilization)**

- Business hours support

- Weekly updates

- Performance optimization

- Feature refinements

#### **Month 3+ (BAU)**

- Standard support hours

- Bi-weekly updates

- Quarterly major releases

- Continuous improvement

### **Update Strategy**

1.  **Hotfixes**: Within 24 hours for critical issues

2.  **Minor Updates**: Bi-weekly for bugs and small features

3.  **Major Updates**: Quarterly for new features

4.  **OS Updates**: Within 30 days of new OS release

### **Documentation**

1.  **Technical Documentation\**

    - API documentation

    - Database schema

    - Architecture diagrams

    - Deployment guides

2.  **User Documentation\**

    - User manual

    - FAQ section

    - Video tutorials

    - In-app help

3.  **Operational Documentation\**

    - Support procedures

    - Incident response plan

    - Monitoring dashboards

    - Performance benchmarks

## **APPENDICES**

### **A. Glossary**

  -----------------------------------------------------------------------
  **Term**                    **Definition**
  --------------------------- -------------------------------------------
  Anggota                     Member of the cooperative

  Simpanan Pokok              Principal savings (one-time)

  Simpanan Wajib              Mandatory monthly savings

  Simpanan Sukarela           Voluntary savings

  SHU                         Sisa Hasil Usaha (profit sharing)

  Fit Challenge               8-week health program

  Bank Sampah                 Waste bank system
  -----------------------------------------------------------------------

### **B. References**

1.  Koperasi Sinoman AD/ART Document

2.  React Native Documentation (https://reactnative.dev)

3.  Supabase Documentation (https://supabase.io/docs)

4.  Material Design Guidelines (https://material.io)

5.  iOS Human Interface Guidelines (https://developer.apple.com/design)

### **C. Change Log**

  ----------------------------------------------------------------------------
  **Version**   **Date**      **Changes**                 **Author**
  ------------- ------------- --------------------------- --------------------
  0.1           Jan 1, 2025   Initial draft               Development Team

  0.5           Jan 5, 2025   Added technical specs       Tech Lead

  1.0           Jan 10, 2025  Approved for development    Product Owner
  ----------------------------------------------------------------------------

### **D. Approval Matrix**

  ----------------------------------------------------------------------------
  **Stakeholder**         **Role**           **Signature**        **Date**
  ----------------------- ------------------ -------------------- ------------
  Bestari Anwar           Founder            \_\_\_\_\_\_\_\_\_   \_\_\_\_\_

  Product Owner           Product            \_\_\_\_\_\_\_\_\_   \_\_\_\_\_

  Tech Lead               Technology         \_\_\_\_\_\_\_\_\_   \_\_\_\_\_

  QA Lead                 Quality            \_\_\_\_\_\_\_\_\_   \_\_\_\_\_
  ----------------------------------------------------------------------------

## **CONTACT INFORMATION**

**Project Team**

- Product Owner: \[Bestar Anwar\] - product@sinomanapp.id

- Tech Lead: \[Bestar Anwar\] - tech@sinomanapp.id

- UX Designer: \[Bestar Anwar\] - design@sinomanapp.id

- QA Lead: \[Bestar Anwar\] - qa@sinomanapp.id

**Support Channels**

- Email: support@sinomanapp.id

- WhatsApp: +62 82331052577

- Help Center: https://help.sinomanapp.id

*This document is proprietary and confidential to Koperasi Sinoman
Ponorogo. Distribution is limited to authorized personnel only.*

**END OF DOCUMENT**
