// Design customization types for organization theming

export interface OrganizationDesign {
  // Background customization
  background: {
    type: 'color' | 'image' | 'gradient'
    value: string // hex color, image URL, or gradient definition
    opacity?: number // 0-1 for overlay opacity
    overlay?: string // overlay color for text readability
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right' // image positioning
    size?: 'cover' | 'contain' | 'auto' // image sizing
  }
  
  // Color theme
  theme: {
    primaryColor: string // Main brand color
    secondaryColor: string // Secondary/accent color  
    textColor: string // Primary text color
    accentColor: string // Highlights and links
  }
  
  // Layout preferences
  layout: {
    headerStyle: 'default' | 'minimal' | 'bold'
    contentAlignment: 'left' | 'center'
    cardStyle: 'default' | 'rounded' | 'minimal'
  }
  
  // Typography (future expansion)
  typography?: {
    fontFamily: string
    headingWeight: 'normal' | 'medium' | 'bold'
    bodySize: 'small' | 'medium' | 'large'
  }
}

export interface ImageSource {
  id: string
  url: string
  thumbnail: string
  name: string
  description?: string
  attribution?: string
  tags: string[]
  source: 'preset' | 'upload' | 'unsplash' | 'url'
  category?: 'professional' | 'artistic' | 'vibrant' | 'minimal' | 'nature'
  dimensions?: {
    width: number
    height: number
  }
  colors?: string[] // Dominant colors for smart matching
}

export interface AssetProvider {
  name: string
  searchImages(query: string, options?: any): Promise<ImageSource[]>
  getImageDetails(imageId: string): Promise<ImageSource | null>
  uploadAsset?(asset: AssetUpload): Promise<UploadResult>
}

// Design preset categories
export type DesignCategory = 'professional' | 'artistic' | 'vibrant' | 'minimal' | 'nature'

export interface DesignPreset {
  id: string
  name: string
  description: string
  category: DesignCategory
  preview: string // Preview image URL
  design: OrganizationDesign
  tags: string[]
  featured: boolean
}

// Color palette interface
export interface ColorPalette {
  name: string
  colors: {
    primary: string
    secondary: string
    text: string
    accent: string
    background: string
  }
  category: 'warm' | 'cool' | 'neutral' | 'bold' | 'pastel'
}

// Design preferences
export interface DesignPreferences {
  autoSave: boolean
  autoOptimize: boolean
  previewDelay: number // ms
  showGridOverlay: boolean
  highContrastPreview: boolean
}

// Design state management
export interface DesignState {
  current: OrganizationDesign
  preview: OrganizationDesign  
  isPreviewMode: boolean
  unsavedChanges: boolean
  isLoading: boolean
  error: string | null
  preferences: DesignPreferences
}

// Form data for design updates
export interface DesignUpdateRequest {
  organizationId: string
  design: Partial<OrganizationDesign>
}

// Asset upload types
export interface AssetUpload {
  file: File
  preview: string
  type: 'image' | 'logo' | 'banner'
  name: string
  size: number
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  assetId?: string
}