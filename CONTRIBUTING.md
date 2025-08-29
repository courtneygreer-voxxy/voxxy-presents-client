# Contributing to Voxxy Presents

## 🚦 Critical Deployment Process

**NEVER SKIP STAGING** - Always follow this sequence:

```bash
# 1. Development → Staging
git checkout staging
git merge feature/your-feature  
git push origin staging         # Auto-deploys to staging
# ⏳ Wait 2-3 minutes, test thoroughly

# 2. Staging → Production (ONLY after staging validation)  
git checkout main
git merge staging              # Only merge after staging tests pass
git push origin main           # Deploy to production
```

## 🎨 Coding Standards

- **TypeScript**: Strict types, no `any`
- **Components**: Functional components with hooks
- **Error Handling**: Try/catch with user-friendly messages  
- **Security**: Validate inputs, sanitize data, protect secrets

## 📝 Commit Format

```
feat(email): add admin dashboard filtering
fix(auth): resolve login timeout issue
docs(deploy): update staging workflow
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`