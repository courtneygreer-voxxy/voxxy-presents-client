import { useState, useEffect } from 'react'
import { X, Save, Loader2, Mail, AlertCircle, Calendar, Filter, Clock, Tag } from 'lucide-react'
import type {
  EmailTemplateItem,
  FilterCriteria,
  RegistrationStatus,
  PaymentStatus,
} from '@/types/email'
import { RichTextEditor } from './RichTextEditor'

interface EmailTemplateItemEditorProps {
  item: EmailTemplateItem | null
  templateId: number
  isOpen: boolean
  onClose: () => void
  onSave: (item: EmailTemplateItem) => void
}

const CATEGORY_OPTIONS = [
  { value: 'event_announcements', label: 'Event Announcements' },
  { value: 'application_updates', label: 'Application Updates' },
  { value: 'payment_reminders', label: 'Payment Reminders' },
  { value: 'art_calls', label: 'Art Calls' },
  { value: 'artist_payment', label: 'Artist Payment' },
  { value: 'vendor_payment', label: 'Vendor Payment' },
  { value: 'artist_countdown', label: 'Artist Countdown' },
  { value: 'vendor_countdown', label: 'Vendor Countdown' },
]

const TRIGGER_TYPE_OPTIONS = [
  { value: 'on_invitation_send', label: 'On Invitation Send' },
  { value: 'on_application_submit', label: 'On Application Submit' },
  { value: 'on_approval', label: 'On Approval' },
  { value: 'on_waitlist', label: 'On Waitlist' },
  { value: 'on_rejection', label: 'On Rejection' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline' },
  { value: 'days_before_deadline', label: 'Days Before Deadline' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Deadline' },
  { value: 'days_before_event', label: 'Days Before Event' },
]

export default function EmailTemplateItemEditor({
  item,
  templateId,
  isOpen,
  onClose,
  onSave,
}: EmailTemplateItemEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'application_updates',
    subject_template: '',
    body_template: '',
    trigger_type: 'on_application_submit',
    trigger_value: 0,
    trigger_time: '09:00:00',
    enabled_by_default: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter criteria state
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string[]>([])
  const [filterVendorCategory, setFilterVendorCategory] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'application_updates',
        subject_template: item.subject_template || '',
        body_template: item.body_template || '',
        trigger_type: item.trigger_type || 'on_application_submit',
        trigger_value: item.trigger_value || 0,
        trigger_time: item.trigger_time || '09:00:00',
        enabled_by_default: item.enabled_by_default !== false,
      })

      // Parse filter criteria
      if (item.filter_criteria) {
        setFilterStatus(item.filter_criteria.status || [])
        setFilterPaymentStatus(item.filter_criteria.payment_status || [])
        const vendorCat = item.filter_criteria.vendor_category
        setFilterVendorCategory(Array.isArray(vendorCat) ? vendorCat[0] || '' : vendorCat || '')
      }
    }
  }, [item])

  const handleSave = async () => {
    if (!item) return

    if (!formData.name.trim()) {
      setError('Email name is required')
      return
    }

    if (!formData.subject_template.trim()) {
      setError('Subject template is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Build filter criteria
      const filter_criteria: FilterCriteria = {}
      if (filterStatus.length > 0) filter_criteria.status = filterStatus as RegistrationStatus[]
      if (filterPaymentStatus.length > 0)
        filter_criteria.payment_status = filterPaymentStatus as PaymentStatus[]
      if (filterVendorCategory) filter_criteria.vendor_category = [filterVendorCategory]

      const updatedItem = {
        ...item,
        name: formData.name,
        category: formData.category as any,
        subject_template: formData.subject_template,
        body_template: formData.body_template,
        trigger_type: formData.trigger_type as any,
        trigger_value: formData.trigger_value,
        trigger_time: formData.trigger_time,
        enabled_by_default: formData.enabled_by_default,
        filter_criteria,
      }

      onSave(updatedItem as EmailTemplateItem)
    } catch (err: any) {
      setError(err.message || 'Failed to save email')
    } finally {
      setIsSaving(false)
    }
  }

  const requiresTriggerValue = formData.trigger_type.includes('days_before')

  if (!isOpen || !item) return null

  return (
    <div className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Edit Email</h2>
              <p className="text-sm text-foreground/60">
                Customize subject, body, and trigger settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background/5 text-foreground/60 hover:text-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Basic Information
            </h3>

            {/* Name */}
            <div>
              <label
                htmlFor="email-name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Name *
              </label>
              <input
                id="email-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Email"
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={100}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                Subject Template *
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject_template}
                onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                placeholder="e.g., Welcome to [eventName]!"
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={200}
              />
              <p className="mt-1 text-xs text-foreground/40">
                Use [eventName], [firstName], etc. for dynamic content
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Body
            </h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Body Template *
              </label>
              <RichTextEditor
                content={formData.body_template}
                onChange={(value) => setFormData({ ...formData, body_template: value })}
                placeholder="Write your email content here..."
              />
              <p className="mt-2 text-xs text-foreground/40">
                Available variables: [firstName], [eventName], [eventDate], [applicationLink],
                [paymentLink], [unsubscribeLink]
              </p>
            </div>
          </div>

          {/* Trigger Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Trigger Settings
            </h3>

            {/* Trigger Type */}
            <div>
              <label
                htmlFor="trigger-type"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Trigger Type
              </label>
              <select
                id="trigger-type"
                value={formData.trigger_type}
                onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {TRIGGER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger Value (for days_before triggers) */}
            {requiresTriggerValue && (
              <div>
                <label
                  htmlFor="trigger-value"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Days Before
                </label>
                <input
                  id="trigger-value"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.trigger_value}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_value: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {/* Trigger Time */}
            <div>
              <label
                htmlFor="trigger-time"
                className="block text-sm font-medium text-foreground mb-2"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Send Time
              </label>
              <input
                id="trigger-time"
                type="time"
                value={formData.trigger_time?.slice(0, 5) || '09:00'}
                onChange={(e) => setFormData({ ...formData, trigger_time: e.target.value + ':00' })}
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Filter Criteria */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Recipient Filters
            </h3>
            <p className="text-xs text-foreground/60">
              Only send this email to recipients matching these criteria (leave empty for all
              recipients)
            </p>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'approved', 'waitlist', 'declined', 'confirmed'].map((status) => (
                  <label
                    key={status}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/5 border border-border cursor-pointer hover:bg-background/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filterStatus.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterStatus([...filterStatus, status])
                        } else {
                          setFilterStatus(filterStatus.filter((s) => s !== status))
                        }
                      }}
                      className="w-4 h-4 rounded border-border bg-background/5 text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm text-foreground capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'paid', 'overdue'].map((status) => (
                  <label
                    key={status}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/5 border border-border cursor-pointer hover:bg-background/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filterPaymentStatus.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterPaymentStatus([...filterPaymentStatus, status])
                        } else {
                          setFilterPaymentStatus(filterPaymentStatus.filter((s) => s !== status))
                        }
                      }}
                      className="w-4 h-4 rounded border-border bg-background/5 text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm text-foreground capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Vendor Category Filter */}
            <div>
              <label
                htmlFor="vendor-category"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Vendor Category
              </label>
              <select
                id="vendor-category"
                value={filterVendorCategory}
                onChange={(e) => setFilterVendorCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Categories</option>
                <option value="Artist">Artist</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
          </div>

          {/* Enabled By Default */}
          <div>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled_by_default}
                onChange={(e) => setFormData({ ...formData, enabled_by_default: e.target.checked })}
                className="w-5 h-5 rounded border-border bg-background/5 text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-foreground">
                Enabled by default when creating new events
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg voxxy-btn-cta font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
