/**
 * Email Variables Utility
 *
 * Variable Format: [bracket] format is used throughout the system
 * - Frontend UI: [eventName], [firstName], etc.
 * - Backend database: [eventName], [firstName], etc.
 * - Backend resolver: EmailVariableResolver expects [bracket] format
 *
 * Note: Old emails may still have {{mustache}} format in database.
 * The backendToFrontend() function converts {{mustache}} → [bracket] for backwards compatibility.
 * The frontendToBackend() function keeps [bracket] format (does NOT convert to {{mustache}}).
 */

export interface EmailVariable {
  // User-friendly display name (shown in buttons)
  label: string

  // Variable format: [eventName]
  // Both frontend and backend use this same format
  frontendVar: string

  // Deprecated: kept for backwards compatibility
  // Backend actually uses same [bracket] format as frontendVar
  backendVar: string

  // Category for grouping
  category: 'event' | 'organization' | 'vendor' | 'computed' | 'links'

  // Help text
  description: string

  // Example value
  example: string

  // Whether this variable works in invitation emails (Position 1)
  // Invitation emails only have access to event + vendor_contact data
  // Category-specific and registration-level variables don't work in invitations
  worksInInvitations: boolean
}

export const EMAIL_VARIABLES: EmailVariable[] = [
  // Event Variables
  {
    label: 'Event Name',
    frontendVar: '[eventName]',
    backendVar: '{{event_title}}',
    category: 'event',
    description: 'Name of the event',
    example: 'Summer Market 2025',
    worksInInvitations: true,
  },
  {
    label: 'Event Date',
    frontendVar: '[eventDate]',
    backendVar: '{{event_date}}',
    category: 'event',
    description: 'Date of the event',
    example: 'June 15, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Event End Date',
    frontendVar: '[eventEndDate]',
    backendVar: '{{event_end_date}}',
    category: 'event',
    description: 'End date of the event (for multi-day events)',
    example: 'June 17, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Date Range',
    frontendVar: '[dateRange]',
    backendVar: '{{date_range}}',
    category: 'event',
    description: 'Formatted date range for multi-day events (e.g., "June 15-17, 2025")',
    example: 'June 15-17, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Event Time',
    frontendVar: '[eventTime]',
    backendVar: '{{event_time}}',
    category: 'event',
    description: 'Time of the event',
    example: '10:00 AM - 6:00 PM',
    worksInInvitations: true,
  },
  {
    label: 'Event Location',
    frontendVar: '[eventLocation]',
    backendVar: '{{event_location}}',
    category: 'event',
    description: 'City and state of the event',
    example: 'Atlanta, GA',
    worksInInvitations: true,
  },
  {
    label: 'Event City',
    frontendVar: '[eventCity]',
    backendVar: '{{event_city}}',
    category: 'event',
    description: 'City of the event',
    example: 'Atlanta',
    worksInInvitations: true,
  },
  {
    label: 'Event State',
    frontendVar: '[eventState]',
    backendVar: '{{event_state}}',
    category: 'event',
    description: 'State/region of the event',
    example: 'GA',
    worksInInvitations: true,
  },
  {
    label: 'Event Address',
    frontendVar: '[eventAddress]',
    backendVar: '{{event_address}}',
    category: 'event',
    description: 'Street address of the event',
    example: '123 Johnson Street',
    worksInInvitations: true,
  },
  {
    label: 'Event Venue',
    frontendVar: '[eventVenue]',
    backendVar: '{{event_venue}}',
    category: 'event',
    description: 'Venue name/title of the event location',
    example: 'Piedmont Park',
    worksInInvitations: true,
  },
  {
    label: 'Event Description',
    frontendVar: '[eventDescription]',
    backendVar: '{{event_description}}',
    category: 'event',
    description: 'Event description text',
    example: 'A family-friendly outdoor market...',
    worksInInvitations: true,
  },
  {
    label: 'Application Deadline',
    frontendVar: '[applicationDeadline]',
    backendVar: '{{application_deadline}}',
    category: 'event',
    description: 'Last day to apply',
    example: 'May 30, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Category Price',
    frontendVar: '[boothPrice]',
    backendVar: '{{booth_price}}',
    category: 'event',
    description: 'Cost per booth (category-specific - only works after vendor applies)',
    example: '$150.00',
    worksInInvitations: false,
  },
  {
    label: 'Early Bird Price',
    frontendVar: '[earlyBirdPrice]',
    backendVar: '{{early_bird_price}}',
    category: 'event',
    description:
      'Early bird discounted price (category-specific - only works after vendor applies)',
    example: '$125.00',
    worksInInvitations: false,
  },
  {
    label: 'Early Bird Deadline',
    frontendVar: '[earlyBirdDeadline]',
    backendVar: '{{early_bird_deadline}}',
    category: 'event',
    description: 'Deadline for early bird pricing',
    example: 'May 15, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Jury Fee',
    frontendVar: '[juryFee]',
    backendVar: '{{jury_fee}}',
    category: 'event',
    description: 'Non-refundable jury/application fee (category-specific)',
    example: '$25.00',
    worksInInvitations: true,
  },
  {
    label: 'Commission Rate',
    frontendVar: '[commissionRate]',
    backendVar: '{{commission_rate}}',
    category: 'event',
    description:
      'Commission percentage on sales (category-specific - only works after vendor applies)',
    example: '10%',
    worksInInvitations: false,
  },
  {
    label: 'Payment Due Date',
    frontendVar: '[paymentDueDate]',
    backendVar: '{{payment_due_date}}',
    category: 'event',
    description: 'Payment deadline',
    example: 'June 1, 2025',
    worksInInvitations: true,
  },
  {
    label: 'Age Restriction',
    frontendVar: '[ageRestriction]',
    backendVar: '{{age_restriction}}',
    category: 'event',
    description: 'Age policy for the event',
    example: '21+',
    worksInInvitations: true,
  },

  // Organization Variables
  {
    label: 'Organization Name',
    frontendVar: '[organizationName]',
    backendVar: '{{organization_name}}',
    category: 'organization',
    description: 'Your organization name',
    example: 'Voxxy',
    worksInInvitations: true,
  },
  {
    label: 'Organization Email',
    frontendVar: '[organizationEmail]',
    backendVar: '{{organization_email}}',
    category: 'organization',
    description: 'Your contact email',
    example: 'hello@heyvoxxy.com',
    worksInInvitations: true,
  },

  // Vendor Variables
  {
    label: 'First Name',
    frontendVar: '[firstName]',
    backendVar: '{{first_name}}',
    category: 'vendor',
    description: "Vendor's first name",
    example: 'John',
    worksInInvitations: true,
  },
  {
    label: 'Last Name',
    frontendVar: '[lastName]',
    backendVar: '{{last_name}}',
    category: 'vendor',
    description: "Vendor's last name",
    example: 'Doe',
    worksInInvitations: true,
  },
  {
    label: 'Full Name',
    frontendVar: '[fullName]',
    backendVar: '{{full_name}}',
    category: 'vendor',
    description: "Vendor's full name",
    example: 'John Doe',
    worksInInvitations: true,
  },
  {
    label: 'Business Name',
    frontendVar: '[businessName]',
    backendVar: '{{business_name}}',
    category: 'vendor',
    description: "Vendor's business name",
    example: "John's Tacos",
    worksInInvitations: true,
  },
  {
    label: 'Email',
    frontendVar: '[email]',
    backendVar: '{{email}}',
    category: 'vendor',
    description: "Vendor's email address",
    example: 'john@example.com',
    worksInInvitations: true,
  },
  {
    label: 'Phone',
    frontendVar: '[phone]',
    backendVar: '{{phone}}',
    category: 'vendor',
    description: "Vendor's phone number",
    example: '(555) 123-4567',
    worksInInvitations: true,
  },
  {
    label: 'Website',
    frontendVar: '[website]',
    backendVar: '{{website}}',
    category: 'vendor',
    description: "Vendor's website URL",
    example: 'https://johnstacos.com',
    worksInInvitations: true,
  },
  {
    label: 'Category',
    frontendVar: '[vendorCategory]',
    backendVar: '{{vendor_category}}',
    category: 'vendor',
    description: 'Application type vendor applied for (only works after they apply)',
    example: 'Food',
    worksInInvitations: false,
  },
  {
    label: 'Category Description',
    frontendVar: '[categoryDescription]',
    backendVar: '{{category_description}}',
    category: 'vendor',
    description: 'Description of the vendor category they applied for',
    example: 'Local restaurants and food service vendors',
    worksInInvitations: false,
  },
  {
    label: 'Install Date',
    frontendVar: '[installDate]',
    backendVar: '{{install_date}}',
    category: 'vendor',
    description: 'Vendor setup date (category-specific - only works after they apply)',
    example: 'June 14, 2025',
    worksInInvitations: false,
  },
  {
    label: 'Install Time',
    frontendVar: '[installTime]',
    backendVar: '{{install_time}}',
    category: 'vendor',
    description: 'Vendor setup time range (category-specific - only works after they apply)',
    example: '8:00 AM - 10:00 AM',
    worksInInvitations: false,
  },
  {
    label: 'Install Start Time',
    frontendVar: '[installStartTime]',
    backendVar: '{{install_start_time}}',
    category: 'vendor',
    description: 'Setup start time (category-specific - only works after they apply)',
    example: '8:00 AM',
    worksInInvitations: false,
  },
  {
    label: 'Install End Time',
    frontendVar: '[installEndTime]',
    backendVar: '{{install_end_time}}',
    category: 'vendor',
    description: 'Setup end time (category-specific - only works after they apply)',
    example: '10:00 AM',
    worksInInvitations: false,
  },
  {
    label: 'Category Payment Link',
    frontendVar: '[categoryPaymentLink]',
    backendVar: '{{category_payment_link}}',
    category: 'links',
    description: 'Payment link for the specific vendor category (only works after they apply)',
    example: 'https://pay.stripe.com/...',
    worksInInvitations: false,
  },

  // Link Variables
  {
    label: 'Apply to Event',
    frontendVar: '[eventLink]',
    backendVar: '{{event_link}}',
    category: 'links',
    description: 'Public application page URL - where vendors apply to your event',
    example: 'https://voxxy.io/events/org-slug/event-slug-123',
    worksInInvitations: true,
  },
  {
    label: 'Event Dashboard',
    frontendVar: '[eventPortalLink]',
    backendVar: '{{event_portal_link}}',
    category: 'links',
    description: 'Vendor portal/dashboard link (requires email to access)',
    example: 'https://voxxy.io/portal/org-slug/event-slug-123',
    worksInInvitations: true,
  },
  {
    label: 'Unsubscribe Link',
    frontendVar: '[unsubscribeLink]',
    backendVar: '{{unsubscribe_link}}',
    category: 'links',
    description: 'Unsubscribe URL (required for all emails)',
    example: 'https://voxxy.io/unsubscribe/abc123token',
    worksInInvitations: true,
  },
  {
    label: 'Application Code',
    frontendVar: '[applicationCode]',
    backendVar: '{{application_code}}',
    category: 'vendor',
    description: 'Unique application reference code (only available after application)',
    example: 'APP-2024-12345',
    worksInInvitations: false,
  },

  // Vendor Payment Info (TODO: backend migration needed)
  {
    label: 'Eventbrite Email',
    frontendVar: '[eventbriteEmail]',
    backendVar: '{{eventbrite_email}}',
    category: 'vendor',
    description: "Vendor's Eventbrite email for payment matching",
    example: 'john@example.com',
    worksInInvitations: true,
  },
  {
    label: 'Venmo Handle',
    frontendVar: '[venmoHandle]',
    backendVar: '{{venmo_handle}}',
    category: 'vendor',
    description: "Vendor's Venmo handle for payment",
    example: '@john-doe',
    worksInInvitations: true,
  },
  {
    label: 'PayPal Email',
    frontendVar: '[paypalEmail]',
    backendVar: '{{paypal_email}}',
    category: 'vendor',
    description: "Vendor's PayPal email for payment",
    example: 'john@paypal.com',
    worksInInvitations: true,
  },
]

