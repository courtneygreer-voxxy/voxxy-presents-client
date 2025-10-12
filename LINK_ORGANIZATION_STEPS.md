# Link Casual Acapella Collective to Your Account

## Organization Details:
- **Name**: Casual Acapella Collective
- **Slug**: `casual-acapella-collective`
- **ID**: `LpRTx31RFerqsxavCfbt`
- **Current Owner**: `pilot-demo-owner` (placeholder)

## Steps to Link to Your Account:

### 1. Access Firebase Console
Go to: https://console.firebase.google.com/project/voxxy-presents/firestore/data

### 2. Find Your User ID
1. Click on the `users` collection
2. Find the document where `email = "courtneygreer@voxxyai.com"`
3. **Copy the document ID** (this is your user ID)
   - Example: `abc123xyz456` (yours will be different)

### 3. Update the Organization
1. Navigate to the `organizations` collection
2. Find document with ID: **`LpRTx31RFerqsxavCfbt`**
3. Click to edit
4. Find the `ownerId` field
5. Change from: `"pilot-demo-owner"`
6. Change to: **Your user ID from step 2**
7. Save

### 4. Update Your User Document
1. Go back to the `users` collection
2. Open your user document (from step 2)
3. Find or create the `organizationIds` field:
   - If it **exists**: Add `"LpRTx31RFerqsxavCfbt"` to the array
   - If it **doesn't exist**: Create it as: `["LpRTx31RFerqsxavCfbt"]`
4. Save

### 5. Verify
1. Go to: https://www.voxxypresents.com/organizer/dashboard
2. You should now see "Casual Acapella Collective" in your clubs list!
3. Go to: https://www.voxxypresents.com/casual-acapella-collective
4. The public page should be live!
5. Go to: https://www.voxxypresents.com/casual-acapella-collective/admin
6. You should have admin access!

---

## Alternative: Quick Script Method

If you want to automate this, here's what we'd need to add to the API:

```typescript
// GET /api/users?email={email}
// Returns: { id, email, organizationIds, ... }

// PATCH /api/users/{userId}
// Body: { organizationIds: [...] }
```

For now, manual Firebase update is fastest! Takes ~2 minutes.

---

## Troubleshooting

**If organization doesn't appear in dashboard:**
- Double-check the organization ID in your `organizationIds` array
- Make sure it's a string: `"LpRTx31RFerqsxavCfbt"` not `LpRTx31RFerqsxavCfbt`
- Refresh the page or log out/log in

**If you can't access admin:**
- Verify `ownerId` in organization matches your user ID
- Check that your user `role` is `"organizer"` (not just `"user"`)
- Check that your `betaStatus` is `"approved"`

---

## When Ready for Trisha

When you're ready to transfer to Trisha Tyagi:

1. Have her create an account at voxxypresents.com
2. Get her user ID from Firebase
3. Update organization's `ownerId` to her user ID
4. Add organization ID to her `organizationIds` array
5. Remove organization ID from your `organizationIds` array
6. Done! She now owns it.

---

**Organization is live at**: https://www.voxxypresents.com/casual-acapella-collective

