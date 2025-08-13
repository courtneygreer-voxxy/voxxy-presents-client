import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { 
  Organization, 
  Event, 
  Registration, 
  Waitlist,
  User, 
  CreateEventData, 
  UpdateEventData,
  CreateRegistrationData,
  CreateWaitlistData 
} from '@/types/database'

// Collection references
export const organizationsRef = collection(db, 'organizations')
export const eventsRef = collection(db, 'events')
export const registrationsRef = collection(db, 'registrations')
export const waitlistsRef = collection(db, 'waitlists')
export const usersRef = collection(db, 'users')

// Organizations
export const createOrganization = async (data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(organizationsRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

export const getOrganization = async (id: string): Promise<Organization | null> => {
  const docRef = doc(db, 'organizations', id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Organization
  }
  return null
}

export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
  const q = query(organizationsRef, where('slug', '==', slug), limit(1))
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Organization
  }
  return null
}

export const updateOrganization = async (id: string, updates: Partial<Organization>) => {
  const docRef = doc(db, 'organizations', id)
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now()
  }
  
  await updateDoc(docRef, updateData)
  
  // Return the updated organization
  const updatedDoc = await getDoc(docRef)
  if (updatedDoc.exists()) {
    const data = updatedDoc.data()
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Organization
  }
  throw new Error('Failed to retrieve updated organization')
}

// Events
export const createEvent = async (data: CreateEventData) => {
  const docRef = await addDoc(eventsRef, {
    ...data,
    date: Timestamp.fromDate(data.date),
    endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

export const getEvent = async (id: string): Promise<Event | null> => {
  const docRef = doc(db, 'events', id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      date: data.date.toDate(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Event
  }
  return null
}

export const getEventsByOrganization = async (organizationId: string): Promise<Event[]> => {
  const q = query(
    eventsRef, 
    where('organizationId', '==', organizationId),
    orderBy('date', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    }
  }) as Event[]
}

export const updateEvent = async (id: string, data: UpdateEventData) => {
  const docRef = doc(db, 'events', id)
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now()
  }
  
  // Convert dates to Timestamps if they exist
  if (data.date) {
    updateData.date = Timestamp.fromDate(data.date)
  }
  if (data.endDate) {
    updateData.endDate = Timestamp.fromDate(data.endDate)
  }
  
  await updateDoc(docRef, updateData)
}

export const deleteEvent = async (id: string) => {
  const docRef = doc(db, 'events', id)
  await deleteDoc(docRef)
}

// Waitlists
export const createWaitlistEntry = async (data: CreateWaitlistData) => {
  // Get current waitlist size for this event (simple single-field query)
  const q = query(
    waitlistsRef,
    where('eventId', '==', data.eventId)
  )
  
  const querySnapshot = await getDocs(q)
  const position = querySnapshot.size + 1 // Next position in line
  
  const docRef = await addDoc(waitlistsRef, {
    ...data,
    position,
    joinedAt: Timestamp.now()
  })
  
  return { id: docRef.id, position }
}

export const getWaitlistByEvent = async (eventId: string): Promise<Waitlist[]> => {
  const q = query(
    waitlistsRef,
    where('eventId', '==', eventId),
    orderBy('position', 'asc')
  )
  
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      joinedAt: data.joinedAt.toDate(),
      notifiedAt: data.notifiedAt?.toDate()
    }
  }) as Waitlist[]
}

// Registrations (simplified - no waitlist logic)
export const createRegistration = async (data: CreateRegistrationData) => {
  const docRef = await addDoc(registrationsRef, {
    ...data,
    registeredAt: Timestamp.now()
  })
  
  return docRef.id
}

export const getRegistrationsByEvent = async (eventId: string): Promise<Registration[]> => {
  const q = query(
    registrationsRef,
    where('eventId', '==', eventId),
    orderBy('registeredAt', 'asc')
  )
  
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      registeredAt: data.registeredAt.toDate(),
      confirmedAt: data.confirmedAt?.toDate(),
      cancelledAt: data.cancelledAt?.toDate(),
      lastEmailSent: data.lastEmailSent?.toDate()
    }
  }) as Registration[]
}

// Users
export const createUser = async (uid: string, data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = doc(db, 'users', uid)
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}

export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as User
  }
  return null
}