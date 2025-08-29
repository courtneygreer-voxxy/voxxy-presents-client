# 🚨 Operations Runbook

## Emergency Recovery

### Production Site Down
```bash
git checkout main
git revert HEAD~1        # Emergency rollback
git push origin main     
```

### Email System Down
1. Check SendGrid status: https://status.sendgrid.com
2. Verify Cloud Run environment variables still exist
3. Set EMAIL_TEST_MODE=true to prevent further failures
4. Check API logs in Google Cloud Console

### Database Issues  
1. Check Firebase status: https://status.firebase.google.com
2. Verify service account permissions
3. Test API health: https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/health

### Build Failures
- Check TypeScript errors: `npm run build`
- Verify dependencies: `npm install`  
- Cloud Run: Don't use `--set-env-vars` (replaces all variables)

## Daily Checks
- [ ] API health endpoint responds
- [ ] Contact forms submit successfully
- [ ] Admin dashboard loads
- [ ] No critical errors in logs