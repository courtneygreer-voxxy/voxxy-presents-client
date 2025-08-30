# Contributing to Voxxy Presents

## 🚦 Batch Release Process ⚡ **NEW POLICY**

**We now batch features into coordinated version releases** instead of individual deployments.

### Development Workflow

```bash
# 1. Feature Development (Features stay in branches)
git checkout -b feature/your-feature
# Develop and test locally, push to feature branch
git push origin feature/your-feature
# DON'T merge to main yet - wait for release batch

# 2. Release Preparation (Batch multiple features)
git checkout develop
git checkout -b release/v1.2.0
git merge feature/your-feature
git merge feature/another-feature
git merge feature/third-feature

# 3. Batch Staging Testing
git checkout staging
git merge release/v1.2.0
git push origin staging         # Deploy entire batch to staging
# ⏳ Wait 2-3 minutes, test ALL features together

# 4. Batch Production Release (ONLY after comprehensive staging validation)
git checkout main
git merge release/v1.2.0       # Deploy coordinated feature batch
git push origin main
git tag -a v1.2.0 -m "Release v1.2.0: Multi-feature batch"
```

### **Key Changes from Old Process:**
- Features stay in branches longer (until release batch)
- Multiple features deploy together as versions
- More comprehensive staging testing of feature interactions
- Weekly/bi-weekly release cycles instead of continuous deployment

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