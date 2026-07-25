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
  // Most spreadsheets keep first and last name in separate columns, so we keep
  // them separate through mapping + preview and only join them into a single
  // `name` at submission time. First name is required; last name is optional.
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: false },
  // Email is required — it's the unique identifier used to match/de-dupe
  // existing contacts and the only way to actually reach an imported contact.
  { key: 'email', label: 'Email', required: true },
  // Fallback for files that keep the whole name in one column. Either this OR
  // First Name satisfies the name requirement.
  { key: 'name', label: 'Full Name', required: false },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'affiliation', label: 'Affiliation', required: false },
  { key: 'instagram_handle', label: 'Instagram', required: false },
  { key: 'tiktok_handle', label: 'TikTok', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'location', label: 'Location', required: false },
  { key: 'tags', label: 'Tags', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

/** Name-part fields that are joined into the canonical `name` at submission. */
export const NAME_PART_KEYS = ['first_name', 'last_name'] as const

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
  // First name
  firstname: 'first_name',
  fname: 'first_name',
  first: 'first_name',
  given_name: 'first_name',
  givenname: 'first_name',

  // Last name
  lastname: 'last_name',
  lname: 'last_name',
  last: 'last_name',
  surname: 'last_name',
  family_name: 'last_name',
  familyname: 'last_name',

  // Full name (single-column fallback)
  full_name: 'name',
  fullname: 'name',
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
