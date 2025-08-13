#!/usr/bin/env tsx
// Data synchronization script for staging environment
// Syncs production data to staging for testing

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";

// Production Firebase config
const productionConfig = {
  apiKey: "AIzaSyCllC4e-OZWJLdu97cgmEyuxpq75_ln5Ms",
  authDomain: "voxxy-presents.firebaseapp.com",
  databaseURL: "https://voxxy-presents-default-rtdb.firebaseio.com",
  projectId: "voxxy-presents",
  storageBucket: "voxxy-presents.firebasestorage.app",
  messagingSenderId: "267601188129",
  appId: "1:267601188129:web:ce80873298d39444ac1a60",
  measurementId: "G-Q74Z0C9R28"
};

// Staging Firebase config
const stagingConfig = {
  apiKey: "AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4",
  authDomain: "voxxy-presents-staging.firebaseapp.com",
  databaseURL: "https://voxxy-presents-staging-default-rtdb.firebaseio.com",
  projectId: "voxxy-presents-staging",
  storageBucket: "voxxy-presents-staging.firebasestorage.app",
  messagingSenderId: "21877606291",
  appId: "1:21877606291:web:4a3cf58073acd5e2d84a66",
  measurementId: "G-FTKDVEVRNK"
};

// Initialize Firebase apps
const productionApp = initializeApp(productionConfig, 'production');
const stagingApp = initializeApp(stagingConfig, 'staging');

const productionDb = getFirestore(productionApp);
const stagingDb = getFirestore(stagingApp);

const COLLECTIONS_TO_SYNC = ['organizations', 'events', 'registrations'];

async function syncCollection(collectionName: string) {
  console.log(`📦 Syncing ${collectionName}...`);
  
  try {
    // Get all documents from production
    const productionCollection = collection(productionDb, collectionName);
    const productionSnapshot = await getDocs(productionCollection);
    
    // Clear staging collection first
    const stagingCollection = collection(stagingDb, collectionName);
    const stagingSnapshot = await getDocs(stagingCollection);
    
    const batch = writeBatch(stagingDb);
    
    // Delete existing staging documents
    stagingSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Add production documents to staging
    productionSnapshot.docs.forEach((docSnapshot) => {
      const stagingDocRef = doc(stagingDb, collectionName, docSnapshot.id);
      batch.set(stagingDocRef, docSnapshot.data());
    });
    
    await batch.commit();
    
    console.log(`✅ Synced ${productionSnapshot.docs.length} documents in ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error syncing ${collectionName}:`, error);
    throw error;
  }
}

async function syncAllData() {
  console.log('🔄 Starting data synchronization from production to staging...');
  console.log(`📊 Production: ${productionConfig.projectId}`);
  console.log(`📊 Staging: ${stagingConfig.projectId}`);
  console.log('');
  
  try {
    for (const collectionName of COLLECTIONS_TO_SYNC) {
      await syncCollection(collectionName);
    }
    
    console.log('');
    console.log('🎉 Data synchronization completed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log('  - Production data has been copied to staging');
    console.log('  - Staging environment now has up-to-date test data');
    console.log('  - Ready for staging deployments and testing');
    
  } catch (error) {
    console.error('💥 Data synchronization failed:', error);
    process.exit(1);
  }
}

// Run the synchronization
syncAllData().then(() => {
  console.log('✨ Sync process finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error during sync:', error);
  process.exit(1);
});