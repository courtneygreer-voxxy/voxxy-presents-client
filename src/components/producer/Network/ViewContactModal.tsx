import { useState, useEffect } from 'react'
import { X, Pencil, Instagram, Music2, Globe, MapPin, Mail, Phone, Calendar } from 'lucide-react'
import { vendorContactsApi, VendorContact } from '@/services/api'

interface ViewContactModalProps {
  contact: VendorContact
  onClose: () => void
  onEdit: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-foreground/50 mb-0.5">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

const EMPTY = <span className="text-foreground/40">—</span>

/**
 * Read-only contact profile card. Shows the row data immediately, then enriches
 * with the full record (notes, event history) via getById. Edit switches to the
 * edit flow.
 */
export default function ViewContactModal({ contact, onClose, onEdit }: ViewContactModalProps) {
  const [full, setFull] = useState<VendorContact>(contact)

  useEffect(() => {
    let cancelled = false
    vendorContactsApi
      .getById(contact.id)
      .then((data) => {
        if (!cancelled) setFull(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [contact.id])

  const hasSocial = full.instagram_handle || full.tiktok_handle || full.website
  const hasAffiliation = !!full.affiliation

  return (
    <div
      className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="voxxy-modal-surface rounded-xl w-full max-w-2xl max-h-[82vh] flex flex-col">
        {/* Header */}
        <div className="voxxy-gradient-modal-header px-5 py-3 flex items-center justify-between border-b border-primary/20 flex-shrink-0 rounded-t-xl">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {full.last_name ? `${full.first_name} ${full.last_name}` : full.contact_name}
            </h2>
            {full.affiliation ? (
              <p className="text-foreground/50 text-[11px] mt-0.5 truncate">{full.affiliation}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg voxxy-btn-cta transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Contact details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Email">
              {full.email ? (
                <a
                  href={`mailto:${full.email}`}
                  className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {full.email}
                </a>
              ) : (
                EMPTY
              )}
            </Field>
            <Field label="Phone">
              {full.phone ? (
                <a
                  href={`tel:${full.phone}`}
                  className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {full.phone}
                </a>
              ) : (
                EMPTY
              )}
            </Field>
            <Field label="Location">
              {full.location ? (
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-foreground/50" />
                  {full.location}
                </span>
              ) : (
                EMPTY
              )}
            </Field>
            <Field label="Source">
              <span className="capitalize text-foreground/80">
                {full.source?.replace(/_/g, ' ') || 'Manual'}
              </span>
            </Field>
          </div>

          {/* Categories */}
          <Field label="Categories">
            {full.categories && full.categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {full.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-xs bg-primary/15 text-violet-950 dark:text-primary border border-primary/25"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            ) : (
              EMPTY
            )}
          </Field>

          {/* Tags */}
          <Field label="Tags">
            {full.tags && full.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {full.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-primary/15 text-violet-950 dark:text-primary border border-primary/25"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              EMPTY
            )}
          </Field>

          {/* Social */}
          {hasSocial && (
            <Field label="Social">
              <div className="flex flex-wrap items-center gap-3">
                {full.instagram_handle && (
                  <a
                    href={`https://instagram.com/${full.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-pink-500 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    {full.instagram_handle}
                  </a>
                )}
                {full.tiktok_handle && (
                  <a
                    href={`https://tiktok.com/@${full.tiktok_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    <Music2 className="w-3.5 h-3.5" />
                    {full.tiktok_handle}
                  </a>
                )}
                {full.website && (
                  <a
                    href={full.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
              </div>
            </Field>
          )}

          {/* Affiliation */}
          {hasAffiliation && (
            <Field label="Affiliation">{full.affiliation}</Field>
          )}

          {/* Notes */}
          <Field label="Notes">
            {full.notes ? (
              <p className="whitespace-pre-wrap text-foreground/80">{full.notes}</p>
            ) : (
              EMPTY
            )}
          </Field>

          {/* Event history */}
          {full.event_history && full.event_history.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Event History</h3>
                <span className="text-xs text-foreground/50">
                  ({full.total_applications || full.event_history.length} application
                  {(full.total_applications || full.event_history.length) !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {full.event_history.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-background/20 border border-border flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.event_name}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {event.category} • {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-background/10 transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg voxxy-btn-cta transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}
