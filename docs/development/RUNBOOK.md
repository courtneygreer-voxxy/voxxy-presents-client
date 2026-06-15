# Operations Runbook

## Emergency Recovery

### Production Site Down

```bash
git checkout main
git revert HEAD~1        # Emergency rollback
git push origin main
```

### Email System Down

1. Check SendGrid status: https://status.sendgrid.com
2. Verify Render environment variables still exist
3. Set EMAIL_TEST_MODE=true to prevent further failures
4. Check API logs in Render dashboard

### Database Issues

1. Check Rails API health: https://www.heyvoxxy.com/health
2. Verify database connection in Render dashboard
3. Check PostgreSQL status

### Build Failures

- Check TypeScript errors: `npm run build`
- Verify dependencies: `npm install`
- Check Render deployment logs

## Daily Checks

- [ ] API health endpoint responds
- [ ] Contact forms submit successfully
- [ ] Admin dashboard loads
- [ ] No critical errors in logs

## API URLs

- **Production**: https://www.heyvoxxy.com/api
- **Development/Staging**: https://www.voxxyai.com/api
