#!/usr/bin/env tsx
// Development seed script that ingests demo data from docs/demo-data/voxxy_presents_demo_seed_data.md

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { VenueHours } from '../src/types/venue'

// ----------------------------------------------------------------------------
// Firebase configuration (shared dev project)
// ----------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: 'AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4',
  authDomain: 'voxxy-presents-dev.firebaseapp.com',
  databaseURL: 'https://voxxy-presents-dev-default-rtdb.firebaseio.com',
  projectId: 'voxxy-presents-dev',
  storageBucket: 'voxxy-presents-dev.firebasestorage.app',
  messagingSenderId: '21877606291',
  appId: '1:21877606291:web:4a3cf58073acd5e2d84a66',
  measurementId: 'G-FTKDVEVRNK'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const organizationsRef = collection(db, 'organizations')
const eventsRef = collection(db, 'events')
const venuesRef = collection(db, 'venues')
const usersRef = collection(db, 'users')

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type MarkdownRecord = Record<string, string>

type ParsedOrganization = {
  id: string
  name: string
  slug: string
  description: string
  bio?: string
  contactEmail: string
  backgroundStyle?: string
  background?: string
  ownerId: string
  socialLinks: Record<string, string>
  aboutStory?: string
  aboutImages?: string[]
  aboutOfferings?: string[]
  settings: {
    defaultLocation: string
    defaultAddress: string
    theme: {
      primaryColor: string
      backgroundColor: string
    }
  }
}

type ParsedVenue = {
  slug: string
  name: string
  description: string
  address: string
  coordinates?: { lat: number; lng: number }
  hours?: VenueHours
  capacity?: number
  venueType?: string
  amenities?: string[]
  photos?: string[]
  contactInfo: Record<string, string>
  accessibility: Record<string, boolean>
  pricingType?: 'paid' | 'free' | 'both'
  ownerId: string
}

type ParsedEvent = {
  id: string
  organizationSlug: string
  organizationName?: string
  title: string
  description?: string
  fullDescription?: string
  date: string
  endDate?: string
  time?: string
  duration?: string
  location?: string
  address?: string
  venueSlug?: string
  venueName?: string
  price: {
    type: 'free' | 'paid' | 'group_deal'
    amount?: number
    description?: string
    advancePrice?: number
  }
  capacity?: number
  registrationRequired?: boolean
  presaleEnabled?: boolean
  isRecurring?: boolean
  series?: { name: string; description?: string }
  tags?: string[]
  imageUrl?: string
  heroImageUrl?: string
  status?: 'draft' | 'presale' | 'published' | 'sold_out' | 'cancelled' | 'completed'
}

type ParsedBudget = {
  eventId: string
  lineItems: Array<{
    category: 'revenue' | 'expense'
    type: string
    description: string
    plannedAmount: number
  }>
}

type ParsedUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'organizer' | 'venue_owner'
}

type ParsedDataset = {
  organizations: ParsedOrganization[]
  venues: ParsedVenue[]
  events: ParsedEvent[]
  budgets: ParsedBudget[]
  users: ParsedUser[]
}

// ----------------------------------------------------------------------------
// Markdown parsing helpers
// ----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SEED_FILE_PATH = path.resolve(__dirname, '../docs/demo-data/voxxy_presents_demo_seed_data.md')

const SLUG_STATUS_MAP: Record<string, ParsedEvent['status']> = {
  'voxxy-neon-noodles:-street-food-social': 'published',
  'voxxy-vinyl-and-vibes:-listening-lounge': 'sold_out',
  'voxxy-gallery-after-hours:-pop-up-collab': 'presale',
  'voxxy-patio-sessions:-fireside-chats': 'published',
  'anime-anime-trivia:-isekai-night': 'presale',
  'anime-anime-trivia:-mecha-masters': 'sold_out'
}

const VENUE_HOURS_MAP: Record<string, VenueHours> = {
  'crystal-lake-brooklyn': createHours({ mon: '17:00-01:00', tue: '17:00-01:00', wed: '17:00-01:00', thu: '17:00-01:00', fri: '17:00-02:00', sat: '15:00-02:00', sun: '15:00-00:00' }),
  'atelier-williamsburg-gallery': createHours({ wed: '12:00-19:00', thu: '12:00-19:00', fri: '12:00-19:00', sat: '12:00-19:00', sun: '12:00-19:00' }),
  'astoria-commons-park': createHours({ daily: '06:00-22:00' }),
  'uptown-grounds-harlem': createHours({ daily: '07:00-19:00' }),
  'village-beans-gv': createHours({ mon: '07:30-18:00', tue: '07:30-18:00', wed: '07:30-18:00', thu: '07:30-18:00', fri: '07:30-18:00', sat: '08:00-18:00', sun: '08:00-18:00' }),
  'bushwick-botanica': createHours({ daily: '12:00-22:00' }),
  'beacon-patio-kitchen': createHours({ wed: '12:00-21:00', thu: '12:00-21:00', fri: '12:00-21:00', sat: '12:00-21:00', sun: '12:00-21:00' }),
  'east-village-evening-cafe': createHours({ mon: '07:00-14:00', tue: '07:00-14:00', wed: '07:00-14:00', thu: '07:00-14:00', fri: '07:00-14:00', sat: '08:00-14:00', sun: '08:00-14:00' })
}

