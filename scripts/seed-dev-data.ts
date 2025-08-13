#!/usr/bin/env tsx
// Development seed script for creating test organizations and events

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  limit,
  Timestamp
} from "firebase/firestore";

// Initialize Firebase with dev config
const firebaseConfig = {
  apiKey: "AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4",
  authDomain: "voxxy-presents-dev.firebaseapp.com",
  databaseURL: "https://voxxy-presents-dev-default-rtdb.firebaseio.com",
  projectId: "voxxy-presents-dev",
  storageBucket: "voxxy-presents-dev.firebasestorage.app",
  messagingSenderId: "21877606291",
  appId: "1:21877606291:web:4a3cf58073acd5e2d84a66",
  measurementId: "G-FTKDVEVRNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const organizationsRef = collection(db, 'organizations')
const eventsRef = collection(db, 'events')

// Standalone database functions for seeding
async function createOrganization(data: any) {
  const docRef = await addDoc(organizationsRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

async function getOrganizationBySlug(slug: string) {
  const q = query(organizationsRef, where('slug', '==', slug), limit(1))
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  }
  return null
}

async function createEvent(data: any) {
  const docRef = await addDoc(eventsRef, {
    ...data,
    date: Timestamp.fromDate(data.date),
    endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

async function seedDevData() {
  console.log('🌱 Starting development data seeding...')
  
  try {
    // Check if Voxxy Presents NYC already exists
    let voxxyOrg = await getOrganizationBySlug("voxxy-presents-nyc")
    
    if (!voxxyOrg) {
      console.log('📄 Creating Voxxy Presents NYC organization...')
      const orgId = await createOrganization({
        name: "Voxxy Presents NYC",
        slug: "voxxy-presents-nyc",
        description: "NYC's premier creative community for underground artists and music lovers",
        bio: "Voxxy Presents NYC curates intimate experiences that blend underground music, visual art, and community connection. We create spaces where emerging and established artists can share their craft with passionate audiences in unique Brooklyn venues.",
        contactEmail: "hello@voxxypresents.com",
        socialLinks: {
          instagram: "@voxxypresentsnyc",
          website: "https://www.voxxypresents.com",
          eventbrite: "https://eventbrite.com/voxxy-presents"
        },
        settings: {
          defaultLocation: "Brooklyn Venue Network",
          defaultAddress: "Various locations throughout Brooklyn, NY",
          theme: {
            primaryColor: "#8b5cf6",
            backgroundColor: "#0f0f23"
          }
        },
        ownerId: "dev-admin-user"
      })
      
      voxxyOrg = await getOrganizationBySlug("voxxy-presents-nyc")
      console.log(`✅ Voxxy Presents NYC created with ID: ${orgId}`)
    } else {
      console.log('✅ Voxxy Presents NYC already exists')
    }

    // Create sample events
    if (voxxyOrg) {
      console.log('🎵 Creating sample events...')
      
      // Event 1: Upcoming showcase
      await createEvent({
        organizationId: voxxyOrg.id,
        title: "Underground Showcase: Rising Stars",
        description: "An intimate evening featuring NYC's most promising underground artists",
        fullDescription: "Join us for an unforgettable night of raw talent and authentic artistry. This showcase features 5 carefully curated acts spanning indie rock, experimental electronic, and acoustic folk. Limited capacity ensures an intimate connection between artists and audience.",
        date: new Date("2025-08-15T20:00:00"),
        time: "8:00 PM - 11:00 PM",
        location: "The Underground",
        address: "123 Indie Street, Brooklyn, NY 11201",
        price: {
          type: "paid",
          amount: 15,
          description: "Presale: $15 | Door: $20",
          advancePrice: 15
        },
        capacity: 75,
        registrationRequired: true,
        eventbriteUrl: "https://eventbrite.com/underground-showcase-rising-stars",
        presaleEnabled: true,
        isRecurring: false,
        status: "published"
      })

      // Event 2: Free community event
      await createEvent({
        organizationId: voxxyOrg.id,
        title: "Open Mic & Community Jam",
        description: "Free weekly gathering for musicians, poets, and creatives to share their work",
        fullDescription: "Every Tuesday, we open our doors for artists of all levels to perform and connect. Bring your instrument, your poetry, or just your love for live art. Sign-ups start at 7 PM, performances begin at 7:30 PM.",
        date: new Date("2025-08-05T19:00:00"),
        time: "7:00 PM - 10:00 PM",
        location: "Collective Space",
        address: "456 Community Ave, Brooklyn, NY 11215",
        price: {
          type: "free",
          description: "Free event - donations appreciated"
        },
        registrationRequired: false,
        presaleEnabled: false,
        isRecurring: true,
        recurringDates: [
          {
            date: "2025-08-05",
            theme: "Acoustic Night",
            description: "Focus on acoustic performances and storytelling"
          },
          {
            date: "2025-08-12", 
            theme: "Electronic Experiments",
            description: "Electronic music and digital art showcase"
          },
          {
            date: "2025-08-19",
            theme: "Poetry & Spoken Word", 
            description: "Celebrating the power of words and voice"
          }
        ],
        status: "published"
      })

      console.log('✅ Sample events created successfully')
    }

    console.log('🎉 Development data seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding development data:', error)
  }
}

// Run the seeding function
seedDevData().then(() => {
  console.log('✨ Seeding process finished')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Fatal error during seeding:', error)
  process.exit(1)
})