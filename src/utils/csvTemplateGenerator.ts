export function generateCSVTemplate(): string {
  const headers = [
    'name',
    'email',
    'phone',
    'business_name',
    'instagram_handle',
    'tiktok_handle',
    'website',
    'location',
    'job_title',
    'contact_type',
    'tags',
    'notes'
  ];

  const exampleRows = [
    {
      name: 'Sarah Mitchell',
      email: 'sarah@ceramics.com',
      phone: '555-1234',
      business_name: "Sarah's Ceramics",
      instagram_handle: '@sarahceramics',
      tiktok_handle: '@sarahceramics',
      website: 'https://sarahceramics.com',
      location: 'San Francisco, CA',
      job_title: 'Owner',
      contact_type: 'vendor',
      tags: 'art,local',
      notes: 'Met at Spring Market 2024'
    },
    {
      name: 'John Davidson',
      email: 'john@foodtruck.com',
      phone: '555-5678',
      business_name: "John's Tacos",
      instagram_handle: '@johnstacos',
      tiktok_handle: '',
      website: 'https://johnstacos.com',
      location: 'Oakland, CA',
      job_title: 'Manager',
      contact_type: 'vendor',
      tags: 'food,catering',
      notes: 'Interested in summer events'
    }
  ];

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...exampleRows.map(row =>
      headers.map(header => {
        const value = row[header as keyof typeof row] || '';
        // Escape values with commas or quotes
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

export function downloadCSVTemplate(): void {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'vendor_contacts_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadErrorReport(
  errors: Array<{ row: number; field: string; message: string }>,
  fileName: string = 'import_errors.csv'
): void {
  const headers = ['Row Number', 'Field', 'Error Message'];
  const csvContent = [
    headers.join(','),
    ...errors.map(err =>
      `${err.row},"${err.field}","${err.message.replace(/"/g, '""')}"`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
