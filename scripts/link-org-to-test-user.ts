import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, '../voxxy-presents-firebase-adminsdk.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function linkOrganizationToUser() {
  const orgId = 'LpRTx31RFerqsxavCfbt';
  const userEmail = 'org-test@voxxypresents.com';

  try {
    console.log('Step 1: Finding user by email:', userEmail);

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error('❌ User not found with email:', userEmail);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log('✅ Found user:', userId);
    console.log('Current user data:', {
      email: userData.email,
      role: userData.role,
      betaStatus: userData.betaStatus,
      organizationIds: userData.organizationIds || []
    });

    // Step 2: Update organization's ownerId
    console.log('\nStep 2: Updating organization ownerId...');
    await db.collection('organizations').doc(orgId).update({
      ownerId: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Organization ownerId updated to:', userId);

    // Step 3: Add organization to user's organizationIds
    console.log('\nStep 3: Adding organization to user organizationIds...');
    const currentOrgIds = userData.organizationIds || [];
    const updatedOrgIds = currentOrgIds.includes(orgId)
      ? currentOrgIds
      : [...currentOrgIds, orgId];

    const userUpdates: any = {
      organizationIds: updatedOrgIds,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Step 4: Ensure user has proper role and beta status
    if (userData.role !== 'organizer') {
      console.log('\nStep 4: Updating user role to organizer...');
      userUpdates.role = 'organizer';
    }

    if (userData.betaStatus !== 'approved') {
      console.log('Updating user betaStatus to approved...');
      userUpdates.betaStatus = 'approved';
      userUpdates.betaApprovedAt = admin.firestore.FieldValue.serverTimestamp();
      userUpdates.betaApprovedBy = 'system';
    }

    await db.collection('users').doc(userId).update(userUpdates);

    console.log('\n✅ User updated successfully');
    console.log('Updated fields:', userUpdates);

    // Verify the changes
    console.log('\n=== Verification ===');
    const updatedOrgDoc = await db.collection('organizations').doc(orgId).get();
    const updatedOrgData = updatedOrgDoc.data();
    console.log('Organization ownerId:', updatedOrgData?.ownerId);

    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const updatedUserData = updatedUserDoc.data();
    console.log('User organizationIds:', updatedUserData?.organizationIds);
    console.log('User role:', updatedUserData?.role);
    console.log('User betaStatus:', updatedUserData?.betaStatus);

    console.log('\n✅ SUCCESS! Organization linked to user.');
    console.log('\nThe user can now:');
    console.log('- Log in at: https://www.voxxypresents.com');
    console.log('- View admin dashboard at: https://www.voxxypresents.com/organizer/dashboard');
    console.log('- Manage organization at: https://www.voxxypresents.com/casual-acapella-collective/admin');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

linkOrganizationToUser();
