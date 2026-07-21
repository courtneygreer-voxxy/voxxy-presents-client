import { memo, useState } from 'react'
import {
  Instagram,
  Music2,
  Globe,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  MoreVertical,
  MailX,
} from 'lucide-react'
import { VendorContact } from '@/services/api'
import { TABLE_ROW_CLASSES } from '@/components/shared/tableStyles'

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Artist: 'bg-primary/20 text-violet-950 dark:text-primary border-primary/30',
    'Table Vendor': 'bg-blue-500/20 text-blue-950 dark:text-blue-300 border-blue-500/30',
    Sponsor: 'bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-500/30',
    'Food & Beverage': 'bg-green-500/20 text-emerald-900 dark:text-green-300 border-green-500/30',
  }
  return colors[category] || 'bg-background/10 text-foreground/70 border-border'
}

interface ContactRowProps {
  contact: VendorContact
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  onView: () => void
}

export default memo(function ContactRow({
  contact,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onView,
}: ContactRowProps) {
  const [showMenu, setShowMenu] = useState(false)

  const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed

  return (
    <div className="voxxy-table-row voxxy-table-row-hover last:border-0">
      <div
        className={`grid grid-cols-[28px,minmax(80px,0.8fr),minmax(90px,1fr),minmax(110px,1.2fr),minmax(90px,1fr),90px,90px,80px,60px,minmax(70px,0.8fr),50px] px-2 py-2 ${TABLE_ROW_CLASSES} ${isUnsubscribed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-3.5 h-3.5 rounded border-border bg-background/10 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1"
          />
        </div>

        {/* First Name */}
        <div className="min-w-0">
          <span className="font-semibold text-foreground truncate block">{contact.first_name || '—'}</span>
        </div>

        {/* Last Name */}
        <div className="min-w-0">
          <div className="text-foreground truncate flex items-center gap-1">
            {contact.last_name || '—'}
            {isUnsubscribed && (
              <span className="px-1 py-0.5 text-[8px] bg-red-500/20 text-red-950 dark:text-red-400 border border-red-500/30 rounded flex-shrink-0">
                UNSUB
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <a
              href={`mailto:${contact.email}`}
              className="text-foreground/70 hover:text-primary transition-colors truncate block"
              onClick={(e) => e.stopPropagation()}
              title={contact.email}
            >
              {contact.email}
            </a>
            {contact.unsubscribe_status?.is_unsubscribed && (
              <div
                className="flex-shrink-0 p-0.5 rounded bg-red-500/20 text-red-950 dark:text-red-400 border border-red-500/30"
                title={`Unsubscribed (${contact.unsubscribe_status.scope || 'unknown'})`}
              >
                <MailX className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>

        {/* Affiliation */}
        <div className="min-w-0">
          <span className="text-foreground/60 truncate block">{contact.affiliation || '—'}</span>
        </div>

        <div className="min-w-0">
          {contact.location ? (
            <div className="flex items-center gap-0.5 text-foreground/70">
              <MapPin className="w-3 h-3 flex-shrink-0 text-foreground/50" />
              <span className="truncate">{contact.location}</span>
            </div>
          ) : (
            <span className="text-foreground/40">—</span>
          )}
        </div>

        <div className="min-w-0">
          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="text-foreground/70 hover:text-primary transition-colors truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {contact.phone}
            </a>
          ) : (
            <span className="text-foreground/40">—</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-0.5">
            {contact.categories && contact.categories.length > 0 ? (
              contact.categories.slice(0, 1).map((category) => (
                <span
                  key={category}
                  className={`px-1 py-0.5 text-[9px] rounded border truncate ${getCategoryColor(category)}`}
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="text-foreground/40">—</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {contact.instagram_handle && (
            <a
              href={`https://instagram.com/${contact.instagram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors"
              title={contact.instagram_handle}
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.tiktok_handle && (
            <a
              href={`https://tiktok.com/@${contact.tiktok_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
              title={contact.tiktok_handle}
            >
              <Music2 className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.website && (
            <a
              href={contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
          {!contact.instagram_handle && !contact.tiktok_handle && !contact.website && (
            <span className="text-foreground/40">—</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-0.5">
            {contact.tags && contact.tags.length > 0 ? (
              contact.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1 py-0.5 text-[9px] bg-primary/10 text-violet-950 dark:text-primary rounded border border-primary/20 truncate"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-foreground/40">—</span>
            )}
            {(contact.tags?.length || 0) > 2 && (
              <span className="px-1 py-0.5 text-[9px] text-muted-foreground">
                +{(contact.tags?.length || 0) - 2}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1.5 hover:bg-accent/50 text-foreground/70 hover:text-foreground rounded transition-colors relative z-0"
            title="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <div
                className="fixed z-[101] min-w-[120px] rounded-lg border border-border bg-card/95 py-1 shadow-xl dark:bg-[rgba(44,32,70,0.96)]"
                style={{
                  right: '20px',
                  top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 4}px`,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onView()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent/60 dark:hover:bg-background/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEdit()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent/60 dark:hover:bg-background/10"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
