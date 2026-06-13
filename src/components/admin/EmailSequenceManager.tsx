import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Mail, Eye, Users, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { toast } from 'sonner'

interface EmailTemplateItem {
  id: number
  name: string
  category: string | null
  position: number
  subject_template: string
  body_template: string
  trigger_type: string
  trigger_value: number | null
  trigger_time: string | null
  enabled_by_default: boolean
}

interface Organization {
  id: number
  name: string
}

interface EmailCampaignTemplate {
  id: number
  name: string
  description: string
  template_type: 'system' | 'user'
  is_default: boolean
  email_count?: number
  usage_count: number
  organizations_using: Organization[]
  email_template_items: EmailTemplateItem[]
  created_at: string
  updated_at: string
}

interface EmailPreviewData {
  email_item: {
    id: number
    name: string
    category: string | null
    position: number
    subject_template: string
    body_template: string
    subject: string
    body: string
    trigger_type: string
    trigger_value: number | null
    trigger_time: string | null
  }
  sample_data_used: boolean
}

interface EmailSequenceManagerProps {
  onPreviewEmail?: (templateId: number, emailItemId: number) => void
}

export default function EmailSequenceManager({ onPreviewEmail }: EmailSequenceManagerProps) {
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([])
  const [expandedTemplates, setExpandedTemplates] = useState<Set<number>>(new Set([1])) // Expand first by default
  const [loading, setLoading] = useState(true)
  const [previewLoading, setPreviewLoading] = useState<number | null>(null)
  const [previewData, setPreviewData] = useState<{ [key: number]: EmailPreviewData }>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('railsAuthToken')
      const response = await fetch('/api/v1/presents/email_campaign_templates', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data)
    } catch (error: any) {
      console.error('Failed to fetch email templates:', error)
      toast.error('Failed to load email sequences')
    } finally {
      setLoading(false)
    }
  }

  const toggleTemplate = (templateId: number) => {
    setExpandedTemplates((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  const handlePreviewEmail = async (templateId: number, emailItemId: number) => {
    try {
      setPreviewLoading(emailItemId)
      const token = localStorage.getItem('railsAuthToken')
      const response = await fetch(
        `/api/v1/presents/email_campaign_templates/${templateId}/preview/${emailItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) throw new Error('Failed to preview email')

      const data: EmailPreviewData = await response.json()
      setPreviewData((prev) => ({ ...prev, [emailItemId]: data }))

      // Open preview modal (you can customize this)
      openPreviewModal(data)
    } catch (error: any) {
      console.error('Failed to preview email:', error)
      toast.error('Failed to preview email')
    } finally {
      setPreviewLoading(null)
    }
  }

  const openPreviewModal = (data: EmailPreviewData) => {
    // Create a modal to show the preview
    const previewWindow = window.open('', '_blank', 'width=800,height=600')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${data.email_item.name} - Preview</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; }
            .header p { margin: 0; opacity: 0.9; font-size: 14px; }
            .meta { background: #f9f9f9; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
            .meta-item { margin: 5px 0; font-size: 13px; color: #666; }
            .meta-item strong { color: #333; }
            .content { padding: 20px; }
            .subject { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .badge-category { background: #e3f2fd; color: #1976d2; }
            .badge-trigger { background: #f3e5f5; color: #7b1fa2; }
            .badge-sample { background: #fff3e0; color: #e65100; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.email_item.name}</h1>
              <p>Email Template Preview</p>
            </div>
            <div class="meta">
              ${data.email_item.category ? `<div class="meta-item"><strong>Category:</strong> <span class="badge badge-category">${data.email_item.category}</span></div>` : ''}
              <div class="meta-item"><strong>Trigger:</strong> <span class="badge badge-trigger">${data.email_item.trigger_type}${data.email_item.trigger_value ? ` (${data.email_item.trigger_value} days)` : ''}</span></div>
              ${data.sample_data_used ? '<div class="meta-item"><span class="badge badge-sample">Using Sample Data</span></div>' : ''}
              <div class="meta-item"><strong>Position:</strong> #${data.email_item.position}</div>
            </div>
            <div class="content">
              <div class="subject"><strong>Subject:</strong> ${data.email_item.subject}</div>
              <div class="body">${data.email_item.body}</div>
            </div>
          </div>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const getTriggerLabel = (item: EmailTemplateItem) => {
    const type = item.trigger_type?.replace(/_/g, ' ') || 'N/A'
    const value = item.trigger_value

    if (value !== null && value !== undefined) {
      return `${value} days ${type}`
    }
    return type
  }

  const getCategoryVariant = (category: string | null): BadgeVariant => {
    if (!category) return 'tintMuted'

    const variants: Record<string, BadgeVariant> = {
      Artists: 'tintPurple',
      Vendors: 'tintBlue',
      event_announcements: 'tintPink',
      payment_reminders: 'tintGreen',
      event_countdown: 'tintOrange',
    }

    return variants[category] ?? 'tintMuted'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Email Sequences</h2>
          <p className="text-sm text-foreground/60">Manage and preview email campaign templates</p>
        </div>
        <Badge variant="tintPurple">
          {templates.length} {templates.length === 1 ? 'Sequence' : 'Sequences'}
        </Badge>
      </div>

      {templates.map((template) => {
        const isExpanded = expandedTemplates.has(template.id)
        const emailsByCategory = template.email_template_items.reduce(
          (acc, item) => {
            const category = item.category || 'General'
            if (!acc[category]) acc[category] = []
            acc[category].push(item)
            return acc
          },
          {} as { [key: string]: EmailTemplateItem[] },
        )

        return (
          <div
            key={template.id}
            className="bg-background/10 backdrop-blur-sm border border-border rounded-lg overflow-hidden"
          >
            {/* Template Header */}
            <button
              onClick={() => toggleTemplate(template.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-background/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-primary" />
                )}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                    {template.is_default && (
                      <Badge variant="tintGreen" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {template.template_type === 'system' && (
                      <Badge variant="tintBlue" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground/60 mt-1">{template.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Mail className="w-4 h-4" />
                  <span>{template.email_template_items.length} emails</span>
                </div>
                {template.usage_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Building2 className="w-4 h-4" />
                    <span>
                      {template.usage_count} {template.usage_count === 1 ? 'org' : 'orgs'}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border">
                {/* Organizations Using This Template */}
                {template.organizations_using.length > 0 && (
                  <div className="px-4 py-3 bg-blue-500/10 border-b border-border">
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Used by:</span>
                      <span>{template.organizations_using.map((org) => org.name).join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Email Items by Category */}
                <div className="p-4 space-y-4">
                  {Object.entries(emailsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wide">
                        {category} ({items.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-background/5 border border-border rounded-lg p-3 hover:bg-background/10 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-foreground/50">
                                    #{item.position}
                                  </span>
                                  {item.category && (
                                    <Badge
                                      variant={getCategoryVariant(item.category)}
                                      className="text-xs"
                                    >
                                      {item.category}
                                    </Badge>
                                  )}
                                </div>
                                <h5
                                  className="text-sm font-medium text-foreground truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </h5>
                                <p
                                  className="text-xs text-foreground/50 mt-1 truncate"
                                  title={item.subject_template}
                                >
                                  {item.subject_template}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-foreground/50 truncate">
                                {getTriggerLabel(item)}
                              </span>
                              <Button
                                onClick={() => handlePreviewEmail(template.id, item.id)}
                                disabled={previewLoading === item.id}
                                size="sm"
                                variant="outline"
                                className="bg-background/5 border-border text-foreground hover:bg-background/10 text-xs h-7 px-2"
                              >
                                {previewLoading === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