/**
 * @deprecated Use RichTextEditor component instead
 * Convert HTML to plain text
 * Strips HTML tags and converts to readable plain text
 * Kept for backwards compatibility with legacy code
 */
export function htmlToPlainText(html: string): string {
  if (!html) return ''

  let text = html

  // Convert common HTML elements to plain text equivalents
  text = text.replace(/<br\s*\/?>/gi, '\n') // <br> → newline
  text = text.replace(/<\/p>\s*<p>/gi, '\n\n') // </p><p> → double newline
  text = text.replace(/<p[^>]*>/gi, '') // Remove opening <p>
  text = text.replace(/<\/p>/gi, '\n') // </p> → newline
  text = text.replace(/<div[^>]*>/gi, '') // Remove opening <div>
  text = text.replace(/<\/div>/gi, '\n') // </div> → newline
  text = text.replace(/<h[1-6][^>]*>/gi, '') // Remove headings
  text = text.replace(/<\/h[1-6]>/gi, '\n\n') // Heading end → double newline
  text = text.replace(/<li[^>]*>/gi, '• ') // <li> → bullet
  text = text.replace(/<\/li>/gi, '\n') // </li> → newline
  text = text.replace(/<[^>]+>/g, '') // Remove all other tags

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")

  // Clean up multiple newlines (more than 2) and trim
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.trim()

  return text
}

