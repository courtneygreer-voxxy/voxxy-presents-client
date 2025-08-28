import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { designService, designCache, saveDesignWithOptimization } from '@/services/designService'
import { optimizeDesign, designPerformanceMonitor } from '@/utils/designOptimization'
import type { OrganizationDesign, DesignState, DesignPreferences } from '@/types/design'

// Design Context Types
interface DesignContextValue {
  designState: DesignState
  updatePreviewDesign: (design: Partial<OrganizationDesign>) => void
  saveDesign: () => Promise<void>
  resetDesign: () => void
  togglePreviewMode: () => void
  setDesignPreferences: (preferences: Partial<DesignPreferences>) => void
  getComputedStyles: (design: OrganizationDesign) => React.CSSProperties
}

interface DesignProviderProps {
  children: React.ReactNode
  organization: {
    id: string
    settings?: {
      design?: OrganizationDesign
    }
  }
  onDesignSave?: (design: OrganizationDesign) => Promise<void>
}

// Default design configuration
export const DEFAULT_DESIGN: OrganizationDesign = {
  background: {
    type: 'color',
    value: '#ffffff',
    opacity: 1,
    size: 'cover',
    position: 'center'
  },
  theme: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    textColor: '#000000',
    accentColor: '#3b82f6'
  },
  layout: {
    headerStyle: 'default',
    contentAlignment: 'left',
    cardStyle: 'default'
  }
}

// Design reducer for state management
type DesignAction = 
  | { type: 'UPDATE_PREVIEW'; payload: Partial<OrganizationDesign> }
  | { type: 'SAVE_DESIGN_START' }
  | { type: 'SAVE_DESIGN_SUCCESS'; payload: OrganizationDesign }
  | { type: 'SAVE_DESIGN_ERROR'; payload: string }
  | { type: 'RESET_DESIGN' }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SET_PREFERENCES'; payload: Partial<DesignPreferences> }

function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'UPDATE_PREVIEW':
      return {
        ...state,
        preview: { ...state.preview, ...action.payload },
        unsavedChanges: true,
        error: null
      }
    
    case 'SAVE_DESIGN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'SAVE_DESIGN_SUCCESS':
      return {
        ...state,
        current: action.payload,
        preview: action.payload,
        unsavedChanges: false,
        isLoading: false,
        error: null
      }
    
    case 'SAVE_DESIGN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    
    case 'RESET_DESIGN':
      return {
        ...state,
        preview: state.current,
        unsavedChanges: false,
        error: null
      }
    
    case 'TOGGLE_PREVIEW_MODE':
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode
      }
    
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      }
    
    default:
      return state
  }
}

// Create context
const DesignContext = createContext<DesignContextValue | null>(null)

// Custom hook to use design context
export function useDesign() {
  const context = useContext(DesignContext)
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return context
}

