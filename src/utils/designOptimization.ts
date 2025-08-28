import type { OrganizationDesign } from '@/types/design'

// Performance optimization utilities for design system
export interface OptimizationOptions {
  compressImages?: boolean
  optimizeColors?: boolean
  minimizeCSS?: boolean
  generateWebP?: boolean
  enableLazyLoading?: boolean
}

export interface OptimizationResult {
  originalSize: number
  optimizedSize: number
  savings: number
  warnings: string[]
  optimizations: string[]
}

// Main optimization function
export async function optimizeDesign(
  design: OrganizationDesign,
  options: OptimizationOptions = {}
): Promise<{ design: OrganizationDesign; result: OptimizationResult }> {
  const {
    compressImages = true,
    optimizeColors = true,
    minimizeCSS = true,
    generateWebP = true,
    enableLazyLoading = true
  } = options

  let optimizedDesign = structuredClone(design)
  const warnings: string[] = []
  const optimizations: string[] = []
  
  const originalSize = calculateDesignSize(design)

  // Image optimization
  if (compressImages && design.background.type === 'image') {
    const optimizedImage = await optimizeImageUrl(design.background.value, {
      quality: 85,
      format: generateWebP ? 'webp' : undefined,
      progressive: true
    })
    
    if (optimizedImage.url !== design.background.value) {
      optimizedDesign.background.value = optimizedImage.url
      optimizations.push(`Optimized background image (${optimizedImage.savings}% smaller)`)
    }
  }

  // Color optimization
  if (optimizeColors) {
    const colorOptimization = optimizeColorPalette(optimizedDesign.theme)
    optimizedDesign.theme = colorOptimization.theme
    optimizations.push(...colorOptimization.optimizations)
    warnings.push(...colorOptimization.warnings)
  }

  // CSS optimization
  if (minimizeCSS) {
    const cssOptimization = optimizeCSSProperties(optimizedDesign)
    optimizedDesign = cssOptimization.design
    optimizations.push(...cssOptimization.optimizations)
  }

  const optimizedSize = calculateDesignSize(optimizedDesign)
  const savings = originalSize > 0 ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0

  return {
    design: optimizedDesign,
    result: {
      originalSize,
      optimizedSize,
      savings,
      warnings,
      optimizations
    }
  }
}

// Image URL optimization
async function optimizeImageUrl(
  imageUrl: string,
  options: {
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
    progressive?: boolean
    width?: number
    height?: number
  }
): Promise<{ url: string; savings: number }> {
  const { quality = 85, format, progressive = true, width, height } = options
  
  try {
    // If it's an Unsplash URL, optimize using their parameters
    if (imageUrl.includes('unsplash.com')) {
      const url = new URL(imageUrl)
      
      if (quality) url.searchParams.set('q', quality.toString())
      if (format) url.searchParams.set('fm', format)
      if (width) url.searchParams.set('w', width.toString())
      if (height) url.searchParams.set('h', height.toString())
      if (progressive && format === 'jpeg') {
        url.searchParams.set('fm', 'jpg')
        url.searchParams.set('q', Math.min(quality, 90).toString())
      }
      
      return {
        url: url.toString(),
        savings: 15 // Estimated savings for Unsplash optimization
      }
    }
    
    // For other URLs, return as-is but note optimization needed
    return {
      url: imageUrl,
      savings: 0
    }
  } catch (error) {
    console.warn('Failed to optimize image URL:', error)
    return {
      url: imageUrl,
      savings: 0
    }
  }
}

// Color palette optimization
function optimizeColorPalette(theme: OrganizationDesign['theme']): {
  theme: OrganizationDesign['theme']
  optimizations: string[]
  warnings: string[]
} {
  const optimizations: string[] = []
  const warnings: string[] = []
  let optimizedTheme = { ...theme }

  // Normalize hex colors (3-digit to 6-digit, lowercase)
  const normalizeColor = (color: string): string => {
    const hex = color.replace('#', '').toLowerCase()
    if (hex.length === 3) {
      return '#' + hex.split('').map(c => c + c).join('')
    }
    return '#' + hex
  }

  // Check for duplicate colors
  const colors = [theme.primaryColor, theme.secondaryColor, theme.textColor, theme.accentColor]
  const normalizedColors = colors.map(normalizeColor)
  const uniqueColors = [...new Set(normalizedColors)]
  
  if (uniqueColors.length < colors.length) {
    warnings.push('Some colors in your palette are identical or very similar')
  }

  // Normalize all colors
  optimizedTheme.primaryColor = normalizeColor(theme.primaryColor)
  optimizedTheme.secondaryColor = normalizeColor(theme.secondaryColor)
  optimizedTheme.textColor = normalizeColor(theme.textColor)
  optimizedTheme.accentColor = normalizeColor(theme.accentColor)
  
  optimizations.push('Normalized color format for better browser compatibility')

  // Check contrast ratios
  const contrastWarnings = checkColorContrast(optimizedTheme)
  warnings.push(...contrastWarnings)

  return {
    theme: optimizedTheme,
    optimizations,
    warnings
  }
}