/**
 * @deprecated Use RichTextEditor component instead
 * Convert plain text to HTML
 * Wraps paragraphs and converts newlines to HTML
 * Kept for backwards compatibility with legacy code
 */
export function plainTextToHtml(text: string): string {
  if (!text) return ''

  // Escape HTML special characters
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Split by double newlines to identify paragraphs
  const paragraphs = html.split(/\n\n+/)

  // Wrap each paragraph in <p> tags and convert single newlines to <br>
  const htmlParagraphs = paragraphs.map((para) => {
    const withBreaks = para.replace(/\n/g, '<br>')
    return `<p>${withBreaks}</p>`
  })

  return htmlParagraphs.join('\n')
}

/**
 * Convert backend format to frontend format
 * 1. Preserve HTML formatting (NO LONGER strips HTML)
 * 2. Convert {{mustache}} → [bracket] for backwards compatibility
 *    (old emails may still have {{mustache}} format in database)
 */
export function backendToFrontend(text: string): string {
  if (!text) return text

  let result = text

  // Convert old {{mustache}} format to [bracket] format
  // This handles emails that were saved with the old format
  EMAIL_VARIABLES.forEach((variable) => {
    // Escape special regex characters in backend var
    const escapedBackend = variable.backendVar.replace(/[{}]/g, '\\$&')
    const regex = new RegExp(escapedBackend, 'g')
    result = result.replace(regex, variable.frontendVar)
  })

  return result
}

