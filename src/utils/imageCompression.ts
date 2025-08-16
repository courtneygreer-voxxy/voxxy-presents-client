// Image compression utility to handle Firestore 1MB field limit
export const compressImage = (file: File, maxSizeKB: number = 800, cropToSquare: boolean = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img
      
      if (cropToSquare) {
        // For square crop, use the smaller dimension and crop from center
        const size = Math.min(width, height)
        const maxSize = 400 // Max size for square logos
        const finalSize = Math.min(size, maxSize)
        
        canvas.width = finalSize
        canvas.height = finalSize

        // Calculate crop area (center the image)
        const cropX = (width - size) / 2
        const cropY = (height - size) / 2
        
        // Draw cropped square image
        ctx?.drawImage(img, cropX, cropY, size, size, 0, 0, finalSize, finalSize)
      } else {
        // Regular proportional resize
        const maxDimension = 1200
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
      }
      
      // Start with high quality and reduce until we hit target size
      let quality = 0.9
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      
      // Reduce quality until we're under the size limit
      while (dataUrl.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      
      resolve(dataUrl)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Validate file before compression
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml']
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or SVG)' }
  }
  
  // Allow larger source files since we'll compress them
  const maxSourceSize = 20 * 1024 * 1024 // 20MB source file limit
  if (file.size > maxSourceSize) {
    return { valid: false, error: 'Source file must be less than 20MB' }
  }
  
  return { valid: true }
}