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
  label: string;

  // Variable format: [eventName]
  // Both frontend and backend use this same format
  frontendVar: string;

  // Deprecated: kept for backwards compatibility
  // Backend actually uses same [bracket] format as frontendVar
  backendVar: string;

  // Category for grouping
  category: 'event' | 'organization' | 'vendor' | 'computed';

  // Help text
  description: string;

  // Example value
  example: string;
}

export const EMAIL_VARIABLES: EmailVariable[] = [
  // Event Variables
  {
    label: 'Event Name',
    frontendVar: '[eventName]',
    backendVar: '{{event_title}}',
    category: 'event',
    description: 'Name of the event',
    example: 'Summer Market 2025'
  },
  {
    label: 'Event Date',
    frontendVar: '[eventDate]',
    backendVar: '{{event_date}}',
    category: 'event',
    description: 'Date of the event',
    example: 'June 15, 2025'
  },
  {
    label: 'Event Time',
    frontendVar: '[eventTime]',
    backendVar: '{{event_time}}',
    category: 'event',
    description: 'Time of the event',
    example: '10:00 AM - 6:00 PM'
  },
  {
    label: 'Event Location',
    frontendVar: '[eventLocation]',
    backendVar: '{{event_location}}',
    category: 'event',
    description: 'Venue and address',
    example: 'Piedmont Park, Atlanta, GA'
  },
  {
    label: 'Event Venue',
    frontendVar: '[eventVenue]',
    backendVar: '{{event_venue}}',
    category: 'event',
    description: 'Venue name only',
    example: 'Piedmont Park'
  },
  {
    label: 'Event Description',
    frontendVar: '[eventDescription]',
    backendVar: '{{event_description}}',
    category: 'event',
    description: 'Event description text',
    example: 'A family-friendly outdoor market...'
  },
  {
    label: 'Application Deadline',
    frontendVar: '[applicationDeadline]',
    backendVar: '{{application_deadline}}',
    category: 'event',
    description: 'Last day to apply',
    example: 'May 30, 2025'
  },
  {
    label: 'Booth Price',
    frontendVar: '[boothPrice]',
    backendVar: '{{booth_price}}',
    category: 'event',
    description: 'Cost per booth',
    example: '$150.00'
  },
  {
    label: 'Category Price',
    frontendVar: '[categoryPrice]',
    backendVar: '{{category_price}}',
    category: 'event',
    description: 'Cost per booth (alias for boothPrice)',
    example: '$150.00'
  },
  {
    label: 'Payment Due Date',
    frontendVar: '[paymentDueDate]',
    backendVar: '{{payment_due_date}}',
    category: 'event',
    description: 'Payment deadline',
    example: 'June 1, 2025'
  },

  // Organization Variables
  {
    label: 'Organization Name',
    frontendVar: '[organizationName]',
    backendVar: '{{organization_name}}',
    category: 'organization',
    description: 'Your organization name',
    example: 'Voxxy Presents'
  },
  {
    label: 'Organization Email',
    frontendVar: '[organizationEmail]',
    backendVar: '{{organization_email}}',
    category: 'organization',
    description: 'Your contact email',
    example: 'hello@voxxypresents.com'
  },

  // Vendor Variables
  {
    label: 'First Name',
    frontendVar: '[firstName]',
    backendVar: '{{first_name}}',
    category: 'vendor',
    description: "Vendor's first name",
    example: 'John'
  },
  {
    label: 'Last Name',
    frontendVar: '[lastName]',
    backendVar: '{{last_name}}',
    category: 'vendor',
    description: "Vendor's last name",
    example: 'Doe'
  },
  {
    label: 'Full Name',
    frontendVar: '[fullName]',
    backendVar: '{{full_name}}',
    category: 'vendor',
    description: "Vendor's full name",
    example: 'John Doe'
  },
  {
    label: 'Business Name',
    frontendVar: '[businessName]',
    backendVar: '{{business_name}}',
    category: 'vendor',
    description: "Vendor's business name",
    example: "John's Tacos"
  },
  {
    label: 'Email',
    frontendVar: '[email]',
    backendVar: '{{email}}',
    category: 'vendor',
    description: "Vendor's email address",
    example: 'john@example.com'
  },
  {
    label: 'Vendor Category',
    frontendVar: '[vendorCategory]',
    backendVar: '{{vendor_category}}',
    category: 'vendor',
    description: 'Type of vendor',
    example: 'Food'
  },
  {
    label: 'Booth Number',
    frontendVar: '[boothNumber]',
    backendVar: '{{booth_number}}',
    category: 'vendor',
    description: 'Assigned booth location',
    example: 'A-12'
  },
  {
    label: 'Application Date',
    frontendVar: '[applicationDate]',
    backendVar: '{{application_date}}',
    category: 'vendor',
    description: 'Date vendor applied',
    example: 'May 15, 2025'
  },
  {
    label: 'Install Date',
    frontendVar: '[installDate]',
    backendVar: '{{install_date}}',
    category: 'vendor',
    description: 'Vendor setup/install date',
    example: 'June 14, 2025'
  },
  {
    label: 'Install Time',
    frontendVar: '[installTime]',
    backendVar: '{{install_time}}',
    category: 'vendor',
    description: 'Vendor setup time range',
    example: '8:00 AM - 10:00 AM'
  },
  {
    label: 'Install Start Time',
    frontendVar: '[installStartTime]',
    backendVar: '{{install_start_time}}',
    category: 'vendor',
    description: 'Setup start time',
    example: '8:00 AM'
  },
  {
    label: 'Install End Time',
    frontendVar: '[installEndTime]',
    backendVar: '{{install_end_time}}',
    category: 'vendor',
    description: 'Setup end time',
    example: '10:00 AM'
  },

  // Computed/Link Variables
  {
    label: 'Payment Link',
    frontendVar: '[paymentLink]',
    backendVar: '{{payment_link}}',
    category: 'computed',
    description: 'Payment URL for vendor',
    example: 'https://pay.voxxypresents.com/...'
  },
  {
    label: 'Event Link',
    frontendVar: '[eventLink]',
    backendVar: '{{event_link}}',
    category: 'computed',
    description: 'Public event page URL',
    example: 'https://voxxy.io/events/summer-market'
  },
  {
    label: 'Bulletin Link',
    frontendVar: '[bulletinLink]',
    backendVar: '{{bulletin_link}}',
    category: 'computed',
    description: 'Event bulletin page URL',
    example: 'https://voxxy.io/events/summer-market'
  },
  {
    label: 'Dashboard Link',
    frontendVar: '[dashboardLink]',
    backendVar: '{{dashboard_link}}',
    category: 'computed',
    description: 'Vendor dashboard URL',
    example: 'https://voxxy.io/vendor/dashboard'
  },
  {
    label: 'Unsubscribe Link',
    frontendVar: '[unsubscribeLink]',
    backendVar: '{{unsubscribe_link}}',
    category: 'computed',
    description: 'Unsubscribe URL',
    example: 'Click here to unsubscribe'
  },
];

