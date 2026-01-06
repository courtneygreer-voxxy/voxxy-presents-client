import { Star, Instagram, Music2, Globe, Clock, Pencil, Trash2, MapPin } from 'lucide-react';
import { VendorContact } from '@/services/api';

interface ContactRowProps {
  contact: VendorContact;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleFeatured?: (contactId: number) => void;
}

export default function ContactRow({
  contact,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onToggleFeatured,
}: ContactRowProps) {
  // Category badge colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Artist': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Table Vendor': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Sponsor': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Food & Beverage': 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[category] || 'bg-white/10 text-white/70 border-white/20';
  };

  const displayTags = contact.tags?.slice(0, 2) || [];
  const remainingTagsCount = (contact.tags?.length || 0) - 2;

  return (
    <div className="grid grid-cols-[auto,180px,160px,140px,160px,140px,140px,100px,60px,60px,110px] gap-3 px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 items-center text-xs">
      {/* Checkbox */}
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
        />
      </div>

      {/* Name */}
      <div className="min-w-0">
        <div className="font-semibold text-white truncate text-xs">{contact.contact_name}</div>
      </div>

      {/* Business */}
      <div className="min-w-0">
        <div className="text-white/70 truncate text-xs">
          {contact.business_name || '—'}
        </div>
      </div>

      {/* Category */}
      <div className="min-w-0">
        <div className="flex flex-wrap gap-0.5">
          {contact.categories && contact.categories.length > 0 ? (
            contact.categories.slice(0, 1).map((category) => (
              <span
                key={category}
                className={`px-1.5 py-0.5 text-[10px] rounded border truncate ${getCategoryColor(category)}`}
              >
                {category}
              </span>
            ))
          ) : (
            <span className="text-white/40 text-xs">—</span>
          )}
          {contact.categories && contact.categories.length > 1 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-white/10 text-white/50 rounded border border-white/20">
              +{contact.categories.length - 1}
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="min-w-0">
        <div className="flex flex-wrap gap-0.5">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-purple-500/10 text-purple-300 rounded border border-purple-500/20 truncate"
            >
              #{tag}
            </span>
          ))}
          {remainingTagsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-white/10 text-white/50 rounded border border-white/20">
              +{remainingTagsCount}
            </span>
          )}
          {(!contact.tags || contact.tags.length === 0) && (
            <span className="text-white/40 text-xs">—</span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="min-w-0">
        <a
          href={`mailto:${contact.email}`}
          className="text-white/70 hover:text-purple-400 transition-colors truncate block text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {contact.email}
        </a>
      </div>

      {/* Phone */}
      <div className="min-w-0">
        {contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className="text-white/70 hover:text-purple-400 transition-colors truncate block text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {contact.phone}
          </a>
        ) : (
          <span className="text-white/40 text-xs">—</span>
        )}
      </div>

      {/* Location */}
      <div className="min-w-0">
        {contact.location ? (
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0 text-white/50" />
            <span className="truncate">{contact.location}</span>
          </div>
        ) : (
          <span className="text-white/40 text-xs">—</span>
        )}
      </div>

      {/* Social */}
      <div className="flex items-center gap-1.5">
        {contact.instagram_handle && (
          <a
            href={`https://instagram.com/${contact.instagram_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
            title="Portfolio"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
        {!contact.instagram_handle && !contact.tiktok_handle && !contact.website && (
          <span className="text-white/40 text-xs">—</span>
        )}
      </div>

      {/* Hist (Interaction History) */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 text-white/60" title={`${contact.interaction_count || 0} interactions`}>
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">{contact.interaction_count || 0}</span>
        </div>
      </div>

      {/* Voxxy Star (Featured) */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured?.(contact.id);
          }}
          className={`transition-all ${
            contact.featured
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-white/30 hover:text-white/50'
          }`}
          title={contact.featured ? 'Featured' : 'Not featured'}
        >
          <Star className={`w-4 h-4 ${contact.featured ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={onEdit}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white/90 rounded transition-colors"
          title="Edit contact"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
          title="Delete contact"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