function createHours(spec: Record<string, string>): VenueHours {
  const map: Record<string, string[]> = {
    mon: ['monday'],
    tue: ['tuesday'],
    wed: ['wednesday'],
    thu: ['thursday'],
    fri: ['friday'],
    sat: ['saturday'],
    sun: ['sunday'],
    daily: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }

  const hours: VenueHours = {}
  Object.entries(spec).forEach(([key, value]) => {
    const [open, close] = value.split('-')
    const days = map[key] ?? []
    days.forEach(day => {
      hours[day as keyof VenueHours] = { open, close }
    })
  })
  return hours
}

function normalizeQuotes(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
}

function parseArray(value?: string): string[] | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return undefined
  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return []
  return inner
    .split(',')
    .map(item => normalizeQuotes(item.trim()).replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean)
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined
  const normalized = value.trim()
  if (normalized === '') return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseTable(section: string): MarkdownRecord {
  const rows = section.match(/^\|.*\|$/gm) ?? []
  const record: MarkdownRecord = {}

  rows.forEach(row => {
    const parts = row.split('|').slice(1, -1).map(part => part.trim())
    if (parts.length >= 2) {
      const field = parts[0].replace(/^`|`$/g, '')
      const rawValue = parts[1]
      if (field) {
        record[field] = normalizeQuotes(rawValue.replace(/^`|`$/g, '').trim())
      }
    }
  })

  return record
}

function setNestedValue(target: Record<string, any>, pathKey: string, value: any) {
  if (value === undefined) return
  const normalizedPath = pathKey.replace(/\['([^']+)'\]/g, '.$1')
  const segments = normalizedPath.split('.')

  let current = target
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value
    } else {
      current[segment] = current[segment] ?? {}
      current = current[segment]
    }
  })
}

function parseOrganizations(chunks: string[]): ParsedOrganization[] {
  return chunks.map(chunk => {
    const table = parseTable(chunk)
    const organization: ParsedOrganization = {
      id: table['id'] ?? table['slug'],
      name: table['name'] ?? table['slug'],
      slug: table['slug'] ?? table['id'],
      description: table['description'] ?? '',
      bio: table['bio'],
      contactEmail: table['contactEmail'] ?? 'hello@example.com',
      backgroundStyle: table['backgroundStyle'],
      background: table['background'],
      ownerId: table['ownerId'] ?? 'demo-admin@voxxy.ai',
      socialLinks: {},
      aboutStory: table['aboutStory'],
      aboutImages: parseArray(table['aboutImages']) ?? [],
      aboutOfferings: parseArray(table['aboutOfferings']) ?? [],
      settings: {
        defaultLocation: table['settings.defaultLocation'] ?? 'New York, NY',
        defaultAddress: table['settings.defaultAddress'] ?? 'New York, NY',
        theme: {
          primaryColor: table['settings.theme.primaryColor'] ?? '#8b5cf6',
          backgroundColor: table['settings.theme.backgroundColor'] ?? '#080820'
        }
      }
    }

    Object.entries(table).forEach(([key, value]) => {
      if (key.startsWith('socialLinks.')) {
        const socialKey = key.split('.')[1]
        organization.socialLinks[socialKey] = value
      }
    })

    return organization
  })
}

