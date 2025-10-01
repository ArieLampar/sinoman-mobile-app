# Git History Cleanup - Remove Sensitive Files

**⚠️ WARNING**: This process rewrites git history. All team members will need to re-clone the repository.

**Date**: 2025-10-01
**Purpose**: Remove `google-services.json` and `GoogleService-Info.plist` from git history

---

## Table of Contents

1. [Overview](#overview)
2. [Before You Start](#before-you-start)
3. [Files to Remove](#files-to-remove)
4. [Method 1: BFG Repo-Cleaner (Recommended)](#method-1-bfg-repo-cleaner-recommended)
5. [Method 2: git filter-branch (Traditional)](#method-2-git-filter-branch-traditional)
6. [Method 3: git filter-repo (Modern)](#method-3-git-filter-repo-modern)
7. [Post-Cleanup Steps](#post-cleanup-steps)
8. [Team Communication](#team-communication)
9. [Verification](#verification)
10. [Prevention](#prevention)

---

## Overview

### Why This Is Needed

GitHub has detected exposed Google API keys in the repository from commit `95b5c39d`. While Firebase API keys are technically designed to be public (embedded in mobile apps), best practice dictates:

1. **Remove from git history** to avoid GitHub security alerts
2. **Add to `.gitignore`** to prevent future commits (✅ Already done)
3. **Restrict API keys** in Google Cloud Console (see [docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md))
4. **Use template files** for team collaboration

### What This Process Does

- **Removes files** from all commits in history
- **Rewrites commit hashes** - all commits will have new SHA-1 hashes
- **Requires force push** - overwrites remote repository history
- **Requires team re-clone** - all team members must re-clone after cleanup

---

## Before You Start

### Prerequisites

- [ ] **Backup repository** - Create a backup clone before proceeding
- [ ] **Coordinate with team** - Schedule cleanup during maintenance window
- [ ] **Verify `.gitignore`** - Files already added to `.gitignore` (✅ Done in this project)
- [ ] **Admin access** - You need push permission to rewrite history

### Backup Repository

```bash
# Create backup
cd ..
git clone --mirror c:\Dev\Projects\sinoman-mobile-app sinoman-mobile-app-backup.git
cd sinoman-mobile-app

# If something goes wrong, restore from backup:
# cd ..
# rm -rf sinoman-mobile-app
# git clone sinoman-mobile-app-backup.git sinoman-mobile-app
```

### Schedule Maintenance Window

Recommended time: **Off-peak hours** (weekend or evening)

Duration: **30-60 minutes** (including team notification and verification)

---

## Files to Remove

### Target Files

1. **google-services.json** (Android Firebase config)
   - First committed in: `95b5c39d` or earlier
   - Location: Project root
   - Contains: Google API key for Android

2. **GoogleService-Info.plist** (iOS Firebase config)
   - May or may not exist in history
   - Location: Project root (if exists)
   - Contains: Google API key for iOS

### Verify Files Exist in History

```bash
# Check if google-services.json is in history
git log --all --full-history --oneline -- google-services.json

# Check if GoogleService-Info.plist is in history
git log --all --full-history --oneline -- GoogleService-Info.plist
```

If command returns commits, the file needs to be removed.

---

## Method 1: BFG Repo-Cleaner (Recommended)

### Why BFG?

- ✅ **Fastest** - 10-720x faster than `git filter-branch`
- ✅ **Safest** - Preserves latest commit, only cleans history
- ✅ **Simplest** - One command does it all
- ✅ **Industry standard** - Used by GitHub, GitLab, etc.

### Step 1: Install BFG

**Download**:
```bash
# Visit: https://rtyley.github.io/bfg-repo-cleaner/
# Download: bfg-1.14.0.jar (or latest version)

# On Windows, place in a convenient location like:
# C:\Tools\bfg-1.14.0.jar
```

**Verify Java installed**:
```bash
java -version
# Should show Java 8 or higher
# If not installed, download from: https://www.java.com/download/
```

### Step 2: Create Mirror Clone

```bash
# Navigate to parent directory
cd ..

# Create mirror clone (bare repository)
git clone --mirror https://github.com/your-org/sinoman-mobile-app.git sinoman-mobile-app-cleanup.git
cd sinoman-mobile-app-cleanup.git
```

### Step 3: Run BFG

```bash
# Remove google-services.json from history
java -jar C:\Tools\bfg-1.14.0.jar --delete-files google-services.json

# Remove GoogleService-Info.plist from history (if exists)
java -jar C:\Tools\bfg-1.14.0.jar --delete-files GoogleService-Info.plist
```

**Expected output**:
```
Using repo : C:\Dev\sinoman-mobile-app-cleanup.git

Found X commits
Found X blobs
Cleaning
Updating references
...
BFG run is complete!
```

### Step 4: Clean Up Repository

```bash
# Expire reflog entries
git reflog expire --expire=now --all

# Garbage collect to remove unreferenced objects
git gc --prune=now --aggressive
```

### Step 5: Verify Cleanup

```bash
# Verify files are gone from history
git log --all --full-history -- google-services.json
# Should return nothing

git log --all --full-history -- GoogleService-Info.plist
# Should return nothing
```

### Step 6: Force Push

**⚠️ WARNING**: This will rewrite remote repository history!

```bash
# Push cleaned history to remote
git push --force
```

---

## Method 2: git filter-branch (Traditional)

### Why filter-branch?

- ⚠️ **Slower** than BFG (720x slower on large repos)
- ⚠️ **More complex** - requires careful command construction
- ✅ **Built-in** - No external tools required
- ✅ **Well-documented** - Official Git command

### Step 1: Remove google-services.json

```bash
# Remove from all branches and history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch google-services.json" \
  --prune-empty --tag-name-filter cat -- --all
```

### Step 2: Remove GoogleService-Info.plist

```bash
# Remove from all branches and history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch GoogleService-Info.plist" \
  --prune-empty --tag-name-filter cat -- --all
```

### Step 3: Clean Up

```bash
# Remove backup refs
rm -rf .git/refs/original/

# Expire reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive
```

### Step 4: Verify and Push

```bash
# Verify files removed
git log --all --full-history -- google-services.json
# Should return nothing

# Force push
git push --force --all
git push --force --tags
```

---

## Method 3: git filter-repo (Modern)

### Why filter-repo?

- ✅ **Modern** - Replacement for `git filter-branch`
- ✅ **Fast** - Similar performance to BFG
- ✅ **Flexible** - Powerful filtering options
- ⚠️ **Requires installation** - Not built into Git

### Step 1: Install git-filter-repo

**Windows**:
```bash
# Using Python pip
pip install git-filter-repo

# Or download from: https://github.com/newren/git-filter-repo
```

**macOS**:
```bash
brew install git-filter-repo
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt install git-filter-repo

# Or use pip
pip3 install git-filter-repo
```

### Step 2: Create Fresh Clone

```bash
cd ..
git clone https://github.com/your-org/sinoman-mobile-app.git sinoman-mobile-app-cleanup
cd sinoman-mobile-app-cleanup
```

### Step 3: Run git-filter-repo

```bash
# Remove both files from history
git filter-repo --path google-services.json --invert-paths
git filter-repo --path GoogleService-Info.plist --invert-paths
```

### Step 4: Push to Remote

```bash
# Add remote (filter-repo removes remotes for safety)
git remote add origin https://github.com/your-org/sinoman-mobile-app.git

# Force push
git push --force --all
git push --force --tags
```

---

## Post-Cleanup Steps

### 1. Verify Cleanup Success

```bash
# In your main repository
cd c:\Dev\Projects\sinoman-mobile-app

# Pull cleaned history
git fetch origin
git reset --hard origin/main

# Verify files are gone from history
git log --all --full-history -- google-services.json
# Should return: nothing

# Verify files are in .gitignore
cat .gitignore | grep google-services
# Should show: google-services.json and GoogleService-Info.plist

# Verify current working directory doesn't have them tracked
git status
# Should NOT show google-services.json or GoogleService-Info.plist as tracked
```

### 2. Verify `.gitignore` is Configured

```bash
# Check .gitignore contains Firebase files (should already be there)
cat .gitignore | grep -A2 "Firebase"

# Expected output:
# # Firebase / Google Services Configuration Files
# google-services.json
# GoogleService-Info.plist
```

### 3. Recreate Local Config Files

```bash
# Copy template files
cp google-services.json.example google-services.json
cp GoogleService-Info.plist.example GoogleService-Info.plist

# Download actual files from Firebase Console
# (See README.md or SETUP.md for instructions)

# Verify they're gitignored
git status
# Should NOT show these files
```

### 4. Optional: Rotate API Keys

**Recommended if keys were public for extended period**:

1. Create new Firebase project in Firebase Console
2. Download new configuration files
3. Update app with new project ID
4. Migrate data to new project (if needed)
5. Delete old Firebase project

**If keys properly restricted**: Rotation not necessary

### 5. Verify GitHub Security Alerts

1. Go to GitHub repository
2. Navigate to **Settings** > **Security** > **Secret scanning**
3. Check if alert for `google-services.json` is resolved
4. May take 24-48 hours for GitHub to clear alerts

---

## Team Communication

### Sample Notification Message

Subject: **[Action Required] Repository History Rewrite - Please Re-clone**

```
Hi Team,

We've cleaned up sensitive files from our git history. All team members need to re-clone the repository.

**What happened:**
Firebase configuration files (google-services.json, GoogleService-Info.plist) were removed from git history for security.

**Action Required (by all team members):**

1. Commit and push any pending work to a feature branch BEFORE [DEADLINE]
2. After [DEADLINE], delete your local repository
3. Re-clone from GitHub:
   ```
   cd C:\Dev\Projects
   rm -rf sinoman-mobile-app
   git clone https://github.com/your-org/sinoman-mobile-app.git
   cd sinoman-mobile-app
   ```
4. Recreate Firebase config files:
   ```
   cp google-services.json.example google-services.json
   cp GoogleService-Info.plist.example GoogleService-Info.plist
   # Download actual files from Firebase Console
   ```
5. Continue working normally

**Deadline:** [DATE & TIME]

**Questions?** Contact tech lead or see GIT_CLEANUP_INSTRUCTIONS.md

**Important:** Do NOT try to merge or rebase existing local branches after the cleanup. Re-clone fresh.

Thanks,
Tech Team
```

### Follow-up Checklist

- [ ] All team members acknowledged notification
- [ ] All team members have re-cloned
- [ ] CI/CD pipelines updated (if needed)
- [ ] Build servers re-cloned
- [ ] No one trying to push old branches

---

## Verification

### Verify Files Removed from History

```bash
# This command should return NOTHING
git log --all --full-history -- google-services.json
git log --all --full-history -- GoogleService-Info.plist

# This command should show 0 blobs
git rev-list --objects --all | grep google-services.json
git rev-list --objects --all | grep GoogleService-Info.plist
```

### Verify .gitignore is Working

```bash
# Create test files
echo "test" > google-services.json
echo "test" > GoogleService-Info.plist

# Check git status
git status
# Should show: nothing to commit (files ignored)

# Clean up
rm google-services.json GoogleService-Info.plist
```

### Verify GitHub Security Alert Resolved

1. **GitHub Repository** > **Settings** > **Security**
2. Navigate to **Secret scanning** alerts
3. Alert should be marked as "Resolved" or disappear
4. May take 24-48 hours to update

### Verify Repository Size Reduced

```bash
# Check repository size
du -sh .git

# Compare to backup
du -sh ../sinoman-mobile-app-backup.git

# Should be smaller after cleanup (especially if files were large)
```

---

## Prevention

### 1. Pre-commit Hooks (Optional)

Prevent accidentally committing Firebase config files:

**Install pre-commit hook**:
```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Check if sensitive files are being committed
if git diff --cached --name-only | grep -E 'google-services\.json|GoogleService-Info\.plist'; then
  echo "ERROR: Attempting to commit Firebase config files!"
  echo "These files contain API keys and should not be committed."
  echo "See .gitignore and docs/FIREBASE_SECURITY.md"
  exit 1
fi
EOF

# Make executable
chmod +x .git/hooks/pre-commit
```

### 2. Git Secrets Tool (Advanced)

Install **git-secrets** to scan for patterns:

```bash
# Install git-secrets
# macOS: brew install git-secrets
# Windows: Follow https://github.com/awslabs/git-secrets

# Configure for this repo
git secrets --install
git secrets --register-aws  # For AWS keys too

# Add custom patterns
git secrets --add 'AIza[0-9A-Za-z\\-_]{35}'  # Google API key pattern
```

### 3. CI/CD Checks

Add GitHub Actions workflow to prevent sensitive files:

**`.github/workflows/security-check.yml`**:
```yaml
name: Security Check

on: [push, pull_request]

jobs:
  check-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for sensitive files
        run: |
          if git ls-files | grep -E 'google-services\.json|GoogleService-Info\.plist'; then
            echo "ERROR: Sensitive files found in commit!"
            exit 1
          fi
```

### 4. Regular Security Audits

**Monthly checklist**:
- [ ] Review `.gitignore` - ensure sensitive files listed
- [ ] Check git history - `git log --all --full-history -- google-services.json`
- [ ] Review GitHub security alerts
- [ ] Verify Firebase API key restrictions in Google Cloud Console
- [ ] Review Firebase security rules

### 5. Team Training

**Educate team on**:
- Why Firebase config files should not be committed
- How to use template files
- Where to get actual config files (Firebase Console)
- Security best practices (see [docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md))

---

## Troubleshooting

### "Repository size didn't decrease"

**Cause**: Git garbage collection didn't remove objects

**Solution**:
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### "Team member can't push after cleanup"

**Cause**: Their local repo has old history

**Solution**:
```bash
# Team member must re-clone (do NOT try to merge)
cd ..
rm -rf sinoman-mobile-app
git clone https://github.com/your-org/sinoman-mobile-app.git
```

### "CI/CD pipeline failing"

**Cause**: Build server has old repository clone

**Solution**:
```bash
# On build server, re-clone repository
cd /path/to/repos
rm -rf sinoman-mobile-app
git clone https://github.com/your-org/sinoman-mobile-app.git

# Add Firebase config files (from secure storage)
cp /secure/google-services.json sinoman-mobile-app/
cp /secure/GoogleService-Info.plist sinoman-mobile-app/
```

### "GitHub still showing security alert"

**Cause**: GitHub scans may take 24-48 hours to update

**Solution**:
- Wait 24-48 hours for GitHub to rescan
- Verify files actually removed: `git log --all --full-history -- google-services.json`
- If still showing after 48h, contact GitHub Support

### "BFG fails with 'Protected commits' error"

**Cause**: BFG protects latest commit by default

**Solution**:
```bash
# If you need to clean the latest commit too, use:
java -jar bfg.jar --no-blob-protection --delete-files google-services.json
```

---

## Summary

### What We Did

1. ✅ Removed `google-services.json` from all git history
2. ✅ Removed `GoogleService-Info.plist` from all git history
3. ✅ Added files to `.gitignore` to prevent future commits
4. ✅ Force-pushed cleaned history to remote
5. ✅ Created template files for team collaboration
6. ✅ Documented security best practices

### Next Steps for Team

1. All team members **re-clone** repository
2. Recreate Firebase config files from templates
3. Download actual files from Firebase Console
4. Continue development normally

### Security Improvements

- 🔒 Firebase config files no longer in git history
- 🔒 Files gitignored to prevent future commits
- 🔒 Template files provided for team workflow
- 🔒 Security documentation created ([docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md))
- 🔒 API key restrictions documented

---

**Cleanup Date**: _____________
**Performed By**: _____________
**Verified By**: _____________
**Team Notified**: _____________

---

**Questions?** Contact tech@sinomanapp.id or see [docs/FIREBASE_SECURITY.md](docs/FIREBASE_SECURITY.md)