/**
 * Convert frontend format to backend format
 * 1. Keep variables in [bracket] format - backend expects this
 * 2. Preserve HTML from rich text editor (NO LONGER converts plain text to HTML)
 */
export function frontendToBackend(text: string): string {
  if (!text) return text

  // Variables stay in [bracket] format - backend expects [eventName], not {{event_title}}
  // Backend EmailVariableResolver only knows how to resolve [bracket] format
  // HTML is already formatted by TipTap rich text editor - return as-is
  return text
}

/**
 * Get variables grouped by category
 */
export function getVariablesByCategory() {
  return {
    event: EMAIL_VARIABLES.filter((v) => v.category === 'event'),
    organization: EMAIL_VARIABLES.filter((v) => v.category === 'organization'),
    vendor: EMAIL_VARIABLES.filter((v) => v.category === 'vendor'),
    computed: EMAIL_VARIABLES.filter((v) => v.category === 'computed'),
  }
}

/**
 * Get variables grouped and alphabetized for UI display
 * Three groups: Vendor Details, Organization Details, Event Details
 */
export interface VariableGroup {
  label: string
  variables: EmailVariable[]
}

export function getGroupedVariablesForUI(): VariableGroup[] {
  // Helper to sort alphabetically by label
  const sortByLabel = (a: EmailVariable, b: EmailVariable) => a.label.localeCompare(b.label)

  return [
    {
      label: 'Vendor Details',
      variables: EMAIL_VARIABLES.filter((v) => v.category === 'vendor').sort(sortByLabel),
    },
    {
      label: 'Organization Details',
      variables: EMAIL_VARIABLES.filter((v) => v.category === 'organization').sort(sortByLabel),
    },
    {
      label: 'Event Details',
      variables: EMAIL_VARIABLES.filter((v) => v.category === 'event').sort(sortByLabel),
    },
    {
      label: 'Links',
      variables: EMAIL_VARIABLES.filter(
        (v) => v.category === 'links' || v.category === 'computed',
      ).sort(sortByLabel),
    },
  ]
}

