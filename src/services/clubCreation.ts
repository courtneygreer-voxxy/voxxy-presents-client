import { createOrganization, getUser } from '@/lib/database'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CreateClubData } from '@/types/createClub'
import type { Organization } from '@/types/database'
import { getDefaultAboutStory, getDefaultOfferings, getDisplayAboutStory, getDisplayOfferings } from '@/utils/defaultContent'

// Generate URL-friendly slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Transform create club data to organization format
export const transformClubData = (data: CreateClubData, ownerId: string): Omit<Organization, 'id' | 'createdAt' | 'updatedAt'> => {
  const slug = generateSlug(data.name)
  
  // Filter out undefined values - Firebase doesn't accept them
  const organizationData: any = {
    name: data.name,
    slug,
    description: data.tagline, // Tagline maps to description (short tagline field)
    background: data.description, // Club description maps to background field
    aboutStory: getDisplayAboutStory(data.aboutStory, data.name),
    aboutOfferings: getDisplayOfferings(data.aboutOfferings),
    contactEmail: data.contactEmail,
    socialLinks: {},
    settings: {
      defaultLocation: data.defaultLocation || '',
      defaultAddress: data.defaultAddress || '',
      theme: {
        primaryColor: '#8B5CF6', // Purple default
        backgroundColor: '#FFFFFF'
      }
    },
    ownerId: ownerId
  }

  // Only add optional fields if they have values
  if (data.logoUrl) organizationData.logoUrl = data.logoUrl
  if (data.bannerUrl) organizationData.bannerUrl = data.bannerUrl
  // aboutStory is now always included with defaults above

  // Only add social links that have values
  if (data.socialLinks.instagram) organizationData.socialLinks.instagram = data.socialLinks.instagram
  if (data.socialLinks.website) organizationData.socialLinks.website = data.socialLinks.website
  if (data.socialLinks.eventbrite) organizationData.socialLinks.eventbrite = data.socialLinks.eventbrite
  if (data.socialLinks.meetup) organizationData.socialLinks.meetup = data.socialLinks.meetup
  if (data.socialLinks.linktree) organizationData.socialLinks.linktree = data.socialLinks.linktree
  if (data.socialLinks.venmo) organizationData.socialLinks.venmo = data.socialLinks.venmo
  if (data.socialLinks.other) organizationData.socialLinks.other = data.socialLinks.other

  return organizationData
}

// Main club creation function
export const createClub = async (data: CreateClubData, ownerId: string): Promise<{ id: string; slug: string }> => {
  try {
    const organizationData = transformClubData(data, ownerId)
    const id = await createOrganization(organizationData)
    
    // Update the user's organizationIds array to include the new club
    try {
      const userDocRef = doc(db, 'users', ownerId)
      await updateDoc(userDocRef, {
        organizationIds: arrayUnion(id),
        updatedAt: new Date()
      })
    } catch (userUpdateError) {
      console.error('Failed to update user organizationIds:', userUpdateError)
      // Don't throw here - club creation was successful, just log the error
    }
    
    return {
      id,
      slug: organizationData.slug
    }
  } catch (error) {
    console.error('Failed to create club:', error)
    throw new Error('Failed to create club. Please try again.')
  }
}