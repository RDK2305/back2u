# Multi-Account Git Setup Guide

## Account Configuration

This repository uses three different GitHub accounts for different parts:
- **Gurjant Singh**: Backend code (branch: `backend/gurjant`)
- **Bishal**: Database and documentation (branch: `database/bishal`)
- **Rudraksh**: Full stack integration (branch: `main`)

## Setup Instructions

### Option 1: Using SSH Keys (Recommended)

1. **For Gurjant's Account (Backend)**
   ```bash
   git config user.name "Gurjant Singh"
   git config user.email "gurjant@email.com"
   ```

2. **For Bishal's Account (Database & Docs)**
   ```bash
   git config user.name "Bishal"
   git config user.email "bishal@email.com"
   ```

3. **For Rudraksh's Account (Full Stack)**
   ```bash
   git config user.name "Rudraksh"
   git config user.email "rudraksh@email.com"
   ```

### Option 2: Using Git Credentials Manager

Windows has built-in Git Credential Manager. When you push, you'll be prompted to authenticate with each account as needed.

## Branch Structure

```
main                          (Rudraksh - Full Stack)
├── backend/gurjant           (Gurjant - Backend Code)
├── database/bishal           (Bishal - Database & Documentation)
└── frontend                  (Not pushed - local development only)
```

## Workflow

### Gurjant (Backend)
```bash
git checkout -b backend/gurjant
# Make changes to backend code
git add .
git commit -m "Backend: [description]"
git push origin backend/gurjant
```

### Bishal (Database & Documentation)
```bash
git checkout -b database/bishal
# Make changes to database and docs
git add .
git commit -m "Database/Docs: [description]"
git push origin database/bishal
```

### Rudraksh (Full Stack Integration)
```bash
git checkout main
# Merge from other branches as needed
git merge backend/gurjant
git merge database/bishal
git push origin main
```

## Excludes (Not to Push)

- **Frontend files** - Keep local only:
  - `/public/**` (except core files)
  - Frontend-only documentation

## SSH Key Setup (Optional - For Enhanced Security)

If using SSH keys for different accounts:

1. Generate keys for each account:
   ```bash
   ssh-keygen -t ed25519 -C "gurjant@email.com" -f ~/.ssh/gurjant_key
   ssh-keygen -t ed25519 -C "bishal@email.com" -f ~/.ssh/bishal_key
   ssh-keygen -t ed25519 -C "rudraksh@email.com" -f ~/.ssh/rudraksh_key
   ```

2. Add public keys to respective GitHub accounts

3. Configure `~/.ssh/config`:
   ```
   Host github-gurjant
       HostName github.com
       User git
       IdentityFile ~/.ssh/gurjant_key

   Host github-bishal
       HostName github.com
       User git
       IdentityFile ~/.ssh/bishal_key

   Host github-rudraksh
       HostName github.com
       User git
       IdentityFile ~/.ssh/rudraksh_key
   ```

## First Time Setup

1. **Initialize branches:**
   ```bash
   git checkout -b backend/gurjant
   git push origin backend/gurjant --set-upstream
   
   git checkout main
   git checkout -b database/bishal
   git push origin database/bishal --set-upstream
   ```

2. **Configure local git identity for this repo:**
   ```bash
   # For Gurjant
   git config user.name "Gurjant Singh"
   git config user.email "gurjant@email.com"
   ```

   Change this per person before pushing.

## Push Rules

| Person | Branch | What to Push | What to Exclude |
|--------|--------|--------------|-----------------|
| Gurjant Singh | `backend/gurjant` | Backend code, controllers, routes, middleware | Frontend, UI |
| Bishal | `database/bishal` | Database files, models, config, documentation | Frontend code |
| Rudraksh | `main` | Merged full stack (after branch review) | Frontend code |
| Everyone | - | - | Frontend public files |

## Common Commands

```bash
# Check current git user
git config user.name
git config user.email

# Create and switch to feature branch
git checkout -b backend/gurjant

# Push branch with upstream tracking
git push origin branch-name --set-upstream

# View all branches
git branch -a

# View remote configuration
git remote -v
```
