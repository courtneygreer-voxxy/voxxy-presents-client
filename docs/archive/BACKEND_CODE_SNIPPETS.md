# Backend Code Snippets - Name Field Handling

## Database Schema

### VendorContact (20251217120000_create_vendor_contacts.rb)
```ruby
create_table :vendor_contacts do |t|
  t.references :organization, null: false, foreign_key: true
  t.references :vendor, null: true, foreign_key: true
  t.references :registration, null: true, foreign_key: true

  # Key name fields
  t.string :name, null: false              # <- PRIMARY name field
  t.string :business_name                  # <- Business/company name
  t.string :job_title
  t.string :email
  t.string :phone
  # ... other fields
  
  t.timestamps
end
```

### Registration (20251104140632_create_registrations.rb + 20251115162751_add_vendor_fields_to_registrations.rb)
```ruby
# Initial table
create_table :registrations do |t|
  t.references :event, null: false, foreign_key: true
  t.references :user, foreign_key: true
  t.string :email, null: false
  t.string :name                          # <- Full name field
  t.string :phone
  # ... other fields
  t.timestamps
end

# Later migration adds vendor fields
add_column :registrations, :business_name, :string     # <- Added later
add_column :registrations, :vendor_category, :string
```

---

## Email Variable Resolver (Registration)

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/email_variable_resolver.rb` (lines 126-177)

```ruby
def resolve_registration_variables(template)
  # Parse full name into first/last
  name_parts = (registration.name || "").split(" ", 2)
  first_name = name_parts[0] || ""
  last_name = name_parts[1] || ""

  # Get booth number if the field exists
  booth_number = registration.respond_to?(:booth_number) ? (registration.booth_number&.to_s || "TBD") : "TBD"

  # Greeting name: businessName preferred, fallback to firstName
  greeting_name = if registration.business_name.present?
    registration.business_name
  elsif first_name.present?
    first_name
  else
    "there"  # Ultimate fallback if both are missing
  end

  # Get vendor application variables if available
  vendor_app = registration.vendor_application
  booth_price = vendor_app ? format_currency(vendor_app.booth_price) : ""
  install_date = vendor_app ? format_date(vendor_app.install_date) : ""
  install_time = vendor_app ? format_install_time(vendor_app.install_start_time, vendor_app.install_end_time) : ""

  # Category list shows ALL application names for the event
  vendor_apps = event.vendor_applications.active
  category_list = vendor_apps.any? ? format_application_names(vendor_apps) : ""

  # Category payment link (using payment_link field from vendor_application)
  category_payment_link = vendor_app&.payment_link || ""

  # Category application link (using shareable_code for public application URL)
  category_application_link = vendor_app ? "#{base_url}/apply/#{vendor_app.shareable_code}" : ""

  template
    .gsub("[greetingName]", greeting_name)
    .gsub("[firstName]", first_name)
    .gsub("[lastName]", last_name)
    .gsub("[fullName]", registration.name || "")
    .gsub("[businessName]", registration.business_name || "")
    .gsub("[email]", registration.email || "")
    .gsub("[vendorCategory]", registration.vendor_category || "")
    .gsub("[boothNumber]", booth_number)
    .gsub("[applicationDate]", format_date(registration.created_at))
    .gsub("[boothPrice]", booth_price)
    .gsub("[installDate]", install_date)
    .gsub("[installTime]", install_time)
    .gsub("[categoryList]", category_list)
    .gsub("[categoryPaymentLink]", category_payment_link)
    .gsub("[categoryApplicationLink]", category_application_link)
    .gsub("[applicationLink]", category_application_link)
end
```

---

## Invitation Variable Resolver (VendorContact)

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/services/invitation_variable_resolver.rb` (lines 87-113)

```ruby
def resolve_vendor_contact_variables(template)
  # Parse full name into first/last
  name_parts = (vendor_contact.name || "").split(" ", 2)
  first_name = name_parts[0] || ""
  last_name = name_parts[1] || ""

  # Greeting name: businessName preferred, fallback to firstName
  greeting_name = if vendor_contact.business_name.present?
    vendor_contact.business_name
  elsif first_name.present?
    first_name
  else
    "there"  # Ultimate fallback
  end

  template
    .gsub("[greetingName]", greeting_name)
    .gsub("[firstName]", first_name)
    .gsub("[lastName]", last_name)
    .gsub("[fullName]", vendor_contact.name || "")
    .gsub("[businessName]", vendor_contact.business_name || "")
    .gsub("[email]", vendor_contact.email || "")
    # Variables not applicable for contacts who haven't applied yet
    .gsub("[vendorCategory]", "")
    .gsub("[boothNumber]", "")
    .gsub("[applicationDate]", "")
end
```

---

