export interface CreateClubData {
  // Basic Info
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string
  
  // Social & About
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    meetup?: string
    linktree?: string
    venmo?: string
    other?: string
  }
  aboutStory?: string
  aboutOfferings?: string[]
}

export interface CreateClubStepProps {
  data: CreateClubData
  updateData: (updates: Partial<CreateClubData>) => void
  onNext: () => void
}

export interface CreateClubPreviewProps extends CreateClubStepProps {
  isCreating: boolean
  onCreate: () => void
}