function parseVenues(chunks: string[]): ParsedVenue[] {
  return chunks.map(chunk => {
    const table = parseTable(chunk)
    const slug = table['slug']
    const venue: ParsedVenue = {
      slug,
      name: table['name'] ?? slug,
      description: table['description'] ?? '',
      address: table['address'] ?? 'New York, NY',
      coordinates: (table['coordinates.lat'] && table['coordinates.lng'])
        ? {
            lat: parseFloat(table['coordinates.lat']),
            lng: parseFloat(table['coordinates.lng'])
          }
        : undefined,
      hours: VENUE_HOURS_MAP[slug] ?? undefined,
      capacity: parseNumber(table['capacity']),
      venueType: table['venueType'] as ParsedVenue['venueType'],
      amenities: parseArray(table['amenities']) ?? [],
      photos: parseArray(table['photos']) ?? [],
      contactInfo: {},
      accessibility: {},
      pricingType: table['pricingType'] as ParsedVenue['pricingType'],
      ownerId: table['ownerId'] ?? 'demo-admin@voxxy.ai'
    }

    Object.entries(table).forEach(([key, value]) => {
      if (key.startsWith('contactInfo.')) {
        const contactKey = key.split('.')[1]
        if (value) {
          venue.contactInfo[contactKey] = value
        }
      }
      if (key.startsWith('accessibility.')) {
        const accessKey = key.split('.')[1]
        venue.accessibility[accessKey] = parseBoolean(value) ?? false
      }
    })

    return venue
  })
}

function parseEvents(chunks: string[]): ParsedEvent[] {
  return chunks.map(chunk => {
    const table = parseTable(chunk)
    const headerMatch = chunk.match(/<!--[^>]*status:\s*([a-z_]+)[^>]*-->/i)
    const status = headerMatch ? headerMatch[1].toLowerCase() as ParsedEvent['status'] : undefined

    const base: ParsedEvent = {
      id: table['id'],
      organizationSlug: table['organizationSlug'],
      organizationName: table['organizationName'],
      title: table['title'] ?? table['id'],
      description: table['description'],
      fullDescription: table['fullDescription'],
      date: table['date'],
      endDate: table['endDate'] || undefined,
      time: table['time'],
      duration: table['duration'],
      location: table['location'],
      address: table['address'],
      venueSlug: normalizeVenueSlug(table['venueSlug']),
      venueName: table['venueName'],
      price: {
        type: (table['price.type'] as ParsedEvent['price']['type']) ?? 'free',
        amount: parseNumber(table['price.amount']),
        description: table['price.description'],
        advancePrice: parseNumber(table['price.advancePrice'])
      },
      capacity: parseNumber(table['capacity']),
      registrationRequired: parseBoolean(table['registrationRequired']) ?? false,
      presaleEnabled: parseBoolean(table['presaleEnabled']) ?? undefined,
      isRecurring: parseBoolean(table['isRecurring']) ?? false,
      series: table['series.name'] ? { name: table['series.name'], description: table['series.description'] } : undefined,
      tags: parseArray(table['tags']) ?? [],
      imageUrl: table['imageUrl'],
      heroImageUrl: table['heroImageUrl'],
      status: status ?? SLUG_STATUS_MAP[table['id']] ?? 'published'
    }

    return base
  })
}

function normalizeVenueSlug(slug?: string): string | undefined {
  if (!slug) return undefined
  const trimmed = slug.trim().toLowerCase()
  if (trimmed === 'tbd' || trimmed === 'to be announced') return undefined
  return trimmed
}

function parseBudgets(chunks: string[]): ParsedBudget[] {
  return chunks.map(chunk => {
    const headerMatch = chunk.match(/Budget \u2013 Event\s+`([^`]+)`/)
    const fallbackMatch = chunk.match(/Budget – Event\s+`([^`]+)`/)
    const eventId = headerMatch?.[1] ?? fallbackMatch?.[1]
    if (!eventId) {
      throw new Error('Budget section missing event ID header')
    }

    const rows = chunk.match(/^\|.*\|$/gm) ?? []
    const dataRows = rows.slice(1) // Skip header row

    const lineItems = dataRows.map(row => {
      const parts = row.split('|').slice(1, -1).map(part => normalizeQuotes(part.trim()))
      const [category, type, description, plannedAmount] = parts
      return {
        category: category as 'revenue' | 'expense',
        type,
        description,
        plannedAmount: Number(plannedAmount)
      }
    })

    return { eventId, lineItems }
  })
}

function parseUsers(chunk: string): ParsedUser[] {
  const rows = chunk.match(/^\|.*\|$/gm) ?? []
  const dataRows = rows.slice(1)

  return dataRows.map(row => {
    const parts = row.split('|').slice(1, -1).map(part => part.trim())
    const [id, name, email, role] = parts
    return {
      id,
      name,
      email,
      role: role as ParsedUser['role']
    }
  })
}

