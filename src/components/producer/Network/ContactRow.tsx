import { Building2, Mail, Phone, Pencil, Trash2, Calendar } from 'lucide-react';
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
  // Limit tags display to 3 max
  const displayTags = contact.tags?.slice(0, 3) || [];
  const remainingTagsCount = (contact.tags?.length || 0) - 3;

  return (
    <div className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-start gap-4">
        {/* Left: Checkbox + Name & Notes */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <div className="pt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-1"
            />
          </div>

          {/* Name, Business & Notes */}
          <div className="flex-1 min-w-0">
            {/* Name & Business - Inline */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white">
                {contact.contact_name}
              </h3>
              {contact.business_name && (
                <>
                  <span className="text-white/30">•</span>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-sm truncate">{contact.business_name}</span>
                  </div>
                </>
              )}
              {contact.job_title && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-xs text-white/50 truncate">
                    {contact.job_title}
                  </span>
                </>
              )}
            </div>

            {/* Notes - Compact */}
            {contact.notes && (
              <p className="text-xs text-white/50 line-clamp-1 pr-4">
                {contact.notes}
              </p>
            )}
          </div>
        </div>

        {/* Center: Contact Info & Tags */}
        <div className="flex flex-col gap-2 min-w-0" style={{ width: '380px' }}>
          {/* Contact Details Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {/* Email */}
            <div className="flex items-center gap-1.5 text-white/60">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-purple-400 transition-colors truncate max-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.email}
              </a>
            </div>

            {/* Phone */}
            {contact.phone && (
              <div className="flex items-center gap-1.5 text-white/60">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-purple-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contact.phone}
                </a>
              </div>
            )}
          </div>

          {/* Tags & Stats Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tags */}
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-white/10 text-white/50 rounded-md">
                +{remainingTagsCount}
              </span>
            )}

            {/* Stats */}
            {contact.events_participated !== undefined && contact.events_participated > 0 && (
              <span className="px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded-md flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {contact.events_participated}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs rounded-md transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-md transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