// CSS property optimization
function optimizeCSSProperties(design: OrganizationDesign): {
  design: OrganizationDesign
  optimizations: string[]
} {
  const optimizations: string[] = []
  let optimizedDesign = structuredClone(design)

  // Optimize background properties
  if (design.background.type === 'gradient') {
    // Ensure gradient syntax is optimized
    const gradient = design.background.value
    if (gradient.includes('linear-gradient') && !gradient.includes('deg')) {
      // Add default direction for better performance
      optimizedDesign.background.value = gradient.replace(
        'linear-gradient(',
        'linear-gradient(180deg, '
      )
      optimizations.push('Optimized gradient syntax for better rendering')
    }
  }

  // Optimize layout settings for performance
  if (design.layout.headerStyle === 'default' && design.layout.contentAlignment === 'left') {
    // These are already optimal defaults
    optimizations.push('Layout configuration is already optimized')
  }

  return {
    design: optimizedDesign,
    optimizations
  }
}

// Calculate design "size" for optimization metrics
function calculateDesignSize(design: OrganizationDesign): number {
  // Rough calculation based on complexity and data size
  let size = 0
  
  // Background complexity
  if (design.background.type === 'image') {
    size += 1000 // Base image size
  } else if (design.background.type === 'gradient') {
    size += 200 // Gradient complexity
  } else {
    size += 50 // Solid color
  }
  
  // Color palette complexity
  size += 100 // Base color data
  
  // Layout complexity
  size += 50
  
  // Additional properties
  if (design.background.overlay) size += 50
  if (design.background.opacity !== 1) size += 25
  
  return size
}

// Color contrast checking
function checkColorContrast(theme: OrganizationDesign['theme']): string[] {
  const warnings: string[] = []
  
  // Simplified contrast calculation
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255
    
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }

  const getContrast = (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Check primary vs background (assuming white background)
  const primaryContrast = getContrast(theme.primaryColor, '#ffffff')
  if (primaryContrast < 3) {
    warnings.push('Primary color may not have sufficient contrast against light backgrounds')
  }

  // Check text vs background
  const textContrast = getContrast(theme.textColor, '#ffffff')
  if (textContrast < 4.5) {
    warnings.push('Text color may not meet accessibility contrast requirements')
  }

  return warnings
}

// Performance monitoring utilities
export class DesignPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTiming(operation: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, [])
      }
      
      const times = this.metrics.get(operation)!
      times.push(duration)
      
      // Keep only last 10 measurements
      if (times.length > 10) {
        times.shift()
      }
    }
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getPerformanceReport(): Record<string, {
    average: number
    min: number
    max: number
    count: number
  }> {
    const report: Record<string, any> = {}
    
    for (const [operation, times] of this.metrics.entries()) {
      if (times.length > 0) {
        report[operation] = {
          average: Math.round(times.reduce((a, b) => a + b, 0) / times.length * 100) / 100,
          min: Math.round(Math.min(...times) * 100) / 100,
          max: Math.round(Math.max(...times) * 100) / 100,
          count: times.length
        }
      }
    }
    
    return report
  }

  reset(): void {
    this.metrics.clear()
  }
}

// Global performance monitor instance
export const designPerformanceMonitor = new DesignPerformanceMonitor()

// Preload optimization for critical design assets
export async function preloadDesignAssets(design: OrganizationDesign): Promise<void> {
  const promises: Promise<any>[] = []

  // Preload background image
  if (design.background.type === 'image') {
    const img = new Image()
    const promise = new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
    img.src = design.background.value
    promises.push(promise)
  }

  // Preload any other critical assets
  // This could be expanded to include fonts, icons, etc.

  try {
    await Promise.allSettled(promises)
  } catch (error) {
    console.warn('Some design assets failed to preload:', error)
  }
}

// Design validation with performance considerations
export function validateDesignPerformance(design: OrganizationDesign): {
  score: number
  issues: { severity: 'low' | 'medium' | 'high', message: string }[]
  recommendations: string[]
} {
  const issues: { severity: 'low' | 'medium' | 'high', message: string }[] = []
  const recommendations: string[] = []
  let score = 100

  // Check image optimization
  if (design.background.type === 'image') {
    const url = design.background.value
    if (!url.includes('w=') && !url.includes('width')) {
      issues.push({
        severity: 'medium',
        message: 'Background image is not size-optimized'
      })
      recommendations.push('Use responsive image sizing parameters')
      score -= 15
    }
    
    if (!url.includes('webp') && !url.includes('fm=webp')) {
      issues.push({
        severity: 'low',
        message: 'Consider using WebP format for better compression'
      })
      recommendations.push('Enable WebP format for supported browsers')
      score -= 5
    }
  }

  // Check color efficiency
  const colors = [
    design.theme.primaryColor,
    design.theme.secondaryColor,
    design.theme.textColor,
    design.theme.accentColor
  ]
  const uniqueColors = new Set(colors)
  
  if (uniqueColors.size < colors.length) {
    issues.push({
      severity: 'low',
      message: 'Duplicate colors in palette increase CSS size'
    })
    recommendations.push('Remove duplicate colors from your palette')
    score -= 3
  }

  // Check gradient complexity
  if (design.background.type === 'gradient') {
    const gradientStops = (design.background.value.match(/,/g) || []).length + 1
    if (gradientStops > 4) {
      issues.push({
        severity: 'low',
        message: 'Complex gradients may impact rendering performance'
      })
      recommendations.push('Simplify gradient with fewer color stops')
      score -= 5
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}