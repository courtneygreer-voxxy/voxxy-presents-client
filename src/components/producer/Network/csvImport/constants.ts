/**
 * Recognized contact fields for CSV import.
 * Mirrors backend VendorContactFieldRules — keep in sync.
 */

export interface FieldDefinition {
  key: string
  label: string
  required: boolean
}

export const RECOGNIZED_FIELDS: FieldDefinition[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'affiliation', label: 'Affiliation', required: false },
  { key: 'instagram_handle', label: 'Instagram', required: false },
  { key: 'tiktok_handle', label: 'TikTok', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'location', label: 'Location', required: false },
  { key: 'tags', label: 'Tags', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

/** All recognized field keys */
export const RECOGNIZED_FIELD_KEYS = RECOGNIZED_FIELDS.map((f) => f.key)

/** Display labels keyed by field key */
export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  RECOGNIZED_FIELDS.map((f) => [f.key, f.label]),
)

/**
 * Alias map: normalized CSV header → recognized field key.
 * Covers common variations, legacy field names, and abbreviations.
 */
export const HEADER_ALIASES: Record<string, string> = {
  // Name
  full_name: 'name',
  contact_name: 'name',
  vendor_name: 'name',
  vendor: 'name',
  contact: 'name',

  // Email
  e_mail: 'email',
  email_address: 'email',
  e_mail_address: 'email',

  // Phone
  phone_number: 'phone',
  cell: 'phone',
  cell_phone: 'phone',
  mobile: 'phone',
  mobile_phone: 'phone',
  telephone: 'phone',
  tel: 'phone',

  // Affiliation (and legacy business_name)
  business_name: 'affiliation',
  business: 'affiliation',
  company: 'affiliation',
  company_name: 'affiliation',
  organization: 'affiliation',
  org: 'affiliation',
  studio: 'affiliation',
  brand: 'affiliation',
  brand_name: 'affiliation',
  shop: 'affiliation',
  shop_name: 'affiliation',

  // Instagram
  instagram: 'instagram_handle',
  ig: 'instagram_handle',
  ig_handle: 'instagram_handle',
  insta: 'instagram_handle',

  // TikTok
  tiktok: 'tiktok_handle',
  tik_tok: 'tiktok_handle',
  tt: 'tiktok_handle',

  // Website
  url: 'website',
  site: 'website',
  portfolio: 'website',
  portfolio_url: 'website',
  web: 'website',
  link: 'website',

  // Location
  city: 'location',
  address: 'location',
  city_state: 'location',

  // Tags
  tag: 'tags',
  categories: 'tags',
  category: 'tags',
  label: 'tags',
  labels: 'tags',
  type: 'tags',

  // Notes
  note: 'notes',
  comments: 'notes',
  comment: 'notes',
  description: 'notes',
}

/**
 * Fields that should be merged if both appear in the CSV
 * (e.g., first_name + last_name → name)
 */
export const MERGE_FIELDS: Record<string, { target: string; parts: string[] }> = {
  first_name: { target: 'name', parts: ['first_name', 'last_name'] },
  last_name: { target: 'name', parts: ['first_name', 'last_name'] },
  firstname: { target: 'name', parts: ['firstname', 'lastname'] },
  lastname: { target: 'name', parts: ['firstname', 'lastname'] },
}