/**
 * Convert HTML to plain text
 * Strips HTML tags and converts to readable plain text
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  let text = html;

  // Convert common HTML elements to plain text equivalents
  text = text.replace(/<br\s*\/?>/gi, '\n');           // <br> → newline
  text = text.replace(/<\/p>\s*<p>/gi, '\n\n');        // </p><p> → double newline
  text = text.replace(/<p[^>]*>/gi, '');                // Remove opening <p>
  text = text.replace(/<\/p>/gi, '\n');                 // </p> → newline
  text = text.replace(/<div[^>]*>/gi, '');              // Remove opening <div>
  text = text.replace(/<\/div>/gi, '\n');               // </div> → newline
  text = text.replace(/<h[1-6][^>]*>/gi, '');           // Remove headings
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');          // Heading end → double newline
  text = text.replace(/<li[^>]*>/gi, '• ');             // <li> → bullet
  text = text.replace(/<\/li>/gi, '\n');                // </li> → newline
  text = text.replace(/<[^>]+>/g, '');                  // Remove all other tags

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up multiple newlines (more than 2) and trim
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * Convert plain text to HTML
 * Wraps paragraphs and converts newlines to HTML
 */
export function plainTextToHtml(text: string): string {
  if (!text) return '';

  // Escape HTML special characters
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Split by double newlines to identify paragraphs
  const paragraphs = html.split(/\n\n+/);

  // Wrap each paragraph in <p> tags and convert single newlines to <br>
  const htmlParagraphs = paragraphs.map(para => {
    const withBreaks = para.replace(/\n/g, '<br>');
    return `<p>${withBreaks}</p>`;
  });

  return htmlParagraphs.join('\n');
}

/**
 * Convert backend format to frontend format
 * 1. Convert HTML to plain text
 * 2. Convert {{mustache}} → [bracket] for backwards compatibility
 *    (old emails may still have {{mustache}} format in database)
 */
export function backendToFrontend(text: string): string {
  if (!text) return text;

  // Step 1: Convert HTML to plain text
  let result = htmlToPlainText(text);

  // Step 2: Convert old {{mustache}} format to [bracket] format
  // This handles emails that were saved with the old format
  EMAIL_VARIABLES.forEach(variable => {
    // Escape special regex characters in backend var
    const escapedBackend = variable.backendVar.replace(/[{}]/g, '\\$&');
    const regex = new RegExp(escapedBackend, 'g');
    result = result.replace(regex, variable.frontendVar);
  });

  return result;
}

