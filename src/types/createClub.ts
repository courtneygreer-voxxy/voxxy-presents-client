export interface CreateClubData {
  // Basic Info
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string

  // Branding
  logoUrl?: string
  bannerUrl?: string

  // Social & About
  socialLinks: {
    instagram?: string
    website?: string
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