/**
 * Insert variable at cursor position in textarea or input
 */
export function insertVariableAtCursor(
  textareaElement: HTMLTextAreaElement | HTMLInputElement,
  variableToInsert: string,
): string {
  // Handle null selectionStart/selectionEnd (can happen with some input types)
  const start = textareaElement.selectionStart ?? 0
  const end = textareaElement.selectionEnd ?? textareaElement.value.length
  const text = textareaElement.value

  // Insert variable at cursor position
  const newText = text.substring(0, start) + variableToInsert + text.substring(end)

  // Set cursor position after inserted variable
  const newCursorPos = start + variableToInsert.length

  // Update textarea (caller should do this)
  setTimeout(() => {
    textareaElement.focus()
    textareaElement.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)

  return newText
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  unknownVariables: string[]
  unclosedBrackets: string[]
}

/**
 * Validate email content (subject and body)
 * Checks for:
 * - Unknown variables
 * - Unclosed brackets
 */
export function validateEmailContent(subject: string, body: string): ValidationResult {
  const errors: string[] = []
  const unknownVariables: string[] = []
  const unclosedBrackets: string[] = []

  const texts = [
    { text: subject, label: 'subject' },
    { text: body, label: 'body' },
  ]

  const frontendVars = EMAIL_VARIABLES.map((v) => v.frontendVar)

  for (const { text, label } of texts) {
    if (!text) continue

    // Find all complete variables [variable]
    const completeVars = text.match(/\[[\w]+\]/g) || []

    // Check for unknown variables
    const unknownInText = completeVars.filter((match) => !frontendVars.includes(match))
    unknownVariables.push(...unknownInText)

    // Check for unclosed brackets
    // Pattern: [ followed by word characters but NOT followed by ]
    const unclosedPattern = /\[[\w]+(?!\])/g
    const unclosed = text.match(unclosedPattern) || []

    // Additional check: find opening [ without matching ]
    let openBrackets = 0
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') {
        openBrackets++
        // Look ahead to see if this bracket is closed
        const remainingText = text.substring(i)
        const nextClose = remainingText.indexOf(']')
        if (nextClose === -1) {
          // No closing bracket found after this opening
          const unclosedVar = remainingText.match(/\[[\w]*/)?.[0] || '['
          if (!unclosedBrackets.includes(unclosedVar)) {
            unclosedBrackets.push(unclosedVar)
          }
        }
      }
    }
  }

  // Generate error messages
  if (unknownVariables.length > 0) {
    const uniqueUnknown = [...new Set(unknownVariables)]
    errors.push(
      `Unknown variable${uniqueUnknown.length > 1 ? 's' : ''}: ${uniqueUnknown.join(', ')}`,
    )
  }

  if (unclosedBrackets.length > 0) {
    const uniqueUnclosed = [...new Set(unclosedBrackets)]
    errors.push(
      `Unclosed bracket${uniqueUnclosed.length > 1 ? 's' : ''}: ${uniqueUnclosed.join(', ')}`,
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    unknownVariables: [...new Set(unknownVariables)],
    unclosedBrackets: [...new Set(unclosedBrackets)],
  }
}

/**
 * Legacy function - kept for backwards compatibility
 * Returns array of unrecognized variables
 */
export function validateVariables(text: string): string[] {
  if (!text) return []

  const frontendVars = EMAIL_VARIABLES.map((v) => v.frontendVar)
  const backendVars = EMAIL_VARIABLES.map((v) => v.backendVar)
  const allValidVars = [...frontendVars, ...backendVars]

  // Find all variables in text (both formats)
  const frontendMatches = text.match(/\[[\w]+\]/g) || []
  const backendMatches = text.match(/\{\{[\w_]+\}\}/g) || []
  const allMatches = [...frontendMatches, ...backendMatches]

  // Find unrecognized variables
  const unrecognized = allMatches.filter((match) => !allValidVars.includes(match))

  // Return unique unrecognized variables
  return [...new Set(unrecognized)]
}
