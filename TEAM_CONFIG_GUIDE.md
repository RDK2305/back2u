# Team Configuration Guide - CampusFind Project

## Overview
This guide helps set up Git configuration for the CampusFind team to ensure proper code attribution and automatic push workflows.

## Team Members

| Name | Email | GitHub | Primary Role |
|------|-------|--------|--------------|
| **Rudraksh Kharadi** | rudrakshkharadi53@gmail.com | RDK2305 | Project Lead, Backend Services |
| **Bishal Paudel** | bishalsharma24112002@gmail.com | paudel3101 | Database, Documentation |
| **Gagan Singh** | gs9814870091@gmail.com | Gagan-sran | Frontend, UI/Web Design |
| **Gurjant Singh** | gssandhu911@gmail.com | gurjant575 | Backend, Database Design |

---

## Setup Instructions

### Option 1: Windows (PowerShell) - RECOMMENDED

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate to project directory
cd d:\Fourth_sem\Paid\capstone\campusfind

# Run setup script
.\setup-git.ps1
```

### Option 2: Linux/Mac (Bash)

```bash
cd ~/path/to/campusfind

chmod +x setup-git.sh
./setup-git.sh
```

### Option 3: Manual Configuration

Each team member should run these commands in the project directory:

#### Rudraksh Kharadi
```bash
git config user.name "Rudraksh Kharadi"
git config user.email "rudrakshkharadi53@gmail.com"
git config push.default current
```

#### Bishal Paudel
```bash
git config user.name "Bishal Paudel"
git config user.email "bishalsharma24112002@gmail.com"
git config push.default current
```

#### Gagan Singh
```bash
git config user.name "Gagan Singh"
git config user.email "gs9814870091@gmail.com"
git config push.default current
```

#### Gurjant Singh
```bash
git config user.name "Gurjant Singh"
git config user.email "gssandhu911@gmail.com"
git config push.default current
```

---

## Automatic Push Configuration

### Enable Auto-Push After Each Commit

The post-commit hook will automatically push your commits after they are created:

```bash
# Make hooks executable (if on Mac/Linux)
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

**What happens:**
1. You make changes and stage them: `git add .`
2. You commit: `git commit -m "[MODULE] Your message"`
3. The post-commit hook automatically runs `git push origin <branch>`

### Disable Auto-Push (Optional)

If you want to disable automatic pushing:

```bash
# Remove the hook
rm .git/hooks/post-commit

# Or rename it
mv .git/hooks/post-commit .git/hooks/post-commit.disabled
```

Then push manually:
```bash
git push origin main
```

---

## Commit Message Convention

Follow this format for commit messages to maintain consistency:

```
[MODULE] Brief description | Author: Name
```

### Examples:

```
[BACKEND] Added forgot password OTP endpoint | Author: Gurjant Singh
[FRONTEND] Updated password reset UI | Author: Gagan Singh
[DATABASE] Created OTP columns for users | Author: Bishal Paudel
[DOCS] Updated API documentation | Author: Rudraksh Kharadi
[TESTING] Added unit tests for auth | Author: All Members
```

### Module Tags:
- `[BACKEND]` - Backend server changes
- `[FRONTEND]` - Frontend/Flutter changes
- `[DATABASE]` - Database schema/queries
- `[DOCS]` - Documentation
- `[TESTING]` - Test files
- `[CONFIG]` - Configuration files
- `[FEATURE]` - New feature
- `[BUGFIX]` - Bug fix
- `[REFACTOR]` - Code refactoring

---

## Daily Workflow

### 1. Start Your Day
```bash
cd /path/to/campusfind

# Update local repository
git pull origin main

# Create a feature branch (if needed)
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your code changes in VS Code
# ...

# Stage changes
git add .

# Or stage specific files
git add src/controllers/authController.js
```

### 3. Commit and Push
```bash
# Commit (with auto-push enabled)
git commit -m "[BACKEND] Added new endpoint | Author: Gurjant Singh"

# Auto-push will trigger automatically!
# If not automatic, push manually:
git push origin feature/your-feature-name
```

### 4. Create Pull Request (Optional)
```bash
# After pushing, create a PR on GitHub for code review
```

### 5. End of Day
```bash
# Verify everything is pushed
git log -1

# Check status
git status
# Should show: "nothing to commit, working tree clean"
```

---

## Useful Git Commands

### View Configuration
```bash
# Show local config
git config --local --list

# Show global config
git config --global --list

# Show specific config
git config user.name
git config user.email
```

### View Commit History
```bash
# View commits with author
git log --pretty=format:"%an | %s"

# View commits for current branch
git log --oneline -10

# View commits by author
git log --author="Bishal Paudel" --oneline
```

### Undo Changes
```bash
# Undo unstaged changes
git checkout .

# Unstage changes
git reset HEAD file.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/description

# Switch branch
git checkout main

# Delete branch
git branch -d feature/description

# List all branches
git branch -a
```

---

## Troubleshooting

### Issue: "Push failed"
```bash
# Make sure you're on the correct branch
git branch

# Try pulling first to sync
git pull origin main

# Then push
git push origin main
```

### Issue: "Author name not set"
```bash
# Run the setup script again
./setup-git.ps1  # Windows

# Or manually configure
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Issue: "Remote not found"
```bash
# Check remotes
git remote -v

# Add remote if missing
git remote add origin https://github.com/campusfind/repo.git
```

### Issue: "Permission denied" (Mac/Linux)
```bash
# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit
```

---

## Best Practices

✅ **DO:**
- Commit frequently (small, logical commits)
- Use descriptive commit messages
- Pull before pushing
- Test your code before committing
- Review your changes before commit (`git diff`)

❌ **DON'T:**
- Commit sensitive information (passwords, API keys)
- Force push to main branch
- Commit large binary files
- Ignore merge conflicts
- Skip testing

---

## Questions or Issues?

Contact: **Rudraksh Kharadi** (Project Lead)
Email: rudrakshkharadi53@gmail.com

---

**Last Updated:** March 15, 2026
