# Firebase Security Checklist

## ✅ Completed

- [x] Move Firebase config to environment variables
- [x] Add .env.local to .gitignore
- [x] Create production-ready Firestore rules

## 🔄 To Do Before Production

### 1. Update Firestore Rules
Replace your current test rules with the production rules in `firestore.rules`:

```bash
# Copy the rules from firestore.rules to Firebase Console > Firestore Database > Rules
```

### 2. Set Up Budget Alerts in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your `voxxy-presents` project
3. Go to **Billing** > **Budgets & alerts**
4. Create budget alert for $10/month (adjust as needed)

### 3. Configure Firebase Quotas
In Firebase Console:
1. Go to **Usage and billing**
2. Set up **Spark Plan** limits:
   - Firestore: 50K reads/day, 20K writes/day
   - Auth: 100 sign-ins/day
3. Monitor usage in first month

### 4. Enable App Check (Optional but Recommended)
1. Go to Firebase Console > **App Check**
2. Enable for your web app
3. Add domain verification

### 5. Environment Variables for Render
Add these to your Render dashboard (get values from Firebase Console > Project Settings):
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🔒 Security Features

### Firestore Rules Summary:
- **Organizations**: Public read, only owners can write
- **Events**: Public read, only org owners can write  
- **Registrations**: Anyone can register, only org owners can manage
- **Users**: Users can only access their own data
- **Admin functions**: Require proper authentication

### Data Protection:
- No sensitive data exposed to client
- Email validation before allowing registrations
- Proper user authentication required for admin functions
- Rate limiting through Firebase quotas

## 📊 Monitoring

### Key Metrics to Watch:
- Daily Firestore reads/writes
- Authentication attempts
- Storage usage
- Function invocations (if using Cloud Functions)

### Red Flags:
- Sudden spike in database operations
- Unusual authentication patterns
- High bandwidth usage
- Many failed requests

## 🚨 Emergency Actions

If you see suspicious activity:
1. **Immediately** update Firestore rules to be more restrictive
2. Check Firebase Console > **Authentication** for unusual sign-ins
3. Review **Usage and billing** for unexpected charges
4. Enable stricter rate limiting if needed

## 💰 Cost Estimates

**Spark Plan (Free Tier) Limits:**
- Firestore: 50K reads, 20K writes, 1GB storage/day
- Auth: Unlimited (but rate limited)
- Hosting: 10GB transfer/month

**Expected Monthly Cost (with normal usage):**
- **Month 1-3**: $0 (within free tier)
- **Steady state**: $5-15/month for small-medium usage
- **High traffic**: $20-50/month

**Cost drivers to watch:**
- Firestore operations (reads are cheaper than writes)
- Storage (images, user data)
- Bandwidth (file downloads)