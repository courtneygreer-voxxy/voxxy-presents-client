# Branch Protection Setup Guide

This guide explains how to set up branch protection rules for the Voxxy Presents Client repository on GitHub.

## Setting Up Branch Protection Rules

### 1. Access Repository Settings
1. Go to your repository: https://github.com/courtneygreer-voxxy/voxxy-presents-client
2. Click on **Settings** tab
3. Select **Branches** from the left sidebar

### 2. Protect the `main` Branch

Click **Add rule** and configure:

#### Branch name pattern
- `main`

#### Protection Rules
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS file exists)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add status checks: `build`, `test`, `lint` (when CI/CD is set up)

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (optional, for enhanced security)

- ✅ **Require linear history** (optional, for clean commit history)

- ✅ **Restrict pushes that create files**
  - ✅ Restrict to administrators

- ✅ **Allow force pushes**
  - ☐ Everyone (keep unchecked)
  - ☐ Specify who can force push (keep unchecked)

- ✅ **Allow deletions** (keep unchecked)

#### Rules applied to administrators
- ✅ **Include administrators** (administrators must follow these rules)

### 3. Protect the `develop` Branch

Click **Add rule** and configure:

#### Branch name pattern
- `develop`

#### Protection Rules
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ☐ Dismiss stale PR approvals (more flexibility for development)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add status checks: `build`, `test`, `lint`

- ✅ **Require conversation resolution before merging**

#### Rules applied to administrators
- ☐ **Include administrators** (allow admin bypass for hotfixes)

### 4. Protect the `staging` Branch

Click **Add rule** and configure:

#### Branch name pattern
- `staging`

#### Protection Rules
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging

- ✅ **Require conversation resolution before merging**

## Rulesets (Alternative Approach)

GitHub now offers **Rulesets** as a more flexible alternative to branch protection rules:

### Creating a Ruleset
1. Go to **Settings** > **Rules** > **Rulesets**
2. Click **New ruleset**
3. Choose **Branch ruleset**

### Ruleset Configuration

#### Target branches
- Include by pattern: `main`, `develop`, `staging`
- Or create separate rulesets for each branch type

#### Rules
- **Restrict creations**: Prevent direct branch creation
- **Restrict updates**: Require pull requests
- **Restrict deletions**: Prevent branch deletion
- **Require a pull request before merging**
- **Require status checks to pass**
- **Block force pushes**

## Status Checks Setup

After setting up CI/CD with GitHub Actions, add these status checks:

### Required Status Checks
- `build` - Build passes successfully
- `test` - All tests pass
- `lint` - Code passes linting rules
- `typecheck` - TypeScript type checking passes
- `security` - Security scan passes (if configured)

### Example GitHub Actions Status Checks
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    name: build
    # ... build configuration
  
  test:
    name: test
    # ... test configuration
    
  lint:
    name: lint
    # ... lint configuration
    
  typecheck:
    name: typecheck
    # ... typecheck configuration
```

## CODEOWNERS File (Optional)

Create `.github/CODEOWNERS` to automatically request reviews:

```
# Global owners
* @courtneygreer-voxxy

# Frontend components
/components/ @courtneygreer-voxxy
/pages/ @courtneygreer-voxxy

# Configuration files
*.json @courtneygreer-voxxy
*.js @courtneygreer-voxxy
*.ts @courtneygreer-voxxy
```

## Verification Steps

After setting up protection rules:

1. **Test main branch protection**:
   ```bash
   git checkout main
   git push origin main
   # Should fail with protection error
   ```

2. **Test PR requirement**:
   - Create a feature branch
   - Push changes
   - Verify you cannot merge without PR

3. **Test review requirement**:
   - Create PR
   - Verify merge is blocked until review approval

4. **Test status checks**:
   - Verify merge is blocked until all checks pass

## Troubleshooting

### Common Issues

#### "Push protection" errors
- Ensure you're pushing to feature branches, not protected branches
- Use pull requests for protected branches

#### Status checks not appearing
- Verify GitHub Actions are configured
- Check workflow names match status check requirements

#### Admin bypass not working
- Check "Include administrators" setting
- Verify you have admin permissions

### Emergency Access

If you need emergency access to push directly:
1. Temporarily disable branch protection
2. Make necessary changes
3. Re-enable protection immediately
4. Document the emergency action

## Best Practices

1. **Start simple**: Begin with basic protection, add complexity gradually
2. **Test thoroughly**: Verify rules work as expected
3. **Document exceptions**: Keep track of any rule bypasses
4. **Regular review**: Periodically review and update protection rules
5. **Team communication**: Ensure team understands the workflow

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)