// Design provider component
export function DesignProvider({ children, organization, onDesignSave }: DesignProviderProps) {
  const initialDesign = organization.settings?.design || DEFAULT_DESIGN
  
  const [designState, dispatch] = useReducer(designReducer, {
    current: initialDesign,
    preview: initialDesign,
    isPreviewMode: false,
    unsavedChanges: false,
    isLoading: false,
    error: null,
    preferences: {
      autoSave: false,
      autoOptimize: true,
      previewDelay: 300,
      showGridOverlay: false,
      highContrastPreview: false
    }
  })

  // Auto-save functionality
  useEffect(() => {
    if (!designState.preferences.autoSave || !designState.unsavedChanges) return

    const timeoutId = setTimeout(() => {
      saveDesign()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [designState.preview, designState.preferences.autoSave])

  const updatePreviewDesign = useCallback((design: Partial<OrganizationDesign>) => {
    dispatch({ type: 'UPDATE_PREVIEW', payload: design })
  }, [])

  const saveDesign = useCallback(async () => {
    if (!designState.unsavedChanges) return

    const stopTiming = designPerformanceMonitor.startTiming('save-design')
    dispatch({ type: 'SAVE_DESIGN_START' })

    try {
      let designToSave = designState.preview

      // Apply optimizations if enabled
      if (designState.preferences.autoOptimize !== false) {
        const optimizationResult = await optimizeDesign(designToSave, {
          compressImages: true,
          optimizeColors: true,
          generateWebP: true
        })
        designToSave = optimizationResult.design
      }

      if (onDesignSave) {
        await onDesignSave(designToSave)
      } else {
        // Use mock save for now since backend isn't set up
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Update cache
      if (organization?.id) {
        designCache.set(organization.id, designToSave)
      }
      
      dispatch({ type: 'SAVE_DESIGN_SUCCESS', payload: designToSave })
    } catch (error) {
      dispatch({ 
        type: 'SAVE_DESIGN_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to save design'
      })
    } finally {
      stopTiming()
    }
  }, [designState.preview, designState.preferences, designState.unsavedChanges, onDesignSave, organization.id])

  const resetDesign = useCallback(() => {
    dispatch({ type: 'RESET_DESIGN' })
  }, [])

  const togglePreviewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
  }, [])

  const setDesignPreferences = useCallback((preferences: Partial<DesignPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences })
  }, [])

  const getComputedStyles = useCallback((design: OrganizationDesign): React.CSSProperties => {
    const styles = {
      '--design-primary-color': design.theme.primaryColor,
      '--design-secondary-color': design.theme.secondaryColor,
      '--design-text-color': design.theme.textColor,
      '--design-accent-color': design.theme.accentColor,
      '--design-background': design.background.type === 'color' 
        ? design.background.value
        : design.background.type === 'gradient'
        ? design.background.value
        : `url(${design.background.value})`,
      '--design-background-size': design.background.size || 'cover',
      '--design-background-position': design.background.position || 'center',
      '--design-background-opacity': design.background.opacity || 1,
    } as React.CSSProperties

    // Add overlay if specified
    if (design.background.overlay) {
      (styles as any)['--design-background-overlay'] = design.background.overlay
    }

    return styles
  }, [])

  const contextValue: DesignContextValue = {
    designState,
    updatePreviewDesign,
    saveDesign,
    resetDesign,
    togglePreviewMode,
    setDesignPreferences,
    getComputedStyles
  }

  return (
    <DesignContext.Provider value={contextValue}>
      {children}
    </DesignContext.Provider>
  )
}

// Additional utility hooks for common design operations
export function useDesignStyles(): React.CSSProperties {
  const { designState, getComputedStyles } = useDesign()
  return getComputedStyles(designState.preview)
}

export function useDesignValue<T extends keyof OrganizationDesign>(path: T): OrganizationDesign[T] {
  const { designState } = useDesign()
  return designState.preview[path]
}

export function useDesignPreferences(): [
  DesignPreferences,
  (preferences: Partial<DesignPreferences>) => void
] {
  const { designState, setDesignPreferences } = useDesign()
  return [designState.preferences, setDesignPreferences]
}

// Design validation utilities
export function validateDesign(design: OrganizationDesign): string[] {
  const errors: string[] = []

  // Color validation
  const colorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i
  if (!colorRegex.test(design.theme.primaryColor)) {
    errors.push('Primary color must be a valid hex color')
  }
  if (!colorRegex.test(design.theme.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color')
  }
  if (!colorRegex.test(design.theme.textColor)) {
    errors.push('Text color must be a valid hex color')
  }
  if (!colorRegex.test(design.theme.accentColor)) {
    errors.push('Accent color must be a valid hex color')
  }

  // Background validation
  if (design.background.type === 'color' && !colorRegex.test(design.background.value)) {
    errors.push('Background color must be a valid hex color')
  }
  if (design.background.type === 'image' && !design.background.value.startsWith('http')) {
    errors.push('Background image must be a valid URL')
  }

  // Opacity validation
  if (design.background.opacity !== undefined && 
      (design.background.opacity < 0 || design.background.opacity > 1)) {
    errors.push('Background opacity must be between 0 and 1')
  }

  return errors
}

// Color contrast utilities for accessibility
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation - in production, use a proper color contrast library
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const gamma = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    
    return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b)
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export function checkColorAccessibility(design: OrganizationDesign): {
  primaryOnBackground: boolean
  textOnBackground: boolean
  accentOnBackground: boolean
} {
  const backgroundColor = design.background.type === 'color' ? design.background.value : '#ffffff'
  
  return {
    primaryOnBackground: getContrastRatio(design.theme.primaryColor, backgroundColor) >= 4.5,
    textOnBackground: getContrastRatio(design.theme.textColor, backgroundColor) >= 4.5,
    accentOnBackground: getContrastRatio(design.theme.accentColor, backgroundColor) >= 3.0
  }
}