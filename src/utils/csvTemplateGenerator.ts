export function generateCSVTemplate(): string {
  const headers = [
    'name',
    'email',
    'phone',
    'affiliation',
    'instagram_handle',
    'tiktok_handle',
    'website',
    'location',
    'tags',
    'notes',
    'eventbrite_email',
    'venmo_handle',
    'paypal_email',
  ]

  const exampleRows = [
    {
      name: 'Sarah Mitchell',
      email: 'sarah@ceramics.com',
      phone: '555-1234',
      affiliation: "Sarah's Ceramics",
      instagram_handle: '@sarahceramics',
      tiktok_handle: '@sarahceramics',
      website: 'https://sarahceramics.com',
      location: 'San Francisco, CA',
      tags: 'art,local',
      notes: 'Met at Spring Market 2024',
      eventbrite_email: 'sarah@ceramics.com',
      venmo_handle: '@sarahceramics',
      paypal_email: '',
    },
    {
      name: 'John Davidson',
      email: 'john@foodtruck.com',
      phone: '555-5678',
      affiliation: "John's Tacos",
      instagram_handle: '@johnstacos',
      tiktok_handle: '',
      website: 'https://johnstacos.com',
      location: 'Oakland, CA',
      tags: 'food,catering',
      notes: 'Interested in summer events',
      eventbrite_email: '',
      venmo_handle: '',
      paypal_email: 'john@paypal.com',
    },
  ]

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...exampleRows.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row] || ''
          // Escape values with commas or quotes
          if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(','),
    ),
  ].join('\n')

  return csvContent
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadCSVTemplate(): void {
  const csv = generateCSVTemplate()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerBrowserDownload(blob, 'vendor_contacts_template.csv')
}

export function downloadErrorReport(
  errors: Array<{ row: number; field: string; message: string }>,
  fileName: string = 'import_errors.csv',
): void {
  const headers = ['Row Number', 'Field', 'Error Message']
  const csvContent = [
    headers.join(','),
    ...errors.map((err) => `${err.row},"${err.field}","${err.message.replace(/"/g, '""')}"`),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  triggerBrowserDownload(blob, fileName)
}
