---
description: Git branching strategy for feature development
---

# Git Branching Workflow

## Branch Naming Convention

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat/` | New features | `feat/publisher-agent` |
| `fix/` | Bug fixes | `fix/callback-timeout` |
| `docs/` | Documentation only | `docs/workflow-readme` |
| `refactor/` | Code improvements (no new features) | `refactor/api-cleanup` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

## Workflow Steps

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### 2. Make Changes
- Commit frequently with descriptive messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for refactoring
  - `chore:` for maintenance

### 3. Push Branch
```bash
git push -u origin feat/your-feature-name
```

### 4. Create Pull Request (Optional for solo dev)
- Go to GitHub
- Create PR from your branch to `main`
- Review changes
- Merge when ready

### 5. Merge to Main (Direct method)
```bash
git checkout main
git pull origin main
git merge feat/your-feature-name
git push origin main
```

### 6. Cleanup
```bash
git branch -d feat/your-feature-name
git push origin --delete feat/your-feature-name
```

## Quick Commands

### Start new feature
// turbo
```bash
git checkout main && git pull && git checkout -b feat/NEW_FEATURE_NAME
```

### Finish feature (merge to main)
```bash
git checkout main && git pull && git merge feat/FEATURE_NAME && git push
```

## Protected Branch Rules (Recommended)

For production safety, consider enabling in GitHub:
- Require PR reviews before merging to `main`
- Require status checks to pass
- Require branches to be up to date

## Current Branch Status
```bash
git branch -a
```
