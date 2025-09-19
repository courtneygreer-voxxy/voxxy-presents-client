# Branching Strategy

This document outlines the Git branching strategy for the Voxxy Presents Client project.

## Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected branch with required reviews
- **Deployments**: Automatically deploys to production
- **Merges**: Only accepts merges from `staging` via pull requests
- **Direct commits**: Prohibited

#### `develop`
- **Purpose**: Integration branch for ongoing development
- **Protection**: Protected with required reviews
- **Deployments**: Automatically deploys to development environment
- **Merges**: Accepts merges from feature branches via pull requests
- **Direct commits**: Limited to hotfixes only

#### `staging`
- **Purpose**: Pre-production testing and quality assurance
- **Protection**: Protected branch
- **Deployments**: Automatically deploys to staging environment
- **Merges**: Accepts merges from `develop` for release preparation
- **Testing**: All features must pass QA testing here before production

### Supporting Branches

#### Feature Branches (`feature/*`)
- **Naming**: `feature/feature-name` or `feature/ticket-number-description`
- **Purpose**: Develop new features or enhancements
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via pull request
- **Lifecycle**: Deleted after successful merge

#### Bugfix Branches (`bugfix/*`)
- **Naming**: `bugfix/bug-description` or `bugfix/ticket-number-description`
- **Purpose**: Fix non-critical bugs found in development
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via pull request
- **Lifecycle**: Deleted after successful merge

#### Hotfix Branches (`hotfix/*`)
- **Naming**: `hotfix/critical-fix-description`
- **Purpose**: Fix critical issues in production
- **Base**: Created from `main`
- **Merge**: To both `main` and `develop` via pull requests
- **Lifecycle**: Deleted after successful merge

#### Release Branches (`release/*`) - **BATCH RELEASE STRATEGY**
- **Naming**: `release/version-number` (e.g., `release/1.2.0`)
- **Purpose**: **Batch multiple completed features** for coordinated releases
- **Base**: Created from `develop`
- **Workflow**: Merge multiple feature branches, then deploy batch to staging/production
- **Merge**: To `staging` for comprehensive testing, then to `main` for coordinated release
- **Lifecycle**: Deleted after successful batch release

## Workflow

### Feature Development
1. Create feature branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature-name
   ```

2. Develop and commit changes
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   ```

3. Push and create pull request to `develop`
   ```bash
   git push origin feature/new-feature-name
   ```

4. Code review and merge via GitHub PR
5. Delete feature branch after merge

### Batch Release Process ⚡ **NEW STRATEGY**

**🎯 Coordinated Multi-Feature Releases**

1. **Create release branch from `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.2.0
   ```

2. **Batch merge completed features**
   ```bash
   # Merge multiple ready features into release branch
   git merge feature/email-system
   git merge feature/platform-integration
   git merge feature/admin-dashboard-updates
   ```

3. **Deploy batch to staging for comprehensive testing**
   ```bash
   git checkout staging
   git merge release/1.2.0
   git push origin staging
   ```

4. **Test feature interactions in staging**
   - Test all features work individually
   - **Critical**: Test features work together without conflicts
   - Verify no breaking changes between features

5. **After comprehensive QA approval, batch release to production**
   ```bash
   git checkout main
   git merge release/1.2.0
   git push origin main
   ```

6. **Tag the coordinated release**
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0: Email System + Platform Integration + Admin Updates"
   git push origin v1.2.0
   ```

7. **Clean up feature and release branches**
   ```bash
   # Delete merged feature branches
   git branch -d feature/email-system
   git branch -d feature/platform-integration
   git branch -d feature/admin-dashboard-updates
   
   # Delete release branch
   git branch -d release/1.2.0
   ```

### Hotfix Process
1. Create hotfix branch from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-security-fix
   ```

2. Fix the critical issue
3. Create PRs to both `main` and `develop`
4. Deploy immediately after merge to `main`

## Branch Protection Rules

### `main` Branch
- Require pull request reviews (minimum 1 reviewer)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes to administrators only
- Delete head branches automatically after merge

### `develop` Branch
- Require pull request reviews (minimum 1 reviewer)
- Require status checks to pass before merging
- Allow administrators to bypass requirements for hotfixes

### `staging` Branch
- Require pull request reviews
- Require status checks to pass before merging
- Restrict to merges from `develop` and `release/*` branches

## Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add user authentication system

- Implement JWT-based authentication
- Add login and registration components
- Update routing for protected pages
```

## Environment Deployments

| Branch    | Environment | URL | Auto-Deploy |
|-----------|-------------|-----|-------------|
| `main`    | Production  | https://voxxy-presents.com | ✅ |
| `staging` | Staging     | https://staging.voxxy-presents.com | ✅ |
| `develop` | Development | https://dev.voxxy-presents.com | ✅ |

## Best Practices

### Batch Release Strategy
1. **Feature Planning** - Target features for specific release versions
2. **Release Cadence** - Weekly or bi-weekly coordinated releases
3. **Feature Isolation** - Features stay in branches until release batch
4. **Comprehensive Testing** - Test feature interactions in staging
5. **Release Documentation** - Document all features in version releases

### General Development
1. **Keep branches small and focused** - One feature per branch
2. **Regular updates** - Sync with base branch frequently
3. **Descriptive names** - Use clear, descriptive branch names
4. **Clean history** - Squash commits when merging if needed
5. **Delete merged branches** - Keep repository clean after releases
6. **Review process** - All code must be reviewed before merge
7. **Testing** - Ensure all tests pass before requesting review
8. **Documentation** - Update documentation with feature changes

## Emergency Procedures

### Production Rollback
If a critical issue is discovered in production:
1. Immediately rollback the deployment
2. Create hotfix branch from the last known good commit
3. Fix the issue and follow hotfix process
4. Deploy the fix as soon as possible

### Branch Recovery
If a branch is accidentally deleted:
1. Check GitHub's branch restore options
2. Use `git reflog` to find the commit hash
3. Recreate the branch: `git checkout -b branch-name commit-hash`

## Tools and Automation

- **GitHub Actions**: Automated CI/CD pipeline
- **Branch Protection**: Enforced via GitHub settings
- **Code Review**: Required for all merges
- **Status Checks**: Automated testing and linting
- **Auto-merge**: Enabled for approved PRs

This branching strategy ensures code quality, enables parallel development, and provides a clear path from development to production.