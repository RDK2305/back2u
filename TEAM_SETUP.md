# Back2u - Team Setup & Git Configuration Guide

## Overview

This guide helps all team members set up their Git configuration correctly for the Back2u project with proper user identification based on their ID and role.

## Quick Setup (Choose One Method)

### Method 1: PowerShell (Windows)
```powershell
.\configure-git-user.ps1
# Select your team member number (1-3)
```

### Method 2: Bash (Linux/Mac)
```bash
bash configure-git-user.sh
# Or directly specify your key:
bash configure-git-user.sh gurjant
bash configure-git-user.sh bishal
bash configure-git-user.sh rudraksh
```

### Method 3: Node.js Utility
```bash
node utils/team-config-util.js list
node utils/team-config-util.js info 001
node utils/team-config-util.js git-config 001
```

### Method 4: Manual
```bash
git config user.name "Your Full Name"
git config user.email "your.email@campusfind.local"
```

---

## Team Members

### 001 - Gurjant Singh (Backend Developer)
- **Email:** gssandhu911@gmail.com
- **Branch:** `backend/gurjant`
- **Responsibilities:**
  - Backend API development
  - Route management
  - Business logic implementation
  - Integration with controllers
- **Allowed Paths:**
  - `/controllers/`
  - `/routes/`
  - `/middleware/`
  - `server.js`
  - `config/`

### 002 - Bishal (Database Administrator)
- **Email:** bishalsharma24112002@gmail.com
- **Branch:** `database/bishal`
- **Responsibilities:**
  - Database design and optimization
  - Data model management
  - Documentation
  - Database configuration
- **Allowed Paths:**
  - `/models/`
  - `/config/database.js`
  - `/config/setupDatabase.js`
  - Documentation files

### 003 - Rudraksh (Full Stack Coordinator)
- **Email:** rudrakshkharadi53@gmail.com
- **Branch:** `main`
- **Responsibilities:**
  - Code integration and merging
  - Quality assurance
  - Branch coordination
  - Deployment coordination
- **Allowed Paths:**
  - All paths (authority to merge and integrate)

---

## Git Workflow

### Before Starting Work

1. **Configure Your Account:**
   ```bash
   # Run setup script
   .\configure-git-user.ps1
   # OR
   bash configure-git-user.sh
   ```

2. **Verify Configuration:**
   ```bash
   git config user.name
   git config user.email
   ```

### Creating and Pushing Your Code

1. **Create Your Feature Branch** (if not exists)
   ```bash
   # Gurjant
   git checkout -b backend/gurjant
   
   # Bishal
   git checkout -b database/bishal
   
   # Rudraksh
   git checkout main
   ```

2. **Make Your Changes**
   ```bash
   # Edit your files
   # Only modify files in your allowed paths
   ```

3. **Stage and Commit**
   ```bash
   git add .
   git commit -m "Backend: Added user authentication API"
   # Format: [TYPE]: Description
   ```

4. **Push to Remote**
   ```bash
   git push origin branch-name --set-upstream
   # First time: git push origin backend/gurjant --set-upstream
   # After: git push origin backend/gurjant
   ```

### Commit Message Format

```
[TYPE]: Brief description

[Optional] Detailed description
- What changed
- Why it changed
- How to test
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Tests
- `chore:` - Build, deps, etc.

**Examples:**
```
[feat]: Add email verification endpoint
[fix]: Fix database connection pooling issue
[docs]: Update API documentation
[refactor]: Optimize user authentication flow
```

---

## Branch Management

### Main Branch (`main`)
- **Coordinator:** Rudraksh
- **Purpose:** Production-ready code
- **Status:** Merged branches only

### Backend Branch (`backend/gurjant`)
- **Owner:** Gurjant Singh
- **Purpose:** Backend development
- **Status:** Development in progress

### Database Branch (`database/bishal`)
- **Owner:** Bishal
- **Purpose:** Database and data models
- **Status:** Development in progress

---

## What Not to Push

The following are automatically excluded from Git:

```
❌ DO NOT PUSH:
- Public HTML files (public/*.html)
- Frontend CSS files (public/stylesheets/*.css)
- Frontend JavaScript (public/javascripts/*.js)
- Node modules (node_modules/)
- Environment config (.env)
- Log files (*.log)
- IDE configs (.vscode/, .idea/)
```

These files are listed in `.gitignore` and will not be tracked by Git.

---

## Repository Information

- **Project Name:** Back2u
- **Repository URL:** https://github.com/RDK2305/back2u.git
- **Primary Language:** JavaScript (Node.js)
- **Database:** MySQL

---

## Team Configuration File

All team member information is stored in `team-config.json`:

```bash
# View all members
node utils/team-config-util.js list

# Get detailed info
node utils/team-config-util.js info 001
node utils/team-config-util.js info gurjant

# View git configuration
node utils/team-config-util.js git-config 001

# View all branches
node utils/team-config-util.js branches
```

---

## Common Issues & Solutions

### Issue: "Git showing wrong author name"
**Solution:**
```bash
# Check current config
git config user.name
git config user.email

# Reconfigure
.\configure-git-user.ps1
# or
bash configure-git-user.sh
```

### Issue: "Permission denied when pushing"
**Solution:**
1. Check you have push access to the repository
2. Ensure you're using the correct branch
3. Verify remote URL: `git remote -v`

### Issue: "Cannot merge branches"
**Solution:**
1. Ensure all commits are on correct branch
2. Pull latest changes: `git pull origin branch-name`
3. Contact Rudraksh for merge coordination

### Issue: "Committed to wrong branch"
**Solution:**
```bash
# Check which branch you're on
git branch

# Switch branches
git checkout correct-branch

# Merge your commits
git merge wrong-branch
```

---

## Development Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- Git

### Installation
```bash
# Install dependencies
npm install

# Setup database
node config/setupDatabase.js

# Configure your account
.\configure-git-user.ps1

# Start development
npm run dev
```

### Available Scripts
```bash
npm start       # Start server
npm run dev     # Start with nodemon (auto-reload)
npm run build:css  # Build CSS
npm run watch:css  # Watch CSS changes
```

---

## Support & Contacts

For setup issues or questions:
- **Backend Issues:** Contact Gurjant Singh
- **Database Issues:** Contact Bishal
- **Integration Issues:** Contact Rudraksh

---

## References

- [GIT_SETUP_GUIDE.md](GIT_SETUP_GUIDE.md) - Detailed git guide
- [GIT_SETUP_CHECKLIST.md](GIT_SETUP_CHECKLIST.md) - Quick checklist
- [team-config.json](team-config.json) - Team member database
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development guidelines

---

**Last Updated:** February 16, 2026
**Version:** 1.0
