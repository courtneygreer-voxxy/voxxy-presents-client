// Default content for clubs to prevent blank pages
export const getDefaultAboutStory = (clubName: string): string => {
  return `Welcome to ${clubName}! We're building an amazing community where people come together to connect, create, and have fun. Our events are designed to bring out the best in everyone - whether you're here to learn something new, meet interesting people, or just enjoy great company.

Join us for our upcoming events and become part of our growing community!`
}

export const getDefaultOfferings = (): string[] => {
  return [
    'Community building',
    'Regular meetups',
    'Fun activities',
    'Networking opportunities'
  ]
}

// Check if content is "empty" (just default or whitespace)
export const isDefaultContent = (content: string | undefined, clubName: string): boolean => {
  if (!content || content.trim() === '') return true
  const defaultStory = getDefaultAboutStory(clubName)
  return content.trim() === defaultStory.trim()
}

// Get display content (use custom content or default)
export const getDisplayAboutStory = (customStory: string | undefined, clubName: string): string => {
  if (customStory && customStory.trim()) {
    return customStory
  }
  return getDefaultAboutStory(clubName)
}

export const getDisplayOfferings = (customOfferings: string[] | undefined): string[] => {
  if (customOfferings && customOfferings.some(offering => offering.trim())) {
    return customOfferings.filter(offering => offering.trim())
  }
  return getDefaultOfferings()
}