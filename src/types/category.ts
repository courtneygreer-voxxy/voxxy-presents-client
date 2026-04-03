export interface Category {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  email_campaign_template_id?: number;

  // Default application values for pre-filling
  default_booth_price?: number;
  default_description?: string;
  default_install_start_time?: string;
  default_install_end_time?: string;
  default_payment_link?: string;
  default_application_tags?: string[];

  // Track where defaults came from
  last_used_event_id?: number;
  last_used_event_name?: string;
  last_used_at?: string;

  created_at: string;
  updated_at: string;
  in_use?: boolean;
  usage?: {
    applications_count: number;
    contacts_count: number;
    email_templates_count: number;
    events_using_count: number;
  };
  usage_stats?: {
    applications_count: number;
    email_templates_count: number;
    scheduled_emails_count: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}
