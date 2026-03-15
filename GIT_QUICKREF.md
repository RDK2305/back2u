# CampusFind Git Quick Reference

## ⚡ Quick Setup (First Time Only)

### Windows PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd d:\Fourth_sem\Paid\capstone\campusfind
.\setup-git.ps1
```

### Linux/Mac
```bash
cd ~/campusfind
chmod +x setup-git.sh
./setup-git.sh
```

---

## 📝 Daily Commands

### Start Work
```bash
git pull origin main
git checkout -b feature/feature-name
```

### Save Work
```bash
git add .
git commit -m "[BACKEND] What you did | Author: Your Name"
# Auto-push will trigger! (or manually: git push origin)
```

### Check Progress
```bash
git status                              # See what changed
git log --oneline -5                    # See recent commits
git log --author="Your Name" --oneline  # See your commits
```

---

## 👥 Team Git Identities

| Person | Command |
|--------|---------|
| **Rudraksh** | `git config user.name "Rudraksh Kharadi"` |
| **Bishal** | `git config user.name "Bishal Paudel"` |
| **Gagan** | `git config user.name "Gagan Singh"` |
| **Gurjant** | `git config user.name "Gurjant Singh"` |

---

## 🏷️ Commit Message Format

```
[BACKEND] Added OTP verification | Author: Gurjant Singh
[FRONTEND] Fixed UI button | Author: Gagan Singh
[DATABASE] Created users table | Author: Bishal Paudel
[DOCS] Updated README | Author: Rudraksh Kharadi
```

---

## 🔧 Module Tags
| Tag | Purpose |
|-----|---------|
| `[BACKEND]` | Server/API changes |
| `[FRONTEND]` | UI/Flutter changes |
| `[DATABASE]` | DB schema/queries |
| `[DOCS]` | Documentation |
| `[TESTING]` | Test files |
| `[BUGFIX]` | Bug fixes |
| `[FEATURE]` | New features |

---

## ❌ Undo Changes

```bash
git checkout .                    # Discard unstaged changes
git reset HEAD file.js            # Unstage a file
git reset --soft HEAD~1           # Undo last commit (keep changes)
git reset --hard HEAD~1           # Undo last commit (delete changes)
```

---

## 🚀 Push/Pull

```bash
git pull origin main              # Get latest code
git push origin main              # Push your code
git push origin feature/branch    # Push specific branch
```

---

## 📊 View History

```bash
git log --oneline                 # Simple commit list
git log --author="Name"           # Commits by author
git log -p                        # Show complete diffs
git diff                          # See what changed
git show HEAD                     # Show last commit
```

---

## 🌿 Branches

```bash
git branch                        # List local branches
git branch -a                     # List all branches
git checkout -b new-branch        # Create + switch
git checkout main                 # Switch branch
git branch -d old-branch          # Delete branch
git merge feature/branch          # Merge to current branch
```

---

## 🆘 Emergency Undo

```bash
git reflog                        # See all changes
git reset --hard HEAD@{n}         # Go back to old state
```

---

## ✅ Good Commits

✓ Small, focused changes  
✓ Descriptive messages  
✓ Tested code  
✓ Related files together  

❌ Large random changes  
❌ "fixed stuff"  
❌ Untested code  
❌ Passwords in commits  

---

**🆘 Stuck?** Read: `TEAM_CONFIG_GUIDE.md`  
**📞 Questions?** Contact: Rudraksh Kharadi
