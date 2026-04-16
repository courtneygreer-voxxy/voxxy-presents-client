import { useState } from 'react';
import { Instagram, Music2, Globe, Clock, Pencil, Trash2, MapPin, MoreVertical, ChevronDown, ChevronUp, MailX } from 'lucide-react';
import { VendorContact } from '@/services/api';

interface ContactRowProps {
  contact: VendorContact;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function ContactRow({
  contact,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: ContactRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Category badge colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Artist': 'bg-purple-500/20 text-violet-950 dark:text-purple-300 border-purple-500/30',
      'Table Vendor': 'bg-blue-500/20 text-blue-950 dark:text-blue-300 border-blue-500/30',
      'Sponsor': 'bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-500/30',
      'Food & Beverage': 'bg-green-500/20 text-emerald-900 dark:text-green-300 border-green-500/30',
    };
    return colors[category] || 'bg-background/10 text-foreground/70 border-border';
  };

  const displayTags = contact.tags?.slice(0, 2) || [];
  const remainingTagsCount = (contact.tags?.length || 0) - 2;

  const isUnsubscribed = contact.unsubscribe_status?.is_unsubscribed;

  return (
    <div className="hover:bg-background/5 transition-colors border-b border-border last:border-0">
      {/* Condensed Layout - All screen sizes */}
      <div>
        {/* Main Row - Clickable to expand */}
        <div className={`grid grid-cols-[28px,1fr,140px,120px,130px,100px,80px,1fr,70px] gap-2 px-2 py-2 items-center text-[11px] ${isUnsubscribed ? 'opacity-60' : ''}`}>
          {/* Checkbox */}
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-3.5 h-3.5 rounded border-border bg-background/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
            />
          </div>

          {/* Name - Clickable to expand */}
          <div className="min-w-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="font-semibold text-foreground truncate flex items-center gap-1">
              {contact.contact_name}
              {isUnsubscribed && (
                <span className="px-1 py-0.5 text-[8px] bg-red-500/20 text-red-950 dark:text-red-400 border border-red-500/30 rounded flex-shrink-0">
                  UNSUB
                </span>
              )}
              {isExpanded ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />}
            </div>
          </div>

          {/* Business */}
          <div className="min-w-0">
            <div className="text-foreground/70 truncate">
              {contact.business_name || '—'}
            </div>
          </div>

          {/* Location */}
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

          {/* Phone */}
          <div className="min-w-0">
            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="text-foreground/70 hover:text-purple-400 transition-colors truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.phone}
              </a>
            ) : (
              <span className="text-foreground/40">—</span>
            )}
          </div>

          {/* Category */}
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

          {/* Social */}
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

          {/* Email */}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <a
                href={`mailto:${contact.email}`}
                className="text-foreground/70 hover:text-purple-400 transition-colors truncate block flex-1"
                onClick={(e) => e.stopPropagation()}
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

          {/* Actions */}
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-background/10 text-foreground/70 hover:text-foreground rounded transition-colors relative z-0"
              title="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowMenu(false)}
                />
                <div className="fixed z-[101] bg-muted border border-border rounded-lg shadow-xl py-1 min-w-[120px]"
                  style={{
                    right: '20px',
                    top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 4}px`
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-2 pb-2 pt-1 bg-background/[0.02] border-t border-border opacity-100">
            <div className="text-[10px] space-y-2">
              {/* Unsubscribe Status */}
              {isUnsubscribed && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <div className="flex items-center gap-1 text-red-400">
                    <MailX className="w-3 h-3" />
                    <span className="font-semibold">Unsubscribed</span>
                  </div>
                  <div className="text-red-400/70 mt-0.5">
                    Scope: <span className="capitalize">{contact.unsubscribe_status?.scope || 'Unknown'}</span>
                  </div>
                  <div className="text-red-400/60 mt-0.5 text-[9px]">
                    This contact will not receive emails from you
                    {contact.unsubscribe_status?.scope === 'global' && ' (all organizations)'}
                    {contact.unsubscribe_status?.scope === 'organization' && ' (your organization)'}
                    {contact.unsubscribe_status?.scope === 'event' && ' (specific events)'}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <span className="text-foreground/50">Tags:</span>{' '}
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {contact.tags && contact.tags.length > 0 ? (
                    contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1 py-0.5 text-[9px] bg-purple-500/10 text-violet-950 dark:text-purple-300 rounded border border-purple-500/20"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-foreground/40">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
