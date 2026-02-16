# Git Setup Summary - back2u Repository

## ✓ Completed Setup

### Remote Repository
- **Origin**: `https://github.com/RDK2305/back2u.git`
- **Status**: ✓ Configured

### Project Structure
```
main                          (Rudraksh - Full Stack Coordinator)
├── backend/gurjant           (Gurjant Singh - Backend Code)
│   └── controllers/
│   └── routes/
│   └── middleware/
│   └── models/
│
├── database/bishal           (Bishal - Database & Documentation)
│   └── config/
│   └── models/
│   └── Documentation files
│
└── frontend                  (Local Development Only - NOT PUSHED)
    └── public/
    └── javascripts/
    └── stylesheets/
```

## Team Account Configuration

### Each team member should set up their account:

#### Option 1: PowerShell (Windows)
```bash
.\setup-account.ps1
# Then select your account number (1, 2, or 3)
```

#### Option 2: Bash/Git Bash
```bash
bash setup-account.sh gurjant
# or: bash setup-account.sh bishal
# or: bash setup-account.sh rudraksh
```

#### Option 3: Manual Setup
Each person before pushing should run one of these:

**Gurjant Singh (Backend):**
```bash
git config user.name "Gurjant Singh"
git config user.email "gurjant@email.com"
```

**Bishal (Database & Documentation):**
```bash
git config user.name "Bishal"
git config user.email "bishal@email.com"
```

**Rudraksh (Full Stack):**
```bash
git config user.name "Rudraksh"
git config user.email "rudraksh@email.com"
```

## Workflow Guide

### Step 1: Create/Switch to Your Branch

**Gurjant (Backend):**
```bash
git checkout -b backend/gurjant
```

**Bishal (Database & Documentation):**
```bash
git checkout -b database/bishal
```

**Rudraksh (Full Stack):**
```bash
git checkout main
```

### Step 2: Configure Your Account
Run the setup script or manual command above

### Step 3: Make Changes
```bash
git add .
git commit -m "Backend: Added user authentication" # or similar message
```

### Step 4: Push to Your Branch
```bash
git push origin backend/gurjant        # For Gurjant
git push origin database/bishal        # For Bishal
git push origin main                   # For Rudraksh
```

## What Each Team Member Should Push

### Gurjant Singh (backend/gurjant branch)
✓ Push:
- `/controllers` - Backend logic
- `/routes` - API routes
- `/middleware` - Authentication, validation
- Backend-related documentation
- Config files (excluding sensitive data)

✗ Do NOT push:
- `/public` files
- Frontend JavaScript/CSS
- `.env` files with secrets

### Bishal (database/bishal branch)
✓ Push:
- `/models` - Database schemas
- `/config` - Database configuration
- Database documentation
- `DEVELOPER_GUIDE.md`
- `DATABASE.md` or similar documentation

✗ Do NOT push:
- Frontend files
- `.env` files with credentials

### Rudraksh (main branch)
✓ Push:
- Merged code from all branches
- Full integration documentation
- `README.md`
- Setup guides
- Deployment instructions

✗ Do NOT push:
- Frontend files
- Uncommitted changes from other branches

## Frontend Exclusion

**IMPORTANT**: Frontend code should NOT be pushed to GitHub until approved. The `.gitignore` file has been configured to exclude:
- All HTML files in `/public`
- Frontend JavaScript files
- Frontend CSS files

This allows you to work locally without accidentally pushing frontend code.

## First-Time Push Checklist

For each team member's first push:

1. [ ] Create your branch: `git checkout -b your-branch`
2. [ ] Configure your account: Run setup script or manual command
3. [ ] Make your changes
4. [ ] Stage changes: `git add .`
5. [ ] Commit with message: `git commit -m "Description"`
6. [ ] Push to remote: `git push origin your-branch --set-upstream`
7. [ ] Verify on GitHub: Check that branch exists and code is there

## Useful Commands

```bash
# Check current git user configuration
git config user.name
git config user.email

# See all branches (local and remote)
git branch -a

# View remote configuration
git remote -v

# Switch branches
git checkout main
git checkout backend/gurjant
git checkout database/bishal

# See commit history for current branch
git log --oneline

# See what's staged for commit
git status

# Unstage files if needed
git reset HEAD filename

# Update from remote (after others push)
git pull origin branch-name
```

## Authentication Setup (If Not Already Done)

When you first push, Git may ask for credentials on Windows. You have two options:

### 1. Use Git Credential Manager (Recommended - Default on Windows)
- You'll be prompted to sign in with your GitHub account
- Git will remember your credentials

### 2. Use Personal Access Token
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with `repo` scope
3. Use the token as your password when prompted

## Troubleshooting

**Error: "fatal: remote origin already exists"**
- Remote is already configured, you can proceed

**Error: "Permission denied (publickey)"**
- Check SSH setup or switch to HTTPS
- Make sure your GitHub account has push access to the repository

**Error: "Updates were rejected because the remote contains work"**
- Pull before pushing: `git pull origin branch-name`
- Then push again: `git push origin branch-name`

**Commits showing wrong author?**
- Check config: `git config user.name`
- Reconfigure using setup script
- Note: This won't change past commits, but future commits will have correct author

## Support

- Check [GIT_SETUP_GUIDE.md](GIT_SETUP_GUIDE.md) for detailed instructions
- For GitHub authentication issues, check GitHub docs
- For merge conflicts, consult with team lead

---

**Last Updated**: 2026-02-16
**Repository**: https://github.com/RDK2305/back2u.git
**Branches**: `main`, `backend/gurjant`, `database/bishal`
