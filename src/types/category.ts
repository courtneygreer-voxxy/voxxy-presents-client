export interface Category {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  email_campaign_template_id?: number;
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