function parseMarkdownSeedData(filePath: string): ParsedDataset {
  const content = readFileSync(filePath, 'utf8')

  const organizationChunks = Array.from(content.matchAll(/### Organization[\s\S]+?(?=\n### |\n---|$)/g)).map(match => match[0])
  const venueChunks = Array.from(content.matchAll(/### Venue[\s\S]+?(?=\n### |\n---|$)/g)).map(match => match[0])
  const eventChunks = Array.from(content.matchAll(/### Event[\s\S]+?(?=\n### |\n---|$)/g)).map(match => match[0])
  const budgetChunks = Array.from(content.matchAll(/### Budget[\s\S]+?(?=\n### |\n---|$)/g)).map(match => match[0])

  const usersSection = content.match(/## 4\. Demo Users[\s\S]+?(?=\n## |$)/)
  const users = usersSection ? parseUsers(usersSection[0]) : []

  return {
    organizations: parseOrganizations(organizationChunks),
    venues: parseVenues(venueChunks),
    events: parseEvents(eventChunks),
    budgets: parseBudgets(budgetChunks),
    users
  }
}

// ----------------------------------------------------------------------------
// Firestore helpers
// ----------------------------------------------------------------------------

const dataset = parseMarkdownSeedData(SEED_FILE_PATH)

const ensureDemoUsers = async () => {
  const now = Timestamp.now()

  if (dataset.users.length === 0) {
    dataset.users.push({
      id: 'courtneygreer@voxxyai.com',
      name: 'Courtney Greer',
      email: 'courtneygreer@voxxyai.com',
      role: 'admin'
    })
  }

  for (const user of dataset.users) {
    const userRef = doc(usersRef, user.id)
    const snapshot = await getDoc(userRef)
    const createdAt = snapshot.exists() ? snapshot.data().createdAt ?? now : now

    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      role: user.role,
      emailNotifications: true,
      betaStatus: 'approved',
      betaAccess: true,
      approvalStatus: 'approved',
      organizationIds: snapshot.exists() ? snapshot.data().organizationIds ?? [] : [],
      venueOwnerProfile: snapshot.exists() ? snapshot.data().venueOwnerProfile : undefined,
      demo: true,
      createdAt,
      updatedAt: now
    }, { merge: true })
  }
}

const removeStaleDocuments = async () => {
  const keepOrgIds = new Set(dataset.organizations.map(org => org.id))
  const keepVenueIds = new Set(dataset.venues.map(venue => venue.slug))

  const orgSnapshots = await getDocs(query(organizationsRef, where('demo', '==', true)))
  for (const docSnap of orgSnapshots.docs) {
    if (!keepOrgIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref)
    }
  }

  const venueSnapshots = await getDocs(query(venuesRef, where('demo', '==', true)))
  for (const docSnap of venueSnapshots.docs) {
    if (!keepVenueIds.has(docSnap.id)) {
      await deleteDoc(docSnap.ref)
    }
  }
}

const upsertOrganization = async (org: ParsedOrganization) => {
  const now = Timestamp.now()
  const orgRef = doc(organizationsRef, org.id)
  const snapshot = await getDoc(orgRef)
  const createdAt = snapshot.exists() ? snapshot.data().createdAt ?? now : now

  await setDoc(orgRef, {
    name: org.name,
    slug: org.slug,
    description: org.description,
    bio: org.bio,
    contactEmail: org.contactEmail,
    backgroundStyle: org.backgroundStyle,
    background: org.background,
    ownerId: org.ownerId,
    socialLinks: org.socialLinks,
    aboutStory: org.aboutStory,
    aboutImages: org.aboutImages,
    aboutOfferings: org.aboutOfferings,
    settings: org.settings,
    status: 'active',
    demo: true,
    createdAt,
    updatedAt: now
  }, { merge: true })
}

const upsertVenue = async (venue: ParsedVenue, approvedBy: string) => {
  const now = Timestamp.now()
  const venueRef = doc(venuesRef, venue.slug)
  const snapshot = await getDoc(venueRef)
  const createdAt = snapshot.exists() ? snapshot.data().createdAt ?? now : now

  await setDoc(venueRef, {
    slug: venue.slug,
    name: venue.name,
    description: venue.description,
    address: venue.address,
    coordinates: venue.coordinates,
    hours: venue.hours,
    capacity: venue.capacity,
    venueType: venue.venueType,
    amenities: venue.amenities,
    photos: venue.photos,
    contactInfo: venue.contactInfo,
    accessibility: venue.accessibility,
    pricingType: venue.pricingType,
    ownerId: venue.ownerId,
    claimStatus: 'approved',
    approvedBy,
    approvedAt: snapshot.exists() ? snapshot.data().approvedAt ?? now : now,
    demo: true,
    createdAt,
    updatedAt: now
  }, { merge: true })
}

const setUserOwnership = async (userId: string, organizationIds: string[], venueIds: string[]) => {
  const userRef = doc(usersRef, userId)
  const snapshot = await getDoc(userRef)
  if (!snapshot.exists()) return

  const profile = snapshot.data().venueOwnerProfile ?? {
    venueIds: [],
    onboardingCompleted: true,
    preferredContactMethod: 'email'
  }

  await updateDoc(userRef, {
    organizationIds: Array.from(new Set([...(snapshot.data().organizationIds ?? []), ...organizationIds])),
    venueOwnerProfile: {
      ...profile,
      venueIds: Array.from(new Set([...(profile.venueIds ?? []), ...venueIds])),
      onboardingCompleted: true,
      preferredContactMethod: 'email'
    },
    updatedAt: Timestamp.now()
  })
}

const clearExistingDemoEvents = async () => {
  const existing = await getDocs(query(eventsRef, where('demo', '==', true)))
  for (const docSnap of existing.docs) {
    await deleteDoc(doc(eventsRef, docSnap.id))
  }
}

const addEvent = async (event: ParsedEvent, organizationId: string, venueId?: string) => {
  const now = Timestamp.now()
  const eventRef = doc(eventsRef, event.id)
  const snapshot = await getDoc(eventRef)
  const createdAt = snapshot.exists() ? snapshot.data().createdAt ?? now : now

  const toTimestamp = (value?: string) => {
    if (!value) return null
    return Timestamp.fromDate(new Date(value))
  }

  await setDoc(eventRef, {
    organizationId,
    organizationName: event.organizationName,
    title: event.title,
    description: event.description,
    fullDescription: event.fullDescription,
    date: toTimestamp(event.date),
    endDate: toTimestamp(event.endDate),
    time: event.time,
    duration: event.duration,
    location: event.location,
    address: event.address,
    venueSlug: event.venueSlug,
    venueName: event.venueName,
    venueId,
    price: event.price,
    capacity: event.capacity,
    registrationRequired: event.registrationRequired,
    presaleEnabled: event.presaleEnabled,
    isRecurring: event.isRecurring,
    series: event.series,
    tags: event.tags,
    imageUrl: event.imageUrl,
    heroImageUrl: event.heroImageUrl,
    status: event.status ?? 'published',
    demo: true,
    createdAt,
    updatedAt: now
  }, { merge: true })
}

// ----------------------------------------------------------------------------
// Main workflow
// ----------------------------------------------------------------------------

const seedDevData = async () => {
  console.log('🌱 Starting development data seeding from markdown dataset...')

  try {
    await ensureDemoUsers()
    await removeStaleDocuments()

    const organizationIdMap = new Map<string, string>()
    for (const org of dataset.organizations) {
      await upsertOrganization(org)
      organizationIdMap.set(org.slug, org.id)
      console.log(`🏛️ Upserted organization: ${org.name}`)
    }

    const venueIdMap = new Map<string, string>()
    for (const venue of dataset.venues) {
      await upsertVenue(venue, dataset.users[0]?.id ?? 'demo-admin@voxxy.ai')
      venueIdMap.set(venue.slug, venue.slug)
      console.log(`🏢 Upserted venue: ${venue.name}`)
    }

    // Ownership
    const organizationIdsByOwner = new Map<string, string[]>()
    dataset.organizations.forEach(org => {
      const current = organizationIdsByOwner.get(org.ownerId) ?? []
      organizationIdsByOwner.set(org.ownerId, [...current, org.id])
    })

    const venueIdsByOwner = new Map<string, string[]>()
    dataset.venues.forEach(venue => {
      const current = venueIdsByOwner.get(venue.ownerId) ?? []
      venueIdsByOwner.set(venue.ownerId, [...current, venue.slug])
    })

    for (const [ownerId, orgIds] of organizationIdsByOwner.entries()) {
      const venueIds = venueIdsByOwner.get(ownerId) ?? []
      await setUserOwnership(ownerId, orgIds, venueIds)
    }

    await clearExistingDemoEvents()

    for (const event of dataset.events) {
      const organizationId = organizationIdMap.get(event.organizationSlug)
      if (!organizationId) {
        console.warn(`⚠️ Skipping event ${event.id}: organization ${event.organizationSlug} not found`)
        continue
      }

      const venueFirestoreId = event.venueSlug ? venueIdMap.get(event.venueSlug) : undefined
      await addEvent(event, organizationId, venueFirestoreId)
      console.log(`🎫 Added event: ${event.title}`)
    }

    console.log('🎉 Development data seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during development data seeding:', error)
  }
}

seedDevData()
  .then(() => {
    console.log('✨ Seeding process finished')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Fatal seeding error:', error)
    process.exit(1)
  })