/**
 * Convert frontend format to backend format
 * 1. Keep variables in [bracket] format - backend expects this
 * 2. Convert plain text to HTML
 */
export function frontendToBackend(text: string): string {
  if (!text) return text;

  let result = text;

  // Step 1: Variables stay in [bracket] format - backend expects [eventName], not {{event_title}}
  // Backend EmailVariableResolver only knows how to resolve [bracket] format

  // Step 2: Convert plain text to HTML
  result = plainTextToHtml(result);

  return result;
}

/**
 * Get variables grouped by category
 */
export function getVariablesByCategory() {
  return {
    event: EMAIL_VARIABLES.filter(v => v.category === 'event'),
    organization: EMAIL_VARIABLES.filter(v => v.category === 'organization'),
    vendor: EMAIL_VARIABLES.filter(v => v.category === 'vendor'),
    computed: EMAIL_VARIABLES.filter(v => v.category === 'computed'),
  };
}

/**
 * Insert variable at cursor position in textarea
 */
export function insertVariableAtCursor(
  textareaElement: HTMLTextAreaElement,
  variableToInsert: string
): string {
  const start = textareaElement.selectionStart;
  const end = textareaElement.selectionEnd;
  const text = textareaElement.value;

  // Insert variable at cursor position
  const newText = text.substring(0, start) + variableToInsert + text.substring(end);

  // Set cursor position after inserted variable
  const newCursorPos = start + variableToInsert.length;

  // Update textarea (caller should do this)
  setTimeout(() => {
    textareaElement.focus();
    textareaElement.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);

  return newText;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  unknownVariables: string[];
  unclosedBrackets: string[];
}

/**
 * Validate email content (subject and body)
 * Checks for:
 * - Unknown variables
 * - Unclosed brackets
 */
export function validateEmailContent(subject: string, body: string): ValidationResult {
  const errors: string[] = [];
  const unknownVariables: string[] = [];
  const unclosedBrackets: string[] = [];

  const texts = [
    { text: subject, label: 'subject' },
    { text: body, label: 'body' }
  ];

  const frontendVars = EMAIL_VARIABLES.map(v => v.frontendVar);

  for (const { text, label } of texts) {
    if (!text) continue;

    // Find all complete variables [variable]
    const completeVars = text.match(/\[[\w]+\]/g) || [];

    // Check for unknown variables
    const unknownInText = completeVars.filter(match => !frontendVars.includes(match));
    unknownVariables.push(...unknownInText);

    // Check for unclosed brackets
    // Pattern: [ followed by word characters but NOT followed by ]
    const unclosedPattern = /\[[\w]+(?!\])/g;
    const unclosed = text.match(unclosedPattern) || [];

    // Additional check: find opening [ without matching ]
    let openBrackets = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') {
        openBrackets++;
        // Look ahead to see if this bracket is closed
        const remainingText = text.substring(i);
        const nextClose = remainingText.indexOf(']');
        if (nextClose === -1) {
          // No closing bracket found after this opening
          const unclosedVar = remainingText.match(/\[[\w]*/)?.[0] || '[';
          if (!unclosedBrackets.includes(unclosedVar)) {
            unclosedBrackets.push(unclosedVar);
          }
        }
      }
    }
  }

  // Generate error messages
  if (unknownVariables.length > 0) {
    const uniqueUnknown = [...new Set(unknownVariables)];
    errors.push(`Unknown variable${uniqueUnknown.length > 1 ? 's' : ''}: ${uniqueUnknown.join(', ')}`);
  }

  if (unclosedBrackets.length > 0) {
    const uniqueUnclosed = [...new Set(unclosedBrackets)];
    errors.push(`Unclosed bracket${uniqueUnclosed.length > 1 ? 's' : ''}: ${uniqueUnclosed.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    unknownVariables: [...new Set(unknownVariables)],
    unclosedBrackets: [...new Set(unclosedBrackets)]
  };
}

/**
 * Legacy function - kept for backwards compatibility
 * Returns array of unrecognized variables
 */
export function validateVariables(text: string): string[] {
  if (!text) return [];

  const frontendVars = EMAIL_VARIABLES.map(v => v.frontendVar);
  const backendVars = EMAIL_VARIABLES.map(v => v.backendVar);
  const allValidVars = [...frontendVars, ...backendVars];

  // Find all variables in text (both formats)
  const frontendMatches = text.match(/\[[\w]+\]/g) || [];
  const backendMatches = text.match(/\{\{[\w_]+\}\}/g) || [];
  const allMatches = [...frontendMatches, ...backendMatches];

  // Find unrecognized variables
  const unrecognized = allMatches.filter(match => !allValidVars.includes(match));

  // Return unique unrecognized variables
  return [...new Set(unrecognized)];
}
