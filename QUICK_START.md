# Back2u Project - Team Setup Instructions

## 🚀 Quick Start (For Each Team Member)

### Step 1: Configure Git User (Do This First!)

**If you're on Windows (PowerShell):**
```powershell
.\configure-git-user.ps1
```
Then select your team member number: `1`, `2`, or `3`

**If you're on Mac/Linux (Bash):**
```bash
bash configure-git-user.sh
```
Or directly use your key:
```bash
bash configure-git-user.sh gurjant    # For Gurjant
bash configure-git-user.sh bishal     # For Bishal
bash configure-git-user.sh rudraksh   # For Rudraksh
```

**Or use Node.js:**
```bash
npm run team:list
node utils/team-config-util.js info gurjant
```

### Step 2: Create Your Branch

```bash
# For Gurjant Singh (Backend)
git checkout -b backend/gurjant

# For Bishal (Database)
git checkout -b database/bishal

# For Rudraksh (Full Stack)
git checkout main
```

### Step 3: Push Your Code

```bash
git add .
git commit -m "[feat]: Your feature description"
git push origin your-branch-name --set-upstream
```

---

## 👥 Team Member Details

### Team Member 1: Gurjant Singh (001)
```
Role:     Backend Developer
Email:    gssandhu911@gmail.com
Branch:   backend/gurjant
Focus:    Controllers, Routes, Middleware, Business Logic
```

**Command to configure:**
```powershell
.\configure-git-user.ps1  # Choose option 1
# or
node utils/team-config-util.js info 001
```

### Team Member 2: Bishal (002)
```
Role:     Database Administrator
Email:    bishalsharma24112002@gmail.com
Branch:   database/bishal
Focus:    Models, Database Config, Documentation
```

**Command to configure:**
```powershell
.\configure-git-user.ps1  # Choose option 2
# or
node utils/team-config-util.js info bishal
```

### Team Member 3: Rudraksh (003)
```
Role:     Full Stack Coordinator
Email:    rudrakshkharadi53@gmail.com
Branch:   main
Focus:    Code Integration, Merging, Quality Assurance
```

**Command to configure:**
```powershell
.\configure-git-user.ps1  # Choose option 3
# or
node utils/team-config-util.js info rudraksh
```

---

## 📋 Helpful Commands

```bash
# View team information
npm run team:list                          # List all team members
node utils/team-config-util.js info 001   # Details for member 001
node utils/team-config-util.js branches   # View all branches

# Check your current git config
git config user.name
git config user.email

# View which branch you're on
git branch

# View all branches (local and remote)
git branch -a

# View git remote
git remote -v

# View commit history
git log --oneline

# Check which files changed
git status
git diff
```

---

## ✅ Pre-Push Checklist

Before pushing your code:

- [ ] Verified your git user: `git config user.name`
- [ ] You're on the correct branch: `git branch`
- [ ] You made changes only in your allowed paths
- [ ] Your changes are needed and complete
- [ ] No sensitive data (.env, passwords, secrets)
- [ ] No frontend files if you're not Rudraksh
- [ ] Commit message follows format: `[TYPE]: Description`

---

## 🚫 Things NOT to Push

❌ **Frontend Files (Unless you're Rudraksh coordinating)**
- `public/*.html`
- `public/**/*.css`
- `public/**/*.js`

❌ **Environment Files**
- `.env`
- `.env.*`

❌ **System Files**
- `node_modules/`
- `.vscode/`
- `.idea/`
- `*.log`

✅ **These are automatically excluded** by `.gitignore`

---

## 🔄 Typical Workflow

```bash
# 1. Configure your account (first time only)
.\configure-git-user.ps1

# 2. Create/switch to your branch
git checkout -b backend/gurjant

# 3. Edit your files (only in allowed paths)
# Edit controllers/, routes/, etc.

# 4. Check what you changed
git status

# 5. Stage your changes
git add .

# 6. Commit with proper message
git commit -m "[feat]: Added authentication endpoint"

# 7. Push to remote
git push origin backend/gurjant --set-upstream

# 8. Future pushes (after first)
git push origin backend/gurjant
```

---

## 🐛 Troubleshooting

### Problem: "Git shows wrong author"
```bash
# Check current config
git config user.name
git config user.email

# Reconfigure
.\configure-git-user.ps1
```

### Problem: "Remote origin doesn't exist"
```bash
# Verify remote
git remote -v

# Should see:
# origin  https://github.com/RDK2305/back2u.git (fetch)
# origin  https://github.com/RDK2305/back2u.git (push)
```

### Problem: "Permission denied"
1. Make sure you have push access to the repo
2. Check you're on the correct branch
3. Try authenticating again (Git Credential Manager will prompt)

### Problem: "Can't push - updates rejected"
```bash
# Pull latest changes first
git pull origin branch-name

# Then push
git push origin branch-name
```

---

## 📖 Documentation Files

- **[TEAM_SETUP.md](TEAM_SETUP.md)** - Detailed team setup guide
- **[GIT_SETUP_GUIDE.md](GIT_SETUP_GUIDE.md)** - Git workflow guide
- **[GIT_SETUP_CHECKLIST.md](GIT_SETUP_CHECKLIST.md)** - Git checklist
- **[team-config.json](team-config.json)** - Team configuration data
- **[README.md](README.md)** - Project README

---

## 🎯 Repository Info

```
Repository:  https://github.com/RDK2305/back2u.git
Default Branch: main
Branches:
  - main              (Rudraksh - Full Stack)
  - backend/gurjant   (Gurjant - Backend)
  - database/bishal   (Bishal - Database)
```

---

## ❓ Need Help?

1. **Setup Issues?** 
   - Check [TEAM_SETUP.md](TEAM_SETUP.md)
   - Run: `npm run team:list`

2. **Git Issues?**
   - Check [GIT_SETUP_GUIDE.md](GIT_SETUP_GUIDE.md)
   - Run: `git status`, `git log`

3. **Technical Issues?**
   - Contact your team lead
   - Check project documentation

---

**Last Updated:** February 16, 2026  
**Version:** 1.0.0

---

## 📝 Example Commands

### Gurjant Singh Setting Up:
```bash
# Configure
.\configure-git-user.ps1
# Choose: 1

# Create branch
git checkout -b backend/gurjant

# Make changes to controllers/authController.js
nano controllers/authController.js

# Commit and push
git add .
git commit -m "[feat]: Add JWT token validation"
git push origin backend/gurjant --set-upstream
```

### Bishal Setting Up:
```bash
# Configure
bash configure-git-user.sh bishal

# Create branch
git checkout -b database/bishal

# Make changes to models/User.js
nano models/User.js

# Commit and push
git add .
git commit -m "[feat]: Add user verification fields"
git push origin database/bishal --set-upstream
```

### Rudraksh Coordinating:
```bash
# Configure
node utils/team-config-util.js info rudraksh

# Switch to main
git checkout main

# Merge from other branches
git merge backend/gurjant
git merge database/bishal

# Push main
git push origin main
```

---

**Ready to get started? Run this command:**
```bash
./configure-git-user.ps1
# or
bash configure-git-user.sh
```
