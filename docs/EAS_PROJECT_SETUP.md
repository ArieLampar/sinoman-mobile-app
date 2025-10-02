# EAS Project Setup Guide

This guide explains how to obtain and configure your EAS (Expo Application Services) project ID.

## Why is EAS Project ID Required?

The EAS project ID is a unique identifier (UUID) that links your local app to your Expo project on the cloud. It's required for:

- **EAS Build**: Building your app in the cloud
- **EAS Submit**: Submitting to app stores
- **EAS Update**: Over-the-air updates
- **Push Notifications**: Expo push notification service

## Step 1: Create EAS Project

### Option A: Using `eas init` (Recommended)

```bash
# Login to Expo
eas login

# Initialize EAS project (creates project and gets ID)
eas init
```

**What happens:**
1. Prompts you to create a new project or link to existing one
2. Creates project on Expo servers
3. Displays the project ID in the terminal
4. Optionally adds the ID to `app.json` automatically

**Example output:**
```
✔ What would you like your Expo project to be called? … sinoman-mobile-app
✔ Created Expo project: sinoman-mobile-app

Project ID: 12345678-1234-1234-1234-123456789abc

The project ID has been added to your app.json
```

### Option B: Manual Creation via Web

1. Go to https://expo.dev
2. Login to your account
3. Click "Create a project"
4. Name it: `sinoman-mobile-app`
5. Copy the project ID from the project settings

## Step 2: Add Project ID to app.json

Update your `app.json` file with the EAS project ID:

```json
{
  "expo": {
    "name": "Sinoman Mobile App",
    "slug": "sinoman-mobile-app",
    // ... other config ...
    "extra": {
      "sentryDsn": "https://your-key@sentry.io/your-project-id",
      "eas": {
        "projectId": "12345678-1234-1234-1234-123456789abc"
      }
    }
  }
}
```

**Important**: Replace `"12345678-1234-1234-1234-123456789abc"` with your actual project ID.

## Step 3: Verify Configuration

### Check if Project ID is Set

```bash
# View project configuration
eas config

# Expected output should show your project ID
```

### Verify in app.json

```bash
# Check if project ID exists in app.json
grep -A 3 '"eas"' app.json

# Expected output:
# "eas": {
#   "projectId": "your-actual-project-id"
# }
```

## Finding Your Project ID Later

If you've already created the project but need to find the ID:

### Method 1: Via EAS CLI
```bash
eas project:info
```

### Method 2: Via Expo Website
1. Go to https://expo.dev
2. Select your project: `sinoman-mobile-app`
3. Go to Project Settings
4. Copy the Project ID (UUID format)

### Method 3: Via expo.dev URL
The project ID is in the URL when viewing your project:
```
https://expo.dev/accounts/[your-account]/projects/sinoman-mobile-app/builds

The UUID in the URL is your project ID
```

## Common Issues & Solutions

### Issue 1: "No project ID found"

**Error:**
```
Error: No Expo project ID found in app.json
```

**Solution:**
1. Run `eas init` to create/link project
2. Manually add project ID to `app.json` under `expo.extra.eas.projectId`

### Issue 2: "Project not found"

**Error:**
```
Error: Project with ID xxx not found
```

**Solution:**
1. Verify project ID is correct (UUID format: 8-4-4-4-12 characters)
2. Check you're logged into the correct Expo account: `eas whoami`
3. Create new project: `eas init`

### Issue 3: Multiple Projects

If you have multiple Expo accounts or projects:

```bash
# List all your projects
eas project:list

# Switch to specific project
eas init --id your-project-id
```

## Project ID Format

Valid EAS project ID format:
- **Format**: UUID (Universally Unique Identifier)
- **Pattern**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Example**: `f1e2d3c4-5a6b-7c8d-9e0f-1a2b3c4d5e6f`
- **Length**: 36 characters (32 hex + 4 hyphens)

**Invalid formats:**
- ❌ `my-project` (not a UUID)
- ❌ `12345` (too short)
- ❌ `your-eas-project-id` (placeholder text)

## Environment-Specific Project IDs

For different environments (dev, staging, production), you can use different project IDs:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "f1e2d3c4-5a6b-7c8d-9e0f-1a2b3c4d5e6f"
      }
    }
  }
}
```

Or use environment variables (advanced):
```bash
# In eas.json
{
  "build": {
    "production": {
      "env": {
        "EAS_PROJECT_ID": "prod-project-id"
      }
    }
  }
}
```

## Next Steps

After configuring your EAS project ID:

1. ✅ Verify configuration: `eas config`
2. ✅ Configure build profiles: `eas build:configure`
3. ✅ Test build: `eas build --profile development --platform android`
4. ✅ Submit to stores: `eas submit --platform all`

## Security Considerations

### Safe to Commit
✅ **EAS Project ID is safe to commit** to version control. It's a public identifier.

### Keep Secret
❌ **DO NOT commit** these sensitive values:
- Build credentials (keystore, certificates)
- API keys (Supabase, Sentry, etc.)
- Service account keys
- Firebase config files

## Helpful Commands

```bash
# Login to Expo
eas login

# Create/link project
eas init

# View project info
eas project:info

# List all projects
eas project:list

# View configuration
eas config

# Configure builds
eas build:configure

# Test configuration
eas build --profile development --platform android --dry-run
```

## Resources

- **EAS Documentation**: https://docs.expo.dev/eas/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Expo Dashboard**: https://expo.dev

## Support

If you encounter issues:

1. Check EAS status: https://status.expo.dev
2. Review logs: `eas build:list` and view build details
3. Community: https://forums.expo.dev
4. Discord: https://chat.expo.dev

---

**Last Updated**: October 2, 2025
**Required for**: EAS Build, EAS Submit, Push Notifications