## VendorContact Serializer

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/vendor_contact_serializer.rb` (lines 10-49)

```ruby
def as_json
  {
    id: @vendor_contact.id,
    organization_id: @vendor_contact.organization_id,
    vendor_id: @vendor_contact.vendor_id,
    registration_id: @vendor_contact.registration_id,
    
    # Flat structure for compatibility with frontend VendorContact interface
    contact_name: @vendor_contact.name,              # <- Maps name to contact_name
    email: @vendor_contact.email,
    phone: @vendor_contact.phone,
    business_name: @vendor_contact.try(:business_name) || @vendor_contact.try(:company_name),
    job_title: @vendor_contact.job_title,
    location: @vendor_contact.try(:location),
    contact_type: @vendor_contact.contact_type,
    status: @vendor_contact.status,
    notes: @vendor_contact.notes,
    tags: @vendor_contact.tags || [],
    categories: @vendor_contact.try(:categories) || [],
    featured: @vendor_contact.try(:featured) || false,
    interaction_count: @vendor_contact.interaction_count || 0,
    events_participated: @vendor_contact.try(:events_participated) || 0,
    last_contacted_at: @vendor_contact.last_contacted_at,
    instagram_handle: @vendor_contact.try(:instagram_handle),
    tiktok_handle: @vendor_contact.try(:tiktok_handle),
    website: @vendor_contact.try(:website),
    source: @vendor_contact.source,
    source_registration_id: @vendor_contact.try(:source_registration_id),
    imported_at: @vendor_contact.imported_at,
    created_at: @vendor_contact.created_at,
    updated_at: @vendor_contact.updated_at,
    # Email unsubscribe status
    unsubscribe_status: unsubscribe_status_json
  }.tap do |json|
    if @include_relations
      json[:organization] = organization_json if @vendor_contact.organization.present?
      json[:vendor] = vendor_json if @vendor_contact.vendor.present?
      json[:registration] = registration_json if @vendor_contact.registration.present?
    end
  end
end
```

---

## Registration Serializer

**File:** `/Users/beaulazear/Desktop/voxxy-rails/app/serializers/api/v1/presents/registration_serializer.rb` (lines 11-37)

```ruby
def as_json
  {
    id: @registration.id,
    email: @registration.email,
    name: @registration.name,              # <- Full name directly
    phone: @registration.phone,
    ticket_code: @registration.ticket_code,
    status: @registration.status,
    payment_status: @registration.payment_status,
    payment_confirmed_at: @registration.payment_confirmed_at,
    checked_in: @registration.checked_in,
    checked_in_at: @registration.checked_in_at,
    subscribed: @registration.subscribed,
    business_name: @registration.business_name,
    vendor_category: @registration.vendor_category,
    vendor_application_id: @registration.vendor_application_id,
    instagram_handle: @registration.instagram_handle,
    tiktok_handle: @registration.tiktok_handle,
    website: @registration.website,
    note_to_host: @registration.note_to_host,
    created_at: @registration.created_at,
    updated_at: @registration.updated_at
  }.tap do |json|
    json[:event] = event_json if @include_event
    json[:user] = user_json if @include_user && @registration.user.present?
  end
end
```

---

## Frontend Email Variables

**File:** `/Users/beaulazear/Desktop/voxxy-presents-client/src/utils/emailVariables.ts` (snippet)

```typescript
export const EMAIL_VARIABLES: EmailVariable[] = [
  // ... event variables ...
  
  // Vendor Variables
  {
    label: 'Greeting Name',
    frontendVar: '[greetingName]',
    backendVar: '{{greeting_name}}',
    category: 'vendor',
    description: 'Smart greeting (business name or first name)',
    example: "John's Tacos (or John)",
    worksInInvitations: true
  },
  {
    label: 'First Name',
    frontendVar: '[firstName]',
    backendVar: '{{first_name}}',
    category: 'vendor',
    description: "Vendor's first name",
    example: 'John',
    worksInInvitations: true
  },
  {
    label: 'Last Name',
    frontendVar: '[lastName]',
    backendVar: '{{last_name}}',
    category: 'vendor',
    description: "Vendor's last name",
    example: 'Doe',
    worksInInvitations: true
  },
  {
    label: 'Full Name',
    frontendVar: '[fullName]',
    backendVar: '{{full_name}}',
    category: 'vendor',
    description: "Vendor's full name",
    example: 'John Doe',
    worksInInvitations: true
  },
  {
    label: 'Business Name',
    frontendVar: '[businessName]',
    backendVar: '{{business_name}}',
    category: 'vendor',
    description: "Vendor's business name",
    example: "John's Tacos",
    worksInInvitations: true
  },
  {
    label: 'Contact Name',
    frontendVar: '[contactName]',
    backendVar: '{{contact_name}}',
    category: 'vendor',
    description: "Vendor's contact person name",
    example: 'Jane Smith',
    worksInInvitations: true
  },
  // ... more variables ...
];
```

---

## Summary Table

| Aspect | Value |
|--------|-------|
| VendorContact name field | `name` (string, required) |
| VendorContact business field | `business_name` (string, optional) |
| Registration name field | `name` (string, optional) |
| Registration business field | `business_name` (string, optional) |
| First/Last name separation | Runtime parsing via `split(" ", 2)` |
| Greeting preference | business_name > first_name > "there" |
| Email variable format | `[bracket]` (not `{{mustache}}`) |
| Invitation email variables | All work (tested with worksInInvitations flag) |
| Registration email variables | All work (full registration data available) |

