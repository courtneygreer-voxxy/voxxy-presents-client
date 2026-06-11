export interface CategoryFeePreference {
  type: 'booth_price' | 'early_bird_price' | 'jury_fee' | 'percentage_of_sales' | 'price_per_piece'
  label: string
  amount: number
  is_percentage: boolean
}

export interface Category {
  id: number
  organization_id: number
  name: string
  description?: string
  color?: string
  icon?: string
  booth_price?: number
  email_campaign_template_id?: number

  // Payment extension fields (legacy flat fields — kept for backwards compatibility)
  early_bird_price?: number
  early_bird_deadline?: string
  payment_deadline?: string
  deposit?: number

  // Structured fee preference presets (used to pre-populate the event wizard)
  payment_preferences?: CategoryFeePreference[]

  // Default application values for pre-filling
  default_booth_price?: number
  default_description?: string
  default_install_start_time?: string
  default_install_end_time?: string
  default_payment_link?: string
  default_application_tags?: string[]

  // Track where defaults came from
  last_used_event_id?: number
  last_used_event_name?: string
  last_used_at?: string

  created_at: string
  updated_at: string
  in_use?: boolean
  usage?: {
    applications_count: number
    contacts_count: number
    email_templates_count: number
    events_using_count: number
  }
  usage_stats?: {
    applications_count: number
    contacts_count: number
    email_templates_count: number
    scheduled_emails_count: number
    events_using_count: number
  }
}

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
  icon?: string
  booth_price?: number
  early_bird_price?: number
  early_bird_deadline?: string
  payment_deadline?: string
  deposit?: number
  payment_preferences?: CategoryFeePreference[]
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
  icon?: string
  booth_price?: number
  early_bird_price?: number
  early_bird_deadline?: string
  payment_deadline?: string
  deposit?: number
  payment_preferences?: CategoryFeePreference[]